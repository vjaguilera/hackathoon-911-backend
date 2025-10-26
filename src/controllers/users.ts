import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthenticatedRequest } from '../middleware/auth';

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        profile_picture_url: true,
        created_at: true,
        updated_at: true,
      }
    });
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch users'
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        medical_info: true,
        emergency_contacts: true,
        vehicles: true,
        addresses: true,
        bank_accounts: true,
        health_insurance: true,
        supplementary_insurance: true,
        emergency_events: {
          orderBy: {
            created_at: 'desc'
          },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch user profile'
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        profile_picture_url: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch user'
    });
  }
};

// Update current user profile
export const updateCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { full_name, phone_number, profile_picture_url, rut } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate RUT format if provided
    if (rut) {
      const { validateRutFormat, formatRut } = await import('../utils/validation');
      
      if (!validateRutFormat(rut)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid RUT format. Expected format: 12345678-9'
        });
      }

      const formattedRut = formatRut(rut);
      
      // Check if RUT is already taken by another user
      const existingUser = await prisma.users.findFirst({
        where: { 
          rut: formattedRut,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'RUT is already registered by another user'
        });
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(full_name && { full_name }),
        ...(phone_number && { phone_number }),
        ...(profile_picture_url && { profile_picture_url }),
        ...(rut && { rut: (await import('../utils/validation')).formatRut(rut) }),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone_number: true,
        rut: true,
        profile_picture_url: true,
        created_at: true,
        updated_at: true,
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update user profile'
    });
  }
};

// Delete current user account
export const deleteCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.users.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete account'
    });
  }
};

// Get user by RUT (authenticated endpoint)
export const getUserByRut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rut } = req.params;
    
    if (!rut) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'RUT parameter is required'
      });
    }

    // Import validation function
    const { validateRutFormat, formatRut } = await import('../utils/validation');
    
    // Validate RUT format
    if (!validateRutFormat(rut)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid RUT format. Expected format: 12345678-9'
      });
    }

    // Format RUT (convert to uppercase if needed)
    const formattedRut = formatRut(rut);
    
    // Find user by RUT
    const user = await prisma.users.findUnique({
      where: { rut: formattedRut },
      select: {
        id: true,
        email: true,
        full_name: true,
        rut: true,
        phone_number: true,
        profile_picture_url: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found with the provided RUT'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user by RUT:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch user by RUT'
    });
  }
};

// Get user by phone number
export const getUserByPhoneNumber = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Phone number parameter is required'
      });
    }

    // Remove "+" character if present
    const formattedPhoneNumber = phoneNumber.replace(/^\+/, '');
    
    // Basic phone number validation (check if it's numeric after removing +)
    if (!/^\d+$/.test(formattedPhoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid phone number format. Phone number should contain only digits (+ is allowed at the beginning)'
      });
    }

    // Find user by phone number (search both with and without + prefix)
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { phone_number: formattedPhoneNumber },
          { phone_number: `+${formattedPhoneNumber}` }
        ]
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        rut: true,
        phone_number: true,
        profile_picture_url: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found with the provided phone number'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user by phone number:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch user by phone number'
    });
  }
};

// Search user by RUT or phone number
export const searchUser = async (req: Request, res: Response) => {
  const rut = typeof req.query.rut === 'string' ? req.query.rut : undefined;
  const phone_number = typeof req.query.phone_number === 'string' ? req.query.phone_number : undefined;

  if (!rut && !phone_number) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Please provide either rut or phone_number as query parameters.'
    });
  }

  try {
    let user = null;
    if (rut) {
      user = await prisma.users.findUnique({ where: { rut } });
    } else if (phone_number) {
      user = await prisma.users.findFirst({ where: { phone_number } });
    }

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found.'
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search user.'
    });
  }
};