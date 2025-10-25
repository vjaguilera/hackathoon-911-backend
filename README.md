# Hackathoon 911 Backend

A comprehensive backend API for emergency services system built with Node.js, TypeScript, Prisma ORM, PostgreSQL, Firebase Authentication, and Swagger documentation.

## 🚀 Features

- **Authentication**: Firebase Authentication integration
- **Database**: PostgreSQL with Prisma ORM
- **API Documentation**: Swagger/OpenAPI 3.0
- **Docker Support**: Full containerization for development and production
- **Type Safety**: Full TypeScript implementation
- **Security**: Helmet, CORS, input validation
- **Scalable Architecture**: Modular controller/route structure

## 📋 API Endpoints

The API provides CRUD operations for the following entities:

### Authentication
- **Auth** (`/api/v1/auth`) - User registration, sign-in, and profile management
  - `POST /register` - Register new users
  - `POST /signin` - Sign in with Firebase token
  - `GET /profile` - Get authenticated user profile
  - `GET /check-email/{email}` - Check email availability

### Core Entities
- **Users** (`/api/v1/users`) - User profile management
- **Medical Info** (`/api/v1/medical-info`) - Medical conditions, allergies, medications
- **Emergency Contacts** (`/api/v1/emergency-contacts`) - Emergency contact information
- **Emergency Events** (`/api/v1/emergency-events`) - Active emergency situations

### Vehicle Information
- **Vehicles** (`/api/v1/vehicles`) - Vehicle registration details
- **Vehicle Insurance** (`/api/v1/vehicle-insurance`) - Insurance policies

### Personal Information
- **Addresses** (`/api/v1/addresses`) - Residential and work addresses
- **Bank Accounts** (`/api/v1/bank-accounts`) - Financial information

### Insurance
- **Health Insurance** (`/api/v1/health-insurance`) - ISAPRE/FONASA information
- **Supplementary Insurance** (`/api/v1/supplementary-insurance`) - Additional coverage

## 🛠️ Database Schema

The system includes 10 main tables:

1. **users** - Basic user information
2. **medical_info** - Medical data and conditions
3. **emergency_contacts** - Emergency contact details
4. **vehicles** - Vehicle information
5. **vehicle_insurance** - Vehicle insurance policies
6. **addresses** - User addresses
7. **bank_accounts** - Banking information
8. **health_insurance** - Health coverage (ISAPRE/FONASA)
9. **supplementary_insurance** - Additional insurance policies
10. **emergency_events** - Emergency incident tracking

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Firebase project with Authentication enabled

### Environment Setup

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd hackathoon-911-backend
   \`\`\`

2. Copy environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication
   - Generate service account key
   - Update \`.env\` with your Firebase credentials

### Development with Docker

1. **Start all services:**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

   This starts:
   - PostgreSQL database (port 5432)
   - Backend API (port 3000)
   - Adminer database UI (port 8080)

2. **View logs:**
   \`\`\`bash
   docker-compose logs -f backend
   \`\`\`

3. **Stop services:**
   \`\`\`bash
   docker-compose down
   \`\`\`

### Local Development

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Setup database:**
   \`\`\`bash
   # Start only PostgreSQL
   docker-compose up -d postgres
   
   # Run migrations
   npm run prisma:migrate
   \`\`\`

3. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## 📚 API Documentation

Access the interactive Swagger documentation at:
- **Local**: http://localhost:3000/api-docs
- **Docker**: http://localhost:3000/api-docs

## 🔧 Available Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run prisma:generate\` - Generate Prisma client
- \`npm run prisma:migrate\` - Run database migrations
- \`npm run prisma:studio\` - Open Prisma Studio
- \`npm run docker:build\` - Build Docker image
- \`npm run docker:run\` - Run Docker container

## 🐳 Production Deployment

### Google Cloud Run

1. **Build and push to Container Registry:**
   \`\`\`bash
   # Build image
   docker build -t gcr.io/[PROJECT_ID]/hackathoon-911-backend .
   
   # Push to registry
   docker push gcr.io/[PROJECT_ID]/hackathoon-911-backend
   \`\`\`

2. **Deploy to Cloud Run:**
   \`\`\`bash
   gcloud run deploy hackathoon-911-backend \\
     --image gcr.io/[PROJECT_ID]/hackathoon-911-backend \\
     --platform managed \\
     --region us-central1 \\
     --allow-unauthenticated \\
     --set-env-vars NODE_ENV=production \\
     --set-env-vars DATABASE_URL=[YOUR_DB_URL] \\
     --set-env-vars FIREBASE_PROJECT_ID=[YOUR_PROJECT_ID]
   \`\`\`

### Environment Variables for Production

Required environment variables:
- \`DATABASE_URL\` - PostgreSQL connection string
- \`FIREBASE_PROJECT_ID\` - Firebase project ID
- \`FIREBASE_CLIENT_EMAIL\` - Firebase service account email
- \`FIREBASE_PRIVATE_KEY\` - Firebase service account private key
- \`JWT_SECRET\` - Secret for JWT signing
- \`ALLOWED_ORIGINS\` - Comma-separated list of allowed origins

## 🔐 Authentication

The API uses Firebase Authentication with comprehensive user management. See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed documentation.

**Quick Start:**
1. Register: `POST /api/v1/auth/register`
2. Sign in: `POST /api/v1/auth/signin`
3. Use token: `Authorization: Bearer <firebase-jwt-token>`

**Available Auth Endpoints:**
- User registration with Firebase + database sync
- Email availability checking
- Complete profile management
- Token-based authentication

## 📖 API Usage Examples

### Register New User
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@hackathoon911.com",
    "password": "securePassword123",
    "full_name": "Emergency User",
    "phone_number": "+56912345678"
  }'
\`\`\`

### Create Emergency Event
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/emergency-events \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "medical",
    "description": "Heart attack emergency",
    "location": "123 Main St, Santiago, Chile"
  }'
\`\`\`

### Get User Profile
\`\`\`bash
curl -X GET http://localhost:3000/api/v1/users/me \\
  -H "Authorization: Bearer <token>"
\`\`\`

## 🗄️ Database Management

- **Adminer UI**: http://localhost:8080 (when using Docker)
- **Prisma Studio**: \`npm run prisma:studio\`

### Database Connection (Adminer)
- **System**: PostgreSQL
- **Server**: postgres (or localhost if running locally)
- **Username**: hackathoon
- **Password**: hackathoon
- **Database**: hackathoon_911

## 🛡️ Security Features

- Firebase Authentication integration
- Helmet.js for security headers
- CORS protection
- Input validation with Zod
- SQL injection protection via Prisma
- File upload size limits

## 📝 Development Guidelines

1. **Code Structure**: Follow the established controller/route pattern
2. **Error Handling**: Use consistent error response format
3. **Validation**: Validate all inputs using Zod schemas
4. **Documentation**: Update Swagger documentation for new endpoints
5. **Testing**: Write tests for new functionality

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file

2. **Firebase Authentication Error**:
   - Verify Firebase credentials in .env
   - Check Firebase project configuration

3. **Port Already in Use**:
   - Change PORT in .env file
   - Kill existing processes: \`lsof -ti:3000 | xargs kill -9\`

### Health Checks

- **API Health**: GET http://localhost:3000/health
- **Database**: Check Adminer or run \`docker-compose logs postgres\`

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: \`git checkout -b feature/new-feature\`
3. Commit changes: \`git commit -am 'Add new feature'\`
4. Push to branch: \`git push origin feature/new-feature\`
5. Submit pull request

## 🆘 Support

For emergency system support or technical issues, please contact the development team.