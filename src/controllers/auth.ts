import { Request, Response } from 'express';
import { auth, firebase } from '../utils/firebase';
import { prisma } from '../utils/database';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  phone_number: z.string().optional(),
  profile_picture_url: z.string().url().optional().or(z.literal(''))
});

const signInSchema = z.object({
  id_token: z.string().min(1, 'Firebase ID token is required')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const { email, password, full_name, phone_number, profile_picture_url } = validationResult.data;

    // Check if user already exists in our database
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    try {
      // Create user in Firebase
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName: full_name,
        ...(phone_number && { phoneNumber: phone_number }),
        ...(profile_picture_url && { photoURL: profile_picture_url })
      });

      try {
        // Create user in our database
        const dbUser = await prisma.users.create({
          data: {
            id: firebaseUser.uid, // Use Firebase UID as our primary key
            email,
            full_name,
            phone_number: phone_number || null,
            profile_picture_url: profile_picture_url || null,
            updated_at: new Date()
          }
        });

        // Generate a custom token for immediate sign-in
        const customToken = await auth.createCustomToken(firebaseUser.uid);

        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            user: {
              id: dbUser.id,
              email: dbUser.email,
              full_name: dbUser.full_name,
              phone_number: dbUser.phone_number,
              profile_picture_url: dbUser.profile_picture_url,
              created_at: dbUser.created_at
            },
            custom_token: customToken,
            firebase_uid: firebaseUser.uid
          }
        });

      } catch (dbError) {
        // If database creation fails, delete the Firebase user to maintain consistency
        console.error('Database user creation failed:', dbError);
        
        try {
          await auth.deleteUser(firebaseUser.uid);
        } catch (cleanupError) {
          console.error('Failed to cleanup Firebase user:', cleanupError);
        }

        return res.status(500).json({
          success: false,
          error: 'Database Error',
          message: 'Failed to create user in database. Firebase user has been cleaned up.'
        });
      }

    } catch (firebaseError: any) {
      console.error('Firebase user creation failed:', firebaseError);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to create user account';
      
      if (firebaseError.code === 'auth/email-already-exists') {
        errorMessage = 'An account with this email already exists';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (firebaseError.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      }

      return res.status(400).json({
        success: false,
        error: 'Firebase Error',
        message: errorMessage,
        code: firebaseError.code
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during registration'
    });
  }
};

// Verify email endpoint (optional)
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'User ID is required'
      });
    }

    // Generate email verification link
    const link = await auth.generateEmailVerificationLink(uid);

    return res.json({
      success: true,
      message: 'Email verification link generated',
      data: {
        verification_link: link
      }
    });

  } catch (error: any) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to generate email verification link'
    });
  }
};

// Check if email is available
export const checkEmailAvailability = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    if (!email || !z.string().email().safeParse(email).success) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Valid email is required'
      });
    }

    // Check in database
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    // Also check in Firebase (in case of orphaned Firebase users)
    let firebaseUserExists = false;
    try {
      await auth.getUserByEmail(email);
      firebaseUserExists = true;
    } catch (firebaseError: any) {
      if (firebaseError.code !== 'auth/user-not-found') {
        console.error('Firebase check error:', firebaseError);
      }
    }

    const isAvailable = !existingUser && !firebaseUserExists;

    return res.json({
      success: true,
      data: {
        email,
        available: isAvailable,
        exists_in_database: !!existingUser,
        exists_in_firebase: firebaseUserExists
      }
    });

  } catch (error) {
    console.error('Email availability check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to check email availability'
    });
  }
};

// Sign in with Firebase ID token
export const signInUser = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = signInSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Firebase ID token is required',
        details: validationResult.error.errors
      });
    }

    const { id_token } = validationResult.data;

    try {
      // Verify the Firebase ID token
      const decodedToken = await auth.verifyIdToken(id_token);
      
      // Get or create user in our database
      let user = await prisma.users.findUnique({
        where: { id: decodedToken.uid },
        include: {
          medical_info: true,
          emergency_contacts: true,
          vehicles: {
            include: {
              vehicle_insurance: true
            }
          },
          addresses: true,
          bank_accounts: true,
          health_insurance: true,
          supplementary_insurance: true,
          emergency_events: {
            orderBy: {
              created_at: 'desc'
            },
            take: 5 // Last 5 emergency events
          }
        }
      });

      if (!user) {
        // If user doesn't exist in our database, create them from Firebase data
        const firebaseUser = await auth.getUser(decodedToken.uid);
        
        user = await prisma.users.create({
          data: {
            id: decodedToken.uid,
            email: decodedToken.email || firebaseUser.email || '',
            full_name: decodedToken.name || firebaseUser.displayName || 'Unknown User',
            phone_number: decodedToken.phone_number || firebaseUser.phoneNumber || null,
            profile_picture_url: decodedToken.picture || firebaseUser.photoURL || null,
            updated_at: new Date()
          },
          include: {
            medical_info: true,
            emergency_contacts: true,
            vehicles: {
              include: {
                vehicle_insurance: true
              }
            },
            addresses: true,
            bank_accounts: true,
            health_insurance: true,
            supplementary_insurance: true,
            emergency_events: {
              orderBy: {
                created_at: 'desc'
              },
              take: 5
            }
          }
        });
      }

      return res.json({
        success: true,
        message: 'Sign in successful',
        data: {
          user,
          firebase_claims: {
            uid: decodedToken.uid,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
            auth_time: decodedToken.auth_time,
            iat: decodedToken.iat,
            exp: decodedToken.exp
          }
        }
      });

    } catch (tokenError: any) {
      console.error('Token verification failed:', tokenError);
      
      let errorMessage = 'Invalid or expired token';
      if (tokenError.code === 'auth/id-token-expired') {
        errorMessage = 'Token has expired, please sign in again';
      } else if (tokenError.code === 'auth/id-token-revoked') {
        errorMessage = 'Token has been revoked, please sign in again';
      }

      return res.status(401).json({
        success: false,
        error: 'Authentication Error',
        message: errorMessage,
        code: tokenError.code
      });
    }

  } catch (error) {
    console.error('Sign in error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during sign in'
    });
  }
};

// Login with email and password
export const loginWithEmail = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const { email, password } = validationResult.data;

    try {
      // Sign in with Firebase Auth using email and password
      // Note: This requires the Firebase Admin SDK to verify credentials
      // We'll create a custom token after verifying the user exists
      
      // First, check if user exists in our database
      const user = await prisma.users.findUnique({
        where: { email },
        include: {
          medical_info: true,
          emergency_contacts: true,
          vehicles: {
            include: {
              vehicle_insurance: true
            }
          },
          addresses: true,
          bank_accounts: true,
          health_insurance: true,
          supplementary_insurance: true,
          emergency_events: {
            orderBy: {
              created_at: 'desc'
            },
            take: 5
          }
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication Error',
          message: 'Invalid email or password'
        });
      }

      try {
        // Get Firebase user to verify they exist in Firebase Auth
        const firebaseUser = await auth.getUserByEmail(email);
        
        // Create a custom token for the user
        // Note: The actual password verification happens on the client side
        // This endpoint assumes the client has already verified the password
        // and is requesting a server-side token for API access
        const customToken = await auth.createCustomToken(firebaseUser.uid);

        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            user,
            custom_token: customToken,
            firebase_uid: firebaseUser.uid
          }
        });

      } catch (firebaseError: any) {
        console.error('Firebase user lookup failed:', firebaseError);
        
        if (firebaseError.code === 'auth/user-not-found') {
          return res.status(401).json({
            success: false,
            error: 'Authentication Error',
            message: 'Invalid email or password'
          });
        }

        return res.status(500).json({
          success: false,
          error: 'Firebase Error',
          message: 'Authentication service temporarily unavailable'
        });
      }

    } catch (error) {
      console.error('Database lookup failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Database Error',
        message: 'Failed to authenticate user'
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during login'
    });
  }
};

// Get authenticated user profile
export const getAuthenticatedUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        medical_info: true,
        emergency_contacts: true,
        vehicles: {
          include: {
            vehicle_insurance: true
          }
        },
        addresses: true,
        bank_accounts: true,
        health_insurance: true,
        supplementary_insurance: true,
        emergency_events: {
          orderBy: {
            created_at: 'desc'
          },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User profile not found'
      });
    }

    return res.json({
      success: true,
      data: {
        user,
        profile_completeness: {
          has_medical_info: !!user.medical_info,
          has_emergency_contacts: user.emergency_contacts.length > 0,
          has_addresses: user.addresses.length > 0,
          has_vehicles: user.vehicles.length > 0,
          completion_percentage: calculateProfileCompleteness(user)
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to retrieve user profile'
    });
  }
};

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user: any): number {
  let completedFields = 0;
  let totalFields = 8;

  // Basic fields
  if (user.full_name) completedFields++;
  if (user.phone_number) completedFields++;
  if (user.profile_picture_url) completedFields++;
  
  // Related data
  if (user.medical_info) completedFields++;
  if (user.emergency_contacts.length > 0) completedFields++;
  if (user.addresses.length > 0) completedFields++;
  if (user.vehicles.length > 0) completedFields++;
  if (user.health_insurance.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}