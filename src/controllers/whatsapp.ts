import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';

// Validation schema for sending WhatsApp messages
const sendWhatsAppMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  phone: z.string().min(1, 'Phone number is required')
});

export const sendWhatsAppMessage = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = sendWhatsAppMessageSchema.parse(req.body);
    const { message, phone } = validatedData;

    // Check for required environment variables
    const waliApiUrl = process.env.WALI_API_URL;
    const waliApiKey = process.env.WALI_API_KEY;

    if (!waliApiUrl || !waliApiKey) {
      return res.status(500).json({
        success: false,
        message: 'WALI API configuration is missing',
        error: 'WALI_API_URL or WALI_API_KEY environment variables are not set'
      });
    }

    // Construct the API endpoint URL with query parameters
    const apiEndpoint = `${waliApiUrl}/wali/4ceedd94-5ce3-4a55-8faf-12f0037df7f4/send_message?manager=whapi&schema=repartes`;

    // Prepare the request payload
    const requestBody = {
      message,
      device_id: "whapi",
      phone,
      is_group: false
    };

    // Make the API call to WALI using axios
    const response = await axios.post(apiEndpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': waliApiKey
      }
    });

    // Success response
    res.status(200).json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: response.data
    });

  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);

    if (error instanceof z.ZodError) {
      // Validation error
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;
      
      console.error('WALI API Error:', error.response?.data);
      return res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: `WALI API returned ${statusCode}: ${errorMessage}`
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};