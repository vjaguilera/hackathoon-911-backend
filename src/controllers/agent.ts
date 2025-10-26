import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../utils/database';

// Validation schema for agent compute request
const agentComputeSchema = z.object({
  user_id: z.string().uuid().optional() // Optional for bearer token auth, required for API key auth
});

export const agentCompute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate request body
    const validatedData = agentComputeSchema.parse(req.body);
    let { user_id } = validatedData;

    // Check for required environment variables
    const agentApiUrl = process.env.AGENT_API_URL;
    const agentApiKey = process.env.AGENT_API_KEY;

    if (!agentApiUrl || !agentApiKey) {
      return res.status(500).json({
        success: false,
        message: 'Agent API configuration is missing',
        error: 'AGENT_API_URL or AGENT_API_KEY environment variables are not set'
      });
    }

    // Determine the user ID to use
    let userId: string;
    
    if (req.user?.uid) {
      // Bearer token authentication - use authenticated user's ID
      userId = req.user.uid;
      
      // If user_id is provided and different from authenticated user, verify it exists (for admin access)
      if (user_id && user_id !== req.user.uid) {
        const userExists = await prisma.users.findUnique({
          where: { id: user_id }
        });
        
        if (!userExists) {
          return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Provided user_id does not exist'
          });
        }
        userId = user_id;
      }
    } else {
      // API key authentication - user_id is required
      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'user_id is required when using API key authentication'
        });
      }
      userId = user_id;
    }

    // Fetch all required user data in parallel
    const [
      emergencyContacts,
      medicalInfo,
      userData,
      healthInsurance,
      bankAccounts,
      addresses
    ] = await Promise.all([
      // Emergency contacts
      prisma.emergency_contacts.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      }),
      
      // Medical info
      prisma.medical_info.findUnique({
        where: { user_id: userId }
      }),
      
      // User data
      prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          full_name: true,
          phone_number: true,
          rut: true,
          profile_picture_url: true,
          created_at: true,
          updated_at: true
        }
      }),
      
      // Health insurance
      prisma.health_insurance.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      }),
      
      // Bank accounts
      prisma.bank_accounts.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      }),
      
      // Addresses
      prisma.addresses.findMany({
        where: { user_id: userId },
        orderBy: [
          { is_primary: 'desc' }, // Primary addresses first
          { created_at: 'desc' }
        ]
      })
    ]);

    // Check if user exists
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Prepare the request payload for Agent API
    const agentRequestBody = {
      emergency_contacts: emergencyContacts,
      medical_info: medicalInfo,
      user_data: userData,
      health_insurance: healthInsurance,
      bank_accounts: bankAccounts,
      addresses: addresses
    };

    // Construct the Agent API endpoint URL
    const agentApiEndpoint = `${agentApiUrl}/agent_compute`;

    // Make the API call to Agent API
    const response = await axios.post(agentApiEndpoint, agentRequestBody, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': agentApiKey
      }
    });

    // Return the Agent API response directly
    res.status(200).json({
      success: true,
      message: 'Agent compute completed successfully',
      data: response.data
    });

  } catch (error: any) {
    console.error('Error in agent compute:', error);

    if (error instanceof z.ZodError) {
      // Validation error
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;
      
      console.error('Agent API Error:', error.response?.data);
      return res.status(500).json({
        success: false,
        message: 'Agent API request failed',
        error: `Agent API returned ${statusCode}: ${errorMessage}`
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};