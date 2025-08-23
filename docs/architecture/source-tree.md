# FoodDrop Project Structure

This document defines the complete project structure, file organization, and development conventions for the FoodDrop monorepo.

## Complete Project Structure

```plaintext
fooddrop/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml            # Test and build on PR
│       └── deploy.yaml        # Deploy to staging/production
├── apps/                       # Application packages
│   ├── web/                    # Frontend React application
│   │   ├── src/
│   │   │   ├── components/     # UI components organized by domain
│   │   │   │   ├── common/     # Reusable components (Button, Card, etc.)
│   │   │   │   ├── gachapon/   # Collection mechanics components
│   │   │   │   ├── collection/ # Collection display components
│   │   │   │   ├── education/  # Educational content components
│   │   │   │   └── subscription/ # Billing components
│   │   │   ├── pages/          # Route components (Dashboard, Collections, etc.)
│   │   │   ├── hooks/          # Custom React hooks (useAuth, useCollection)
│   │   │   ├── services/       # API client services with Firebase integration
│   │   │   ├── stores/         # Context providers for state management
│   │   │   ├── styles/         # Global styles and Tailwind configuration
│   │   │   └── utils/          # Frontend utilities and helpers
│   │   ├── public/             # Static assets (PWA manifest, icons, etc.)
│   │   ├── tests/              # Frontend tests (Jest + Testing Library)
│   │   └── package.json        # Frontend dependencies and scripts
│   └── functions/              # Firebase Cloud Functions backend
│       ├── src/
│       │   ├── api/            # HTTP API endpoints (REST routes)
│       │   ├── auth/           # Authentication triggers and helpers
│       │   ├── triggers/       # Database triggers (Firestore)
│       │   ├── scheduled/      # Cron jobs (weekly content, analytics)
│       │   ├── webhooks/       # External service webhooks (Stripe)
│       │   └── shared/         # Backend utilities and middleware
│       ├── tests/              # Backend tests (Jest + Firebase Emulator)
│       └── package.json        # Backend dependencies
├── packages/                   # Shared packages across frontend/backend
│   ├── shared/                 # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces (User, FoodItem, etc.)
│   │   │   ├── constants/      # Shared constants (themes, rarities, etc.)
│   │   │   ├── validation/     # Input validation schemas
│   │   │   └── utils/          # Shared utility functions
│   │   └── package.json
│   ├── ui/                     # Shared UI components (future expansion)
│   │   ├── src/
│   │   └── package.json
│   └── config/                 # Shared configuration
│       ├── eslint/             # ESLint configuration
│       ├── typescript/         # TypeScript configuration
│       └── jest/               # Jest testing configuration
├── infrastructure/             # Firebase configuration and rules
│   ├── firestore.rules         # Firestore security rules
│   ├── storage.rules           # Cloud Storage security rules
│   ├── firebase.json           # Firebase project configuration
│   └── .firebaserc             # Firebase project environments
├── scripts/                    # Build and deployment scripts
│   ├── setup.sh               # Local development setup
│   ├── test.sh                # Run all tests across packages
│   └── deploy.sh              # Production deployment script
├── docs/                       # Documentation
│   ├── prd.md                 # Product Requirements Document
│   ├── front-end-spec.md      # UI/UX Specification
│   ├── architecture.md        # This architecture document
│   └── api-docs.md            # API documentation
├── .env.example                # Environment variable template
├── package.json                # Root package.json with workspace configuration
├── package-lock.json           # Locked dependency versions
└── README.md                   # Project overview and setup instructions
```

## Frontend Structure (apps/web/)

### Component Organization
```plaintext
src/components/
├── common/                 # Reusable UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx  # Storybook stories (future)
│   │   └── index.ts
│   ├── Card/
│   ├── LoadingSpinner/
│   ├── ProgressRing/
│   └── ErrorBoundary/
├── gachapon/              # Collection-specific components  
│   ├── PullButton/
│   ├── PullAnimation/
│   ├── ItemReveal/
│   └── DuplicateHandler/
├── collection/            # Collection display components
│   ├── CollectionGrid/
│   ├── FoodItemCard/
│   ├── ProgressTracker/
│   └── CompletionCelebration/
├── education/             # Educational content components
│   ├── FoodItemDetail/
│   ├── CulturalContent/
│   ├── RecipeViewer/
│   └── RelatedItems/
└── subscription/          # Billing components
    ├── SubscriptionPrompt/
    ├── PricingDisplay/
    └── SubscriptionManager/
```

### Pages Structure
```plaintext
src/pages/
├── Dashboard/
│   ├── Dashboard.tsx
│   ├── Dashboard.test.tsx
│   └── index.ts
├── Collections/
├── Discover/
├── Profile/
├── Auth/
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ForgotPassword.tsx
└── NotFound/
```

### Services Structure
```plaintext
src/services/
├── api/
│   ├── ApiClient.ts           # Base API client with auth
│   ├── CollectionService.ts   # Collection-related API calls
│   ├── AuthService.ts         # Authentication API calls
│   ├── SubscriptionService.ts # Stripe/subscription API calls
│   └── ContentService.ts      # Food items and content API calls
├── firebase/
│   ├── config.ts             # Firebase configuration
│   ├── auth.ts               # Firebase Auth utilities
│   ├── firestore.ts          # Firestore utilities
│   └── storage.ts            # Cloud Storage utilities
└── analytics/
    ├── AnalyticsService.ts   # Firebase Analytics wrapper
    └── tracking.ts           # Event tracking utilities
```

### Stores Structure (React Context)
```plaintext
src/stores/
├── AuthContext.tsx           # Authentication state management
├── CollectionContext.tsx     # Collection state management
├── SubscriptionContext.tsx   # Subscription state management
├── UIContext.tsx            # UI state (theme, notifications)
└── index.ts                 # Export all contexts
```

### Testing Structure
```plaintext
tests/
├── components/              # Component unit tests
│   ├── gachapon/
│   │   ├── PullButton.test.tsx
│   │   └── PullAnimation.test.tsx
│   └── collection/
│       ├── CollectionGrid.test.tsx
│       └── FoodItemCard.test.tsx
├── hooks/                  # Custom hook tests
│   ├── useAuth.test.ts
│   └── useCollection.test.ts
├── services/               # API client tests
│   ├── CollectionService.test.ts
│   └── SubscriptionService.test.ts
├── integration/            # Integration tests
│   ├── auth-flow.test.tsx
│   └── collection-flow.test.tsx
├── utils/                  # Test utilities and mocks
│   ├── mockData.ts
│   ├── testUtils.tsx       # Custom render functions
│   └── mocks/              # Service mocks
└── setup.ts               # Jest setup configuration
```

## Backend Structure (apps/functions/)

### API Structure
```plaintext
src/api/
├── auth/
│   ├── profile.ts          # User profile management
│   ├── preferences.ts      # User preferences
│   └── validation.ts       # Auth validation utilities
├── collections/
│   ├── my-collection.ts    # Get user's collection
│   ├── progress.ts         # Collection progress tracking
│   └── stats.ts           # Collection statistics
├── gachapon/
│   ├── pull.ts            # Gachapon pull mechanism
│   ├── probabilities.ts   # Rarity probability calculations
│   └── rewards.ts         # Duplicate handling and rewards
├── content/
│   ├── food-items.ts      # Food item CRUD operations
│   ├── packs.ts           # Content pack management
│   └── search.ts          # Food item search functionality
└── subscriptions/
    ├── create.ts          # Stripe subscription creation
    ├── manage.ts          # Subscription management
    ├── webhooks.ts        # Stripe webhook handling
    └── status.ts          # Subscription status checking
```

### Database Triggers
```plaintext
src/triggers/
├── onUserCreate.ts         # Initialize user profile on registration
├── onCollectionUpdate.ts   # Update collection statistics
├── onSubscriptionChange.ts # Handle subscription status changes
└── onContentPackRelease.ts # Notify users of new content
```

### Scheduled Functions
```plaintext
src/scheduled/
├── weeklyContentRelease.ts # Release new content packs
├── analyticsAggregation.ts # Aggregate daily/weekly analytics
├── subscriptionReminders.ts # Send subscription renewal reminders
└── cleanupExpiredSessions.ts # Clean up expired user sessions
```

### Backend Testing
```plaintext
tests/
├── api/                   # API endpoint tests
│   ├── gachapon.test.ts
│   └── subscriptions.test.ts
├── triggers/              # Database trigger tests
│   ├── onCollectionUpdate.test.ts
│   └── onUserCreate.test.ts
├── scheduled/             # Scheduled function tests
│   └── weeklyContent.test.ts
├── shared/                # Utility tests
│   ├── auth.test.ts
│   └── validation.test.ts
└── mocks/                 # Firebase service mocks
    ├── firestore.ts
    └── auth.ts
```

## Shared Packages Structure

### Shared Types Package
```plaintext
packages/shared/src/
├── types/
│   ├── User.ts            # User-related interfaces
│   ├── FoodItem.ts        # Food item interfaces
│   ├── Collection.ts      # Collection interfaces
│   ├── Subscription.ts    # Subscription interfaces
│   ├── Analytics.ts       # Analytics interfaces
│   └── index.ts           # Export all types
├── constants/
│   ├── themes.ts          # Theme categories and metadata
│   ├── rarities.ts        # Rarity levels and probabilities
│   ├── subscription.ts    # Subscription pricing and features
│   └── validation.ts      # Validation rules and regex
├── validation/
│   ├── schemas.ts         # Joi/Zod validation schemas
│   ├── auth.ts            # Authentication validation
│   ├── content.ts         # Content validation
│   └── subscription.ts    # Subscription validation
└── utils/
    ├── date.ts            # Date formatting utilities
    ├── string.ts          # String manipulation utilities
    ├── collection.ts      # Collection calculation utilities
    └── probability.ts     # Gachapon probability utilities
```

## Configuration Structure

### Root Configuration Files
```plaintext
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier formatting rules
├── .gitignore            # Git ignore patterns
├── .nvmrc                # Node.js version specification
├── tsconfig.json         # Base TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.ts        # Vite build configuration
└── jest.config.js        # Jest testing configuration
```

### Environment Configuration
```plaintext
├── .env.example          # Environment variable template
├── .env.local           # Local development environment
├── .env.staging         # Staging environment variables
└── .env.production      # Production environment variables
```

## File Naming Conventions

### React Components
- **Components:** PascalCase (e.g., `FoodItemCard.tsx`)
- **Component Files:** Include component name + extension
- **Test Files:** Component name + `.test.tsx`
- **Story Files:** Component name + `.stories.tsx`
- **Index Files:** `index.ts` for clean imports

### Services and Utilities
- **Service Files:** kebab-case (e.g., `collection-service.ts`)
- **Utility Files:** kebab-case (e.g., `date-utils.ts`)
- **API Files:** kebab-case (e.g., `food-items.ts`)
- **Config Files:** kebab-case (e.g., `firebase-config.ts`)

### Backend Functions
- **Cloud Functions:** kebab-case (e.g., `gachapon-pull.ts`)
- **Trigger Functions:** camelCase with prefix (e.g., `onUserCreate.ts`)
- **Webhook Functions:** kebab-case (e.g., `stripe-webhook.ts`)

## Import/Export Patterns

### Barrel Exports
```typescript
// src/components/index.ts
export { Button } from './common/Button';
export { FoodItemCard } from './collection/FoodItemCard';
export { PullButton } from './gachapon/PullButton';

// Usage
import { Button, FoodItemCard, PullButton } from '@/components';
```

### Service Layer Imports
```typescript
// Use absolute imports with path mapping
import { CollectionService } from '@/services/api/CollectionService';
import { User, FoodItem } from '@shared/types';
import { THEME_CATEGORIES } from '@shared/constants';
```

### Type-Only Imports
```typescript
// Use type-only imports for better tree-shaking
import type { User } from '@shared/types/User';
import type { ComponentProps } from 'react';
```

## Development Workflow

### Local Development Commands
```bash
# Root level commands
npm run dev              # Start all services
npm run build           # Build all packages
npm test                # Run all tests
npm run lint            # Lint all packages

# Package-specific commands
npm run dev:web         # Frontend development server
npm run dev:functions   # Firebase Functions development
npm run test:web        # Frontend tests only
npm run test:functions  # Backend tests only
```

### Git Workflow
- **Branch naming:** `feature/story-1-1-project-setup`, `bugfix/auth-redirect`
- **Commit messages:** Conventional commits format
- **Pull requests:** Required for main branch
- **Code review:** All changes require approval

### File Organization Principles
- **Domain-driven:** Organize by feature/domain, not by file type
- **Colocation:** Keep related files (component + test + styles) together
- **Separation of concerns:** Clear boundaries between UI, logic, and data
- **Reusability:** Common components and utilities in shared packages