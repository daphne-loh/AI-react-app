# FoodDrop Technology Stack

This document defines the complete technology stack, versions, and configuration details for the FoodDrop project.

## Technology Stack Overview

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.x | Type-safe React development | Essential for data model consistency between frontend/backend |
| Frontend Framework | React | 18.x | UI component library | PRD requirement, excellent mobile performance, large ecosystem |
| UI Component Library | Material-UI (MUI) | 5.x | Pre-built mobile-optimized components | Rapid development, proven mobile responsiveness, theming support |
| State Management | React Context | Built-in | Global state for auth/collections | Sufficient for app complexity, zero additional dependencies |
| Backend Language | TypeScript | 5.x | Unified language across stack | Enables shared types, reduces context switching for solo developer |
| Backend Framework | Firebase Functions | Latest | Serverless business logic | Zero infrastructure, automatic scaling, generous free tier |
| API Style | REST + Real-time | N/A | HTTP + Firestore listeners | Standard REST for mutations, real-time for live collection updates |
| Database | Firestore | Latest | NoSQL document store | Excellent mobile sync, real-time updates, generous free tier |
| Cache | Browser Cache + CDN | N/A | Client-side performance | Built-in caching, no additional infrastructure needed |
| File Storage | Cloud Storage | Latest | Food item images | Integrated with Firebase, automatic CDN, image optimization |
| Authentication | Firebase Auth | Latest | User management | Complete auth solution, social login support, secure by default |
| Frontend Testing | Jest + Testing Library | Latest | Component and integration tests | React ecosystem standard, excellent async testing support |
| Backend Testing | Jest + Firebase Emulator | Latest | Function testing with mock services | Local development with real Firebase features |
| E2E Testing | Playwright | Latest | Cross-browser automation | Superior mobile testing, visual regression capabilities |
| Build Tool | Vite | 5.x | Fast development builds | Significantly faster than CRA, excellent TypeScript support |
| Bundler | Vite | 5.x | Production optimization | Built into Vite, automatic code splitting and optimization |
| IaC Tool | Firebase CLI | Latest | Service configuration | Version-controlled Firebase rules and function deployment |
| CI/CD | GitHub Actions | Latest | Automated testing and deployment | Free for public repos, excellent Firebase integration |
| Monitoring | Firebase Analytics | Latest | Usage tracking and performance | Free tier sufficient for MVP analytics needs |
| Logging | Firebase Functions Logs | Latest | Error tracking and debugging | Built-in logging with Cloud Functions, structured log support |
| CSS Framework | Tailwind CSS | 3.x | Utility-first styling | Rapid UI development, excellent mobile responsiveness, small bundle |

## Core Data Models

### User Interface
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  subscriptionId?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  preferences: UserPreferences;
}

interface UserPreferences {
  emailNotifications: boolean;
  shareByDefault: boolean;
  preferredThemes: string[];
}
```

### FoodItem Interface
```typescript
interface FoodItem {
  id: string;
  name: string;
  description: string;
  culturalBackground: string;
  recipe?: Recipe;
  imageUrl: string;
  thumbnailUrl: string;
  theme: ThemeCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  origin: FoodOrigin;
  tags: string[];
  createdAt: Timestamp;
}

interface Recipe {
  ingredients: string[];
  instructions: string[];
  preparationTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface FoodOrigin {
  country: string;
  region?: string;
  culturalPeriod?: string;
  significance: string;
}

type ThemeCategory = 'weird-cursed' | 'global-street' | 'historical-desserts' | 'mythical-foods';
```

### UserCollection Interface
```typescript
interface UserCollection {
  userId: string;
  foodItemId: string;
  collectedAt: Timestamp;
  discoveryMethod: 'gachapon' | 'bonus' | 'achievement';
  viewedEducationalContent: boolean;
  shared: boolean;
}
```

## Frontend Stack Details

### React + TypeScript Configuration
- **React Version:** 18.x with Concurrent Features
- **TypeScript:** Strict mode enabled with comprehensive type checking
- **JSX Runtime:** Automatic JSX transform for optimal bundle size
- **State Management:** React Context API with useReducer for complex state

### Build and Development Tools
- **Vite Configuration:** Fast HMR, TypeScript support, automatic code splitting
- **ESLint:** React and TypeScript rules with accessibility checks
- **Prettier:** Consistent code formatting across the project
- **Husky:** Git hooks for pre-commit linting and testing

### UI and Styling
- **Material-UI (MUI):** Component library with custom theme
- **Tailwind CSS:** Utility-first CSS with mobile-first design
- **Responsive Design:** Mobile-first approach with breakpoint management
- **PWA Features:** Service worker, app manifest, offline capabilities

### Testing Framework
- **Jest:** Unit testing with React Testing Library
- **Playwright:** E2E testing with mobile device simulation
- **Firebase Emulator:** Integration testing with mock Firebase services
- **Coverage:** Minimum 80% code coverage for new components

## Backend Stack Details

### Firebase Services
- **Authentication:** Email/password with social login preparation
- **Firestore:** NoSQL database with real-time synchronization
- **Cloud Functions:** Serverless TypeScript functions for business logic
- **Cloud Storage:** File storage for food item images with CDN
- **Analytics:** User behavior tracking and performance monitoring

### API Architecture
- **REST Endpoints:** Standard HTTP methods for CRUD operations
- **Real-time Updates:** Firestore listeners for live collection updates
- **Authentication:** Firebase Auth tokens with custom claims
- **Error Handling:** Standardized error responses with retry logic

### Database Schema
```typescript
// Firestore Collections Structure
interface DatabaseSchema {
  users: {
    [userId: string]: User;
    collections: {
      [collectionId: string]: UserCollection;
    };
  };
  'food-items': {
    [itemId: string]: FoodItem;
  };
  'content-packs': {
    [packId: string]: ContentPack;
  };
  analytics: {
    [date: string]: DailyStats;
  };
}
```

## Development Environment

### Required Node.js Version
- **Node.js:** Version 18+ (required for Firebase Functions)
- **npm:** Latest version with workspace support
- **Firebase CLI:** Latest version for deployment and emulation

### Environment Variables
```bash
# Frontend (.env.local)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_STRIPE_PUBLISHABLE_KEY=

# Backend (.env - for Firebase Functions)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
ADMIN_EMAIL=
```

### Firebase Configuration
- **Project Region:** us-central1 for optimal performance
- **Security Rules:** Firestore and Storage rules for data protection
- **Indexes:** Composite indexes for efficient queries
- **Emulator Suite:** Local development with Auth, Firestore, Functions

## Deployment Architecture

### Frontend Deployment
- **Platform:** Vercel with automatic deployments from GitHub
- **Build Command:** `npm run build:web`
- **Output Directory:** `apps/web/dist`
- **CDN:** Vercel Edge Network with global distribution

### Backend Deployment
- **Platform:** Firebase Cloud Functions
- **Build Command:** `npm run build:functions`
- **Deployment:** Firebase CLI with GitHub Actions integration
- **Region:** us-central1 for consistency with Firestore

### CI/CD Pipeline
- **GitHub Actions:** Automated testing and deployment
- **Test Execution:** Unit, integration, and E2E tests
- **Environment Management:** Separate staging and production environments
- **Security Scanning:** Dependency vulnerability checks

## Performance Targets

### Frontend Performance
- **Bundle Size:** <500KB initial, <100KB per route
- **Core Web Vitals:** LCP <2.5s, FID <100ms, CLS <0.1
- **Caching Strategy:** Service worker with cache-first strategy
- **Image Optimization:** WebP format with lazy loading

### Backend Performance
- **Response Time:** <200ms for API calls, <500ms for complex operations
- **Database Queries:** Optimized with proper indexes
- **Function Cold Start:** <1s for TypeScript functions
- **Caching:** Firebase Functions memory caching for frequently accessed data

## Security Configuration

### Authentication Security
- **Password Policy:** Minimum 8 characters enforced by Firebase Auth
- **Session Management:** Secure HTTP-only cookies with proper flags
- **Token Validation:** ID token verification on all protected endpoints
- **Rate Limiting:** Function-level rate limiting for API endpoints

### Database Security
- **Firestore Rules:** User data isolation and proper access control
- **Data Validation:** Server-side validation for all user inputs
- **Encryption:** Data encrypted in transit and at rest by Firebase
- **Audit Logging:** Comprehensive logging for security monitoring

## Monitoring and Analytics

### Application Monitoring
- **Firebase Analytics:** User behavior and engagement tracking
- **Performance Monitoring:** Core Web Vitals and function performance
- **Error Tracking:** Structured error logging with context
- **Custom Metrics:** Business metrics for subscription and collection tracking

### Development Tools
- **Firebase Console:** Real-time database and function monitoring
- **Vercel Analytics:** Frontend performance and user metrics
- **GitHub Actions:** Build and deployment monitoring
- **Local Emulators:** Development and testing with mock services