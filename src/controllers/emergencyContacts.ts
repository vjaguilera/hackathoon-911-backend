import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../utils/database';
import { z } from 'zod';

// Validation schemas
const createEmergencyContactSchema = z.object({
  contact_name: z.string().min(1, 'Contact name is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  email: z.string().email().optional().or(z.literal(''))
});

const updateEmergencyContactSchema = z.object({
  contact_name: z.string().min(1, 'Contact name is required').optional(),
  phone_number: z.string().min(1, 'Phone number is required').optional(),
  relationship: z.string().min(1, 'Relationship is required').optional(),
  email: z.string().email().optional().or(z.literal(''))
});

// Get all emergency contacts for the authenticated user
export const getUserEmergencyContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const emergencyContacts = await prisma.emergency_contacts.findMany({
      where: { user_id: req.user.uid },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ 
      success: true,
      data: emergencyContacts 
    });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to fetch emergency contacts' 
    });
  }
};

// Get a specific emergency contact by ID
export const getEmergencyContactById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const { id } = req.params;

    const emergencyContact = await prisma.emergency_contacts.findFirst({
      where: { 
        id: id,
        user_id: req.user.uid 
      }
    });

    if (!emergencyContact) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Emergency contact not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      data: emergencyContact 
    });
  } catch (error) {
    console.error('Error fetching emergency contact:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to fetch emergency contact' 
    });
  }
};

// Create a new emergency contact
export const createEmergencyContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    // Validate request body
    const validationResult = createEmergencyContactSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation Error', 
        message: 'Invalid input data',
        details: validationResult.error.errors 
      });
    }

    const { contact_name, phone_number, relationship, email } = validationResult.data;

    const emergencyContact = await prisma.emergency_contacts.create({
      data: {
        user_id: req.user.uid,
        contact_name,
        phone_number,
        relationship,
        email: email || null
      }
    });

    res.status(201).json({ 
      success: true,
      message: 'Emergency contact created successfully',
      data: emergencyContact 
    });
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to create emergency contact' 
    });
  }
};

// Update an emergency contact
export const updateEmergencyContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const { id } = req.params;

    // Check if emergency contact exists and belongs to the user
    const existingContact = await prisma.emergency_contacts.findFirst({
      where: { 
        id: id,
        user_id: req.user.uid 
      }
    });

    if (!existingContact) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Emergency contact not found' 
      });
    }

    // Validate request body
    const validationResult = updateEmergencyContactSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation Error', 
        message: 'Invalid input data',
        details: validationResult.error.errors 
      });
    }

    const { contact_name, phone_number, relationship, email } = validationResult.data;

    // Prepare update data (only include fields that were provided)
    const updateData: any = {};
    if (contact_name !== undefined) updateData.contact_name = contact_name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (relationship !== undefined) updateData.relationship = relationship;
    if (email !== undefined) updateData.email = email || null;

    const updatedEmergencyContact = await prisma.emergency_contacts.update({
      where: { id: id },
      data: updateData
    });

    res.status(200).json({ 
      success: true,
      message: 'Emergency contact updated successfully',
      data: updatedEmergencyContact 
    });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to update emergency contact' 
    });
  }
};

// Delete an emergency contact
export const deleteEmergencyContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const { id } = req.params;

    // Check if emergency contact exists and belongs to the user
    const existingContact = await prisma.emergency_contacts.findFirst({
      where: { 
        id: id,
        user_id: req.user.uid 
      }
    });

    if (!existingContact) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Emergency contact not found' 
      });
    }

    await prisma.emergency_contacts.delete({
      where: { id: id }
    });

    res.status(200).json({ 
      success: true,
      message: 'Emergency contact deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to delete emergency contact' 
    });
  }
};