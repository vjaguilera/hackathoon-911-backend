import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthenticatedRequest } from '../middleware/auth';

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
    const userId = req.user?.uid;
    const { event_type, description, location, audio_recording_url } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    if (!event_type || !description || !location) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'event_type, description, and location are required'
      });
    }

    const emergencyEvent = await prisma.emergency_events.create({
      data: {
        user_id: userId,
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