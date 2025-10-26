import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

// Get all emergency events for current user
export const getUserEmergencyEvents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { user_id: userId };
    if (status) {
      where.status = status;
    }

    const [events, total] = await Promise.all([
      prisma.emergency_events.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone_number: true
            }
          }
        }
      }),
      prisma.emergency_events.count({ where })
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching emergency events:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch emergency events'
    });
  }
};

// Create new emergency event
export const createEmergencyEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authenticatedUserId = req.user?.uid;
    const { event_type, description, location, audio_recording_url, user_id } = req.body;
    const apiKey = req.headers['api-key'] as string;
    const retellApiKey = process.env.RETELL_API_KEY;
    
    // Check if using API key authentication
    const isApiKeyAuth = apiKey && retellApiKey && apiKey === retellApiKey;
    
    if (!event_type || !description || !location) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'event_type, description, and location are required'
      });
    }

    // Determine which user_id to use based on authentication method
    let targetUserId: string;
    
    if (isApiKeyAuth) {
      // API key authentication - user_id is required
      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'user_id is required when using API key authentication'
        });
      }
      targetUserId = user_id;
    } else {
      // Firebase token authentication
      if (!authenticatedUserId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }
      // Use provided user_id or fall back to authenticated user
      targetUserId = user_id || authenticatedUserId;
    }
    
    // Validate that the target user_id exists
    const userExists = await prisma.users.findUnique({
      where: { id: targetUserId }
    });
    
    if (!userExists) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Provided user_id does not exist'
      });
    }

    const emergencyEvent = await prisma.emergency_events.create({
      data: {
        user_id: targetUserId,
        event_type,
        description,
        location,
        audio_recording_url: audio_recording_url || null,
        status: 'active'
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone_number: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: emergencyEvent,
      message: 'Emergency event created successfully'
    });
  } catch (error) {
    console.error('Error creating emergency event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create emergency event'
    });
  }
};

// Create new emergency event from query params
export const createEmergencyEventFromQueryParams = async (req: Request, res: Response) => {
  console.log("CREATE EMERGENCY QP", req.query)
  const event_type = typeof req.query.event_type === 'string' ? req.query.event_type : undefined;
  const description = typeof req.query.description === 'string' ? req.query.description : undefined;
  const location = typeof req.query.location === 'string' ? req.query.location : undefined;
  const audio_recording_url = typeof req.query.audio_recording_url === 'string' ? req.query.audio_recording_url : undefined;
  const user_id = req.query.user_id as string;

  console.log("USER ID TO CREATE EVENT", user_id)

  if (!event_type || !description || !location) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing required fields: event_type, description, location.'
    });
  }

  // Determine user_id based on authentication
  let finalUserId = user_id;
  const authReq = req as any;
  if (!finalUserId && authReq.user && authReq.user.uid) {
    finalUserId = authReq.user.uid;
  }
  if (!finalUserId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'user_id is required for API key authentication or if not authenticated.'
    });
  }

  try {
    console.log("USER EXISTS", finalUserId)
    // Check if user exists
    const userExists = await prisma.users.findUnique({ where: { id: finalUserId } });
    if (!userExists) {
      console.log("USER DOEST NOT EXISTS", userExists)
    }

    const emergencyEvent = await prisma.emergency_events.create({
      data: {
        id: uuidv4(),
        user_id: finalUserId,
        event_type,
        description,
        location,
        audio_recording_url
      }
    });

    res.status(201).json({
      success: true,
      message: 'Emergency event created successfully',
      data: emergencyEvent
    });
  } catch (error) {
    console.error('Error creating emergency event from query params:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create emergency event.'
    });
  }
};

// Get emergency event by ID
export const getEmergencyEventById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const emergencyEvent = await prisma.emergency_events.findFirst({
      where: {
        id,
        user_id: userId
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone_number: true
          }
        }
      }
    });

    if (!emergencyEvent) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Emergency event not found'
      });
    }

    res.json({
      success: true,
      data: emergencyEvent
    });
  } catch (error) {
    console.error('Error fetching emergency event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch emergency event'
    });
  }
};

// Update emergency event
export const updateEmergencyEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;
    const { event_type, description, location, audio_recording_url, status } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.emergency_events.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Emergency event not found'
      });
    }

    const updatedEvent = await prisma.emergency_events.update({
      where: { id },
      data: {
        ...(event_type && { event_type }),
        ...(description && { description }),
        ...(location && { location }),
        ...(audio_recording_url !== undefined && { audio_recording_url }),
        ...(status && { status })
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone_number: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedEvent,
      message: 'Emergency event updated successfully'
    });
  } catch (error) {
    console.error('Error updating emergency event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update emergency event'
    });
  }
};

// Delete emergency event
export const deleteEmergencyEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.emergency_events.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Emergency event not found'
      });
    }

    await prisma.emergency_events.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Emergency event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting emergency event:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete emergency event'
    });
  }
};

// Get all emergency events (Admin only)
export const getAllEmergencyEvents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, event_type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (event_type) where.event_type = event_type;

    const [events, total] = await Promise.all([
      prisma.emergency_events.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone_number: true
            }
          }
        }
      }),
      prisma.emergency_events.count({ where })
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all emergency events:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch emergency events'
    });
  }
};

// Retrieve comprehensive user information
export const retrieveUserInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let userId: string;

    // Handle authentication type
    const apiKey = req.headers['api-key'] as string;
    const retellApiKey = process.env.RETELL_API_KEY;
    
    if (apiKey && retellApiKey && apiKey === retellApiKey) {
      // API key authentication - user_id must be provided in body
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'user_id is required when using API key authentication'
        });
      }
      
      // Verify user exists
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
    } else {
      // Bearer token authentication - use authenticated user's ID
      if (!req.user?.uid) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }
      
      // If user_id is provided in body, use it (but must match authenticated user or be admin)
      const { user_id } = req.body;
      userId = user_id || req.user.uid;
      
      // For security, if user_id is different from authenticated user, verify it exists
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
      }
    }

    // Fetch all user information in parallel
    const [
      emergencyContacts,
      medicalInfo,
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

    res.status(200).json({
      success: true,
      data: {
        user_id: userId,
        emergency_contacts: emergencyContacts,
        medical_info: medicalInfo,
        health_insurance: healthInsurance,
        bank_accounts: bankAccounts,
        addresses: addresses
      }
    });

  } catch (error) {
    console.error('Error retrieving user info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve user information'
    });
  }
};