import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../utils/database';
import { z } from 'zod';

// Validation schemas
const createAddressSchema = z.object({
  street_address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'Region is required'),
  postal_code: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  address_type: z.string().min(1, 'Address type is required'),
  is_primary: z.boolean().optional()
});

const updateAddressSchema = z.object({
  street_address: z.string().min(1, 'Street address is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  region: z.string().min(1, 'Region is required').optional(),
  postal_code: z.string().optional(),
  country: z.string().min(1, 'Country is required').optional(),
  address_type: z.string().min(1, 'Address type is required').optional(),
  is_primary: z.boolean().optional()
});

// Get all addresses for the authenticated user
export const getUserAddresses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const addresses = await prisma.addresses.findMany({
      where: { user_id: req.user.uid },
      orderBy: [
        { is_primary: 'desc' }, // Primary addresses first
        { created_at: 'desc' }
      ]
    });

    res.status(200).json({ 
      success: true,
      data: addresses 
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to fetch addresses' 
    });
  }
};

// Get a specific address by ID
export const getAddressById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const { id } = req.params;

    const address = await prisma.addresses.findFirst({
      where: { 
        id: id,
        user_id: req.user.uid 
      }
    });

    if (!address) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Address not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      data: address 
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to fetch address' 
    });
  }
};

// Create a new address
export const createAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    // Validate request body
    const validationResult = createAddressSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation Error', 
        message: 'Invalid input data',
        details: validationResult.error.errors 
      });
    }

    const { street_address, city, region, postal_code, country, address_type, is_primary } = validationResult.data;

    // If this is being set as primary, unset other primary addresses
    if (is_primary) {
      await prisma.addresses.updateMany({
        where: { 
          user_id: req.user.uid,
          is_primary: true 
        },
        data: { is_primary: false }
      });
    }

    const address = await prisma.addresses.create({
      data: {
        user_id: req.user.uid,
        street_address,
        city,
        region,
        postal_code,
        country,
        address_type,
        is_primary: is_primary || false
      }
    });

    res.status(201).json({ 
      success: true,
      message: 'Address created successfully',
      data: address 
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to create address' 
    });
  }
};

// Update an address
export const updateAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const { id } = req.params;

    // Check if address exists and belongs to the user
    const existingAddress = await prisma.addresses.findFirst({
      where: { 
        id: id,
        user_id: req.user.uid 
      }
    });

    if (!existingAddress) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Address not found' 
      });
    }

    // Validate request body
    const validationResult = updateAddressSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation Error', 
        message: 'Invalid input data',
        details: validationResult.error.errors 
      });
    }

    const { street_address, city, region, postal_code, country, address_type, is_primary } = validationResult.data;

    // If this is being set as primary, unset other primary addresses
    if (is_primary && !existingAddress.is_primary) {
      await prisma.addresses.updateMany({
        where: { 
          user_id: req.user.uid,
          is_primary: true,
          id: { not: id } // Exclude the current address
        },
        data: { is_primary: false }
      });
    }

    // Prepare update data (only include fields that were provided)
    const updateData: any = {};
    if (street_address !== undefined) updateData.street_address = street_address;
    if (city !== undefined) updateData.city = city;
    if (region !== undefined) updateData.region = region;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (country !== undefined) updateData.country = country;
    if (address_type !== undefined) updateData.address_type = address_type;
    if (is_primary !== undefined) updateData.is_primary = is_primary;

    const updatedAddress = await prisma.addresses.update({
      where: { id: id },
      data: updateData
    });

    res.status(200).json({ 
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress 
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to update address' 
    });
  }
};

// Delete an address
export const deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const { id } = req.params;

    // Check if address exists and belongs to the user
    const existingAddress = await prisma.addresses.findFirst({
      where: { 
        id: id,
        user_id: req.user.uid 
      }
    });

    if (!existingAddress) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Address not found' 
      });
    }

    await prisma.addresses.delete({
      where: { id: id }
    });

    res.status(200).json({ 
      success: true,
      message: 'Address deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to delete address' 
    });
  }
};

// Set an address as primary
export const setPrimaryAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'User not authenticated' 
      });
    }

    const { id } = req.params;

    // Check if address exists and belongs to the user
    const existingAddress = await prisma.addresses.findFirst({
      where: { 
        id: id,
        user_id: req.user.uid 
      }
    });

    if (!existingAddress) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Address not found' 
      });
    }

    // First, unset all primary addresses for the user
    await prisma.addresses.updateMany({
      where: { 
        user_id: req.user.uid,
        is_primary: true 
      },
      data: { is_primary: false }
    });

    // Then set the selected address as primary
    const updatedAddress = await prisma.addresses.update({
      where: { id: id },
      data: { is_primary: true }
    });

    res.status(200).json({ 
      success: true,
      message: 'Address set as primary successfully',
      data: updatedAddress 
    });
  } catch (error) {
    console.error('Error setting primary address:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to set primary address' 
    });
  }
};