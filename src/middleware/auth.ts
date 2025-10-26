import { Request, Response, NextFunction } from 'express';
import { auth } from '../utils/firebase';
import { prisma } from '../utils/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const authenticateFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("\n\nTOKEN", authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No valid authorization header found' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No token provided' 
      });
    }

    try {
      // Verify the Firebase ID token
      const decodedToken = await auth.verifyIdToken(token);
      
      // Check if user exists in our database, create if not
      let user = await prisma.users.findUnique({
        where: { id: decodedToken.uid }
      });

      if (!user && decodedToken.email) {
        // Create user if they don't exist
        user = await prisma.users.create({
          data: {
            id: decodedToken.uid,
            email: decodedToken.email,
            full_name: decodedToken.name || decodedToken.email.split('@')[0],
            profile_picture_url: decodedToken.picture || null,
          }
        });
      }

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };

      next();
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication failed' 
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateFirebaseToken(req, res, next);
  }
  
  next();
};

export const authenticateFirebaseTokenOrApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for API Key first
    const apiKey = req.headers['api-key'] as string;
    const retellApiKey = process.env.RETELL_API_KEY;
    
    if (apiKey && retellApiKey && apiKey === retellApiKey) {
      // Valid API key - skip user authentication and continue
      next();
      return;
    }
    
    // Fall back to Firebase token authentication
    return authenticateFirebaseToken(req, res, next);
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication failed' 
    });
  }
};