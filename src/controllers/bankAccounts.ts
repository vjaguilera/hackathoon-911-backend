import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { validateRutFormat, formatRut } from '../utils/validation';

// Get all bank accounts for the authenticated user
export const getBankAccounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const bankAccounts = await prisma.bank_accounts.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    
    res.json({
      success: true,
      data: bankAccounts,
      count: bankAccounts.length
    });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch bank accounts'
    });
  }
};

// Get a specific bank account by ID
export const getBankAccountById = async (req: AuthenticatedRequest, res: Response) => {
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

    const bankAccount = await prisma.bank_accounts.findFirst({
      where: { 
        id,
        user_id: userId 
      }
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Bank account not found'
      });
    }

    res.json({
      success: true,
      data: bankAccount
    });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch bank account'
    });
  }
};

// Create a new bank account
export const createBankAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { bank_name, account_type, account_number, rut } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate required fields
    if (!bank_name || !account_type || !account_number || !rut) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Missing required fields: bank_name, account_type, account_number, rut'
      });
    }

    // Validate RUT format
    if (!validateRutFormat(rut)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid RUT format. Expected format: 12345678-9'
      });
    }

    // Format RUT
    const formattedRut = formatRut(rut);

    // Create the bank account
    const newBankAccount = await prisma.bank_accounts.create({
      data: {
        user_id: userId,
        bank_name: bank_name.trim(),
        account_type: account_type.trim(),
        account_number: account_number.trim(),
        rut: formattedRut
      }
    });

    res.status(201).json({
      success: true,
      data: newBankAccount,
      message: 'Bank account created successfully'
    });
  } catch (error: any) {
    console.error('Error creating bank account:', error);
    
    // Handle unique constraint violations if any
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A bank account with this information already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create bank account'
    });
  }
};

// Update a bank account
export const updateBankAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { id } = req.params;
    const { bank_name, account_type, account_number, rut } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if bank account exists and belongs to user
    const existingBankAccount = await prisma.bank_accounts.findFirst({
      where: { 
        id,
        user_id: userId 
      }
    });

    if (!existingBankAccount) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Bank account not found'
      });
    }

    // Validate RUT format if provided
    if (rut && !validateRutFormat(rut)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid RUT format. Expected format: 12345678-9'
      });
    }

    // Prepare update data
    const updateData: any = {};
    if (bank_name) updateData.bank_name = bank_name.trim();
    if (account_type) updateData.account_type = account_type.trim();
    if (account_number) updateData.account_number = account_number.trim();
    if (rut) updateData.rut = formatRut(rut);

    // Update the bank account
    const updatedBankAccount = await prisma.bank_accounts.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedBankAccount,
      message: 'Bank account updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating bank account:', error);
    
    // Handle unique constraint violations if any
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A bank account with this information already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update bank account'
    });
  }
};

// Delete a bank account
export const deleteBankAccount = async (req: AuthenticatedRequest, res: Response) => {
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

    // Check if bank account exists and belongs to user
    const existingBankAccount = await prisma.bank_accounts.findFirst({
      where: { 
        id,
        user_id: userId 
      }
    });

    if (!existingBankAccount) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Bank account not found'
      });
    }

    // Delete the bank account
    await prisma.bank_accounts.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete bank account'
    });
  }
};