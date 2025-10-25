import { Router } from 'express';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress
} from '../controllers/addresses';
import { authenticateFirebaseToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - street_address
 *         - city
 *         - region
 *         - postal_code
 *         - country
 *         - address_type
 *       properties:
 *         id:
 *           type: string
 *           description: Address unique identifier
 *         user_id:
 *           type: string
 *           description: User's unique identifier
 *         street_address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City name
 *         region:
 *           type: string
 *           description: Region/State/Province
 *         postal_code:
 *           type: string
 *           description: Postal/ZIP code
 *         country:
 *           type: string
 *           description: Country name
 *         address_type:
 *           type: string
 *           description: Type of address (e.g., "Home", "Work", "Billing")
 *         is_primary:
 *           type: boolean
 *           description: Whether this is the primary address
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateAddress:
 *       type: object
 *       required:
 *         - street_address
 *         - city
 *         - region
 *         - postal_code
 *         - country
 *         - address_type
 *       properties:
 *         street_address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City name
 *         region:
 *           type: string
 *           description: Region/State/Province
 *         postal_code:
 *           type: string
 *           description: Postal/ZIP code
 *         country:
 *           type: string
 *           description: Country name
 *         address_type:
 *           type: string
 *           description: Type of address
 *         is_primary:
 *           type: boolean
 *           description: Whether this is the primary address (optional)
 *     UpdateAddress:
 *       type: object
 *       properties:
 *         street_address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City name
 *         region:
 *           type: string
 *           description: Region/State/Province
 *         postal_code:
 *           type: string
 *           description: Postal/ZIP code
 *         country:
 *           type: string
 *           description: Country name
 *         address_type:
 *           type: string
 *           description: Type of address
 *         is_primary:
 *           type: boolean
 *           description: Whether this is the primary address
 */

/**
 * @swagger
 * /api/v1/addresses:
 *   get:
 *     summary: Get all addresses for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateFirebaseToken, getUserAddresses);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   get:
 *     summary: Get a specific address by ID
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateFirebaseToken, getAddressById);

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddress'
 *     responses:
 *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateFirebaseToken, createAddress);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddress'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateFirebaseToken, updateAddress);

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateFirebaseToken, deleteAddress);

/**
 * @swagger
 * /api/v1/addresses/{id}/set-primary:
 *   patch:
 *     summary: Set an address as the primary address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address set as primary successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/set-primary', authenticateFirebaseToken, setPrimaryAddress);

export default router;