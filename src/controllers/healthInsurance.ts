import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthenticatedRequest } from '../middleware/auth';

// Get all health insurance records for the authenticated user
export const getHealthInsurance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const healthInsurance = await prisma.health_insurance.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    
    res.json({
      success: true,
      data: healthInsurance,
      count: healthInsurance.length
    });
  } catch (error) {
    console.error('Error fetching health insurance:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch health insurance records'
    });
  }
};

// Get a specific health insurance record by ID
export const getHealthInsuranceById = async (req: AuthenticatedRequest, res: Response) => {
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

    const healthInsurance = await prisma.health_insurance.findFirst({
      where: { 
        id,
        user_id: userId 
      }
    });

    if (!healthInsurance) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Health insurance record not found'
      });
    }

    res.json({
      success: true,
      data: healthInsurance
    });
  } catch (error) {
    console.error('Error fetching health insurance:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch health insurance record'
    });
  }
};

// Create a new health insurance record
export const createHealthInsurance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { primary_provider, provider_name, plan_name, member_id, coverage_info } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate required fields
    if (!primary_provider || !provider_name || !member_id) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Missing required fields: primary_provider, provider_name, member_id'
      });
    }

    // Create the health insurance record
    const newHealthInsurance = await prisma.health_insurance.create({
      data: {
        user_id: userId,
        primary_provider: primary_provider,
        provider_name: provider_name.trim(),
        plan_name: plan_name ? plan_name.trim() : null,
        member_id: member_id.trim(),
        coverage_info: coverage_info ? coverage_info.trim() : null
      }
    });

    res.status(201).json({
      success: true,
      data: newHealthInsurance,
      message: 'Health insurance record created successfully'
    });
  } catch (error: any) {
    console.error('Error creating health insurance:', error);
    
    // Handle unique constraint violations if any
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A health insurance record with this information already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create health insurance record'
    });
  }
};

// Update a health insurance record
export const updateHealthInsurance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;
    const { primary_provider, provider_name, plan_name, member_id, coverage_info } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if health insurance record exists and belongs to user
    const existingHealthInsurance = await prisma.health_insurance.findFirst({
      where: { 
        id,
        user_id: userId 
      }
    });

    if (!existingHealthInsurance) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Health insurance record not found'
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (primary_provider) updateData.primary_provider = primary_provider;
    if (provider_name) updateData.provider_name = provider_name.trim();
    if (plan_name !== undefined) updateData.plan_name = plan_name ? plan_name.trim() : null;
    if (member_id) updateData.member_id = member_id.trim();
    if (coverage_info !== undefined) updateData.coverage_info = coverage_info ? coverage_info.trim() : null;

    // Update the health insurance record
    const updatedHealthInsurance = await prisma.health_insurance.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedHealthInsurance,
      message: 'Health insurance record updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating health insurance:', error);
    
    // Handle unique constraint violations if any
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A health insurance record with this information already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update health insurance record'
    });
  }
};

// Delete a health insurance record
export const deleteHealthInsurance = async (req: AuthenticatedRequest, res: Response) => {
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

    // Check if health insurance record exists and belongs to user
    const existingHealthInsurance = await prisma.health_insurance.findFirst({
      where: { 
        id,
        user_id: userId 
      }
    });

    if (!existingHealthInsurance) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Health insurance record not found'
      });
    }

    // Delete the health insurance record
    await prisma.health_insurance.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Health insurance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting health insurance:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete health insurance record'
    });
  }
};