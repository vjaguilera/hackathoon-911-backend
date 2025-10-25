import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { prisma } from './utils/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import medicalInfoRoutes from './routes/medicalInfo';
import emergencyContactRoutes from './routes/emergencyContacts';
import vehicleRoutes from './routes/vehicles';
import vehicleInsuranceRoutes from './routes/vehicleInsurance';
import addressRoutes from './routes/addresses';
import bankAccountRoutes from './routes/bankAccounts';
import healthInsuranceRoutes from './routes/healthInsurance';
import supplementaryInsuranceRoutes from './routes/supplementaryInsurance';
import emergencyEventRoutes from './routes/emergencyEvents';
import validationQuestionRoutes from './routes/validationQuestions';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hackathoon 911 API',
      version: '1.0.0',
      description: 'Emergency services backend API for Hackathoon 911',
      contact: {
        name: 'Hackathoon Team',
        email: 'team@hackathoon911.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase JWT token'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Hackathoon 911 API Documentation'
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Hackathoon 911 Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/medical-info`, medicalInfoRoutes);
app.use(`${apiPrefix}/emergency-contacts`, emergencyContactRoutes);
app.use(`${apiPrefix}/vehicles`, vehicleRoutes);
app.use(`${apiPrefix}/vehicle-insurance`, vehicleInsuranceRoutes);
app.use(`${apiPrefix}/addresses`, addressRoutes);
app.use(`${apiPrefix}/bank-accounts`, bankAccountRoutes);
app.use(`${apiPrefix}/health-insurance`, healthInsuranceRoutes);
app.use(`${apiPrefix}/supplementary-insurance`, supplementaryInsuranceRoutes);
app.use(`${apiPrefix}/emergency-events`, emergencyEventRoutes);
app.use(`${apiPrefix}`, validationQuestionRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Hackathoon 911 Backend API',
    documentation: '/api-docs',
    health: '/health',
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      documentation: '/api-docs',
      health: '/health',
      api: apiPrefix
    }
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Hackathoon 911 Backend running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});

export default app;