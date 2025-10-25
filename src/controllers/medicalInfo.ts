import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthenticatedRequest } from '../middleware/auth';

// Get medical info for the authenticated user
export const getMedicalInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const medicalInfo = await prisma.medical_info.findUnique({
      where: { user_id: userId }
    });

    if (!medicalInfo) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Medical information not found'
      });
    }
    
    res.json({
      success: true,
      data: medicalInfo
    });
  } catch (error) {
    console.error('Error fetching medical info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch medical information'
    });
  }
};

// Create medical info for the authenticated user
export const createMedicalInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { 
      medical_conditions, 
      allergies, 
      medications, 
      blood_type, 
      emergency_notes, 
      voice_password_hash 
    } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if medical info already exists for this user
    const existingMedicalInfo = await prisma.medical_info.findUnique({
      where: { user_id: userId }
    });

    if (existingMedicalInfo) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Medical information already exists for this user. Use PUT to update.'
      });
    }

    // Validate and prepare arrays
    const processedMedicalConditions = Array.isArray(medical_conditions) 
      ? medical_conditions.filter(condition => condition && condition.trim()) 
      : [];
    
    const processedAllergies = Array.isArray(allergies) 
      ? allergies.filter(allergy => allergy && allergy.trim()) 
      : [];
    
    const processedMedications = Array.isArray(medications) 
      ? medications.filter(medication => medication && medication.trim()) 
      : [];

    // Create the medical info record
    const newMedicalInfo = await prisma.medical_info.create({
      data: {
        user_id: userId,
        medical_conditions: processedMedicalConditions,
        allergies: processedAllergies,
        medications: processedMedications,
        blood_type: blood_type ? blood_type.trim() : null,
        emergency_notes: emergency_notes ? emergency_notes.trim() : null,
        voice_password_hash: voice_password_hash ? voice_password_hash.trim() : null
      }
    });

    res.status(201).json({
      success: true,
      data: newMedicalInfo,
      message: 'Medical information created successfully'
    });
  } catch (error: any) {
    console.error('Error creating medical info:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Medical information already exists for this user'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create medical information'
    });
  }
};

// Update medical info for the authenticated user
export const updateMedicalInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { 
      medical_conditions, 
      allergies, 
      medications, 
      blood_type, 
      emergency_notes, 
      voice_password_hash 
    } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if medical info exists for this user
    const existingMedicalInfo = await prisma.medical_info.findUnique({
      where: { user_id: userId }
    });

    if (!existingMedicalInfo) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Medical information not found'
      });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (medical_conditions !== undefined) {
      updateData.medical_conditions = Array.isArray(medical_conditions) 
        ? medical_conditions.filter(condition => condition && condition.trim()) 
        : [];
    }
    
    if (allergies !== undefined) {
      updateData.allergies = Array.isArray(allergies) 
        ? allergies.filter(allergy => allergy && allergy.trim()) 
        : [];
    }
    
    if (medications !== undefined) {
      updateData.medications = Array.isArray(medications) 
        ? medications.filter(medication => medication && medication.trim()) 
        : [];
    }
    
    if (blood_type !== undefined) {
      updateData.blood_type = blood_type ? blood_type.trim() : null;
    }
    
    if (emergency_notes !== undefined) {
      updateData.emergency_notes = emergency_notes ? emergency_notes.trim() : null;
    }
    
    if (voice_password_hash !== undefined) {
      updateData.voice_password_hash = voice_password_hash ? voice_password_hash.trim() : null;
    }

    // Update the medical info record
    const updatedMedicalInfo = await prisma.medical_info.update({
      where: { user_id: userId },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedMedicalInfo,
      message: 'Medical information updated successfully'
    });
  } catch (error) {
    console.error('Error updating medical info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update medical information'
    });
  }
};

// Delete medical info for the authenticated user
export const deleteMedicalInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if medical info exists for this user
    const existingMedicalInfo = await prisma.medical_info.findUnique({
      where: { user_id: userId }
    });

    if (!existingMedicalInfo) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Medical information not found'
      });
    }

    // Delete the medical info record
    await prisma.medical_info.delete({
      where: { user_id: userId }
    });

    res.json({
      success: true,
      message: 'Medical information deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medical info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete medical information'
    });
  }
};

// Create or update medical info (upsert operation)
export const upsertMedicalInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { 
      medical_conditions, 
      allergies, 
      medications, 
      blood_type, 
      emergency_notes, 
      voice_password_hash 
    } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate and prepare arrays
    const processedMedicalConditions = Array.isArray(medical_conditions) 
      ? medical_conditions.filter(condition => condition && condition.trim()) 
      : [];
    
    const processedAllergies = Array.isArray(allergies) 
      ? allergies.filter(allergy => allergy && allergy.trim()) 
      : [];
    
    const processedMedications = Array.isArray(medications) 
      ? medications.filter(medication => medication && medication.trim()) 
      : [];

    // Upsert the medical info record
    const medicalInfo = await prisma.medical_info.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        medical_conditions: processedMedicalConditions,
        allergies: processedAllergies,
        medications: processedMedications,
        blood_type: blood_type ? blood_type.trim() : null,
        emergency_notes: emergency_notes ? emergency_notes.trim() : null,
        voice_password_hash: voice_password_hash ? voice_password_hash.trim() : null
      },
      update: {
        medical_conditions: processedMedicalConditions,
        allergies: processedAllergies,
        medications: processedMedications,
        blood_type: blood_type ? blood_type.trim() : null,
        emergency_notes: emergency_notes ? emergency_notes.trim() : null,
        voice_password_hash: voice_password_hash ? voice_password_hash.trim() : null
      }
    });

    res.json({
      success: true,
      data: medicalInfo,
      message: 'Medical information saved successfully'
    });
  } catch (error) {
    console.error('Error upserting medical info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to save medical information'
    });
  }
};