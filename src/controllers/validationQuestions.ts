import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation schemas
const createValidationQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
});

const updateValidationQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required').optional(),
  answer: z.string().min(1, 'Answer is required').optional()
});

const verifyAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  answer: z.string().min(1, 'Answer is required')
});

/**
 * @swagger
 * /api/v1/users/{userId}/validation-questions:
 *   get:
 *     summary: Get all validation questions for a user
 *     description: Retrieves validation questions for a user. Returns complete information including answer hashes when authenticated with API key, limited information when using bearer token.
 *     tags: [Validation Questions]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: header
 *         name: api-key
 *         required: false
 *         schema:
 *           type: string
 *         description: API key for emergency services access
 *     responses:
 *       200:
 *         description: Validation questions retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                         description: Only returned with API key authentication
 *                       question:
 *                         type: string
 *                       answer_hash:
 *                         type: string
 *                         description: Only returned with API key authentication
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - invalid or missing authentication
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getUserValidationQuestions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if request is authenticated via API key
    const apiKey = req.headers['api-key'] as string;
    const retellApiKey = process.env.RETELL_API_KEY;
    const isApiKeyAuth = apiKey && retellApiKey && apiKey === retellApiKey;

    // Select fields based on authentication method
    const selectFields = isApiKeyAuth ? {
      id: true,
      user_id: true,
      question: true,
      answer_hash: true,
      created_at: true,
      updated_at: true
    } : {
      id: true,
      question: true,
      created_at: true,
      updated_at: true
    };

    // Get validation questions
    const validationQuestions = await prisma.validation_questions.findMany({
      where: { user_id: userId },
      select: selectFields,
      orderBy: { created_at: 'asc' }
    });

    res.json({
      success: true,
      data: validationQuestions
    });
  } catch (error) {
    console.error('Error fetching validation questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch validation questions'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/{userId}/validation-questions:
 *   post:
 *     summary: Create a new validation question for a user
 *     tags: [Validation Questions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *                 description: The validation question
 *               answer:
 *                 type: string
 *                 description: The answer to the question
 *     responses:
 *       201:
 *         description: Validation question created successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const createValidationQuestion = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const validation = createValidationQuestionSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validation.error.issues
      });
    }

    const { question, answer } = validation.data;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash the answer for security
    const answerHash = await bcrypt.hash(answer.toLowerCase().trim(), 10);

    // Create validation question
    const validationQuestion = await prisma.validation_questions.create({
      data: {
        user_id: userId,
        question,
        answer_hash: answerHash
      },
      select: {
        id: true,
        question: true,
        created_at: true,
        updated_at: true
      }
    });

    res.status(201).json({
      success: true,
      data: validationQuestion
    });
  } catch (error) {
    console.error('Error creating validation question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create validation question'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/{userId}/validation-questions/{questionId}:
 *   put:
 *     summary: Update a validation question
 *     tags: [Validation Questions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The validation question
 *               answer:
 *                 type: string
 *                 description: The answer to the question
 *     responses:
 *       200:
 *         description: Validation question updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User or question not found
 *       500:
 *         description: Internal server error
 */
export const updateValidationQuestion = async (req: Request, res: Response) => {
  try {
    const { userId, questionId } = req.params;
    const validation = updateValidationQuestionSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validation.error.issues
      });
    }

    const { question, answer } = validation.data;

    // Check if question exists and belongs to user
    const existingQuestion = await prisma.validation_questions.findFirst({
      where: {
        id: questionId,
        user_id: userId
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Validation question not found'
      });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (question !== undefined) {
      updateData.question = question;
    }
    
    if (answer !== undefined) {
      updateData.answer_hash = await bcrypt.hash(answer.toLowerCase().trim(), 10);
    }

    // Update validation question
    const updatedQuestion = await prisma.validation_questions.update({
      where: { id: questionId },
      data: updateData,
      select: {
        id: true,
        question: true,
        created_at: true,
        updated_at: true
      }
    });

    res.json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating validation question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update validation question'
    });
  }
};

/**
 * @swagger
 * /api/v1/users/{userId}/validation-questions/{questionId}:
 *   delete:
 *     summary: Delete a validation question
 *     tags: [Validation Questions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Validation question deleted successfully
 *       404:
 *         description: User or question not found
 *       500:
 *         description: Internal server error
 */
export const deleteValidationQuestion = async (req: Request, res: Response) => {
  try {
    const { userId, questionId } = req.params;

    // Check if question exists and belongs to user
    const existingQuestion = await prisma.validation_questions.findFirst({
      where: {
        id: questionId,
        user_id: userId
      }
    });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Validation question not found'
      });
    }

    // Delete validation question
    await prisma.validation_questions.delete({
      where: { id: questionId }
    });

    res.json({
      success: true,
      message: 'Validation question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting validation question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete validation question'
    });
  }
};

/**
 * @swagger
 * /api/v1/validation-questions/verify:
 *   post:
 *     summary: Verify answer to a validation question
 *     tags: [Validation Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - answer
 *             properties:
 *               questionId:
 *                 type: string
 *                 format: uuid
 *                 description: The question ID
 *               answer:
 *                 type: string
 *                 description: The user's answer
 *     responses:
 *       200:
 *         description: Answer verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 verified:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 */
export const verifyValidationAnswer = async (req: Request, res: Response) => {
  try {
    const validation = verifyAnswerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validation.error.issues
      });
    }

    const { questionId, answer } = validation.data;

    // Get the question
    const question = await prisma.validation_questions.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Validation question not found'
      });
    }

    // Verify the answer
    const isCorrect = await bcrypt.compare(answer.toLowerCase().trim(), question.answer_hash);

    res.json({
      success: true,
      verified: isCorrect,
      message: isCorrect ? 'Answer is correct' : 'Answer is incorrect'
    });
  } catch (error) {
    console.error('Error verifying validation answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify answer'
    });
  }
};