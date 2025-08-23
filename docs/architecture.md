# FoodDrop Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for FoodDrop, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

Based on your PRD technical preferences mentioning React.js with Create React App and Firebase suite, I see this is a greenfield project with some technology preferences already established. Given your:
- Budget constraints (zero upfront costs, free tiers only)
- Solo developer part-time (10-15 hours/week)
- Mobile-first PWA requirements
- Subscription billing needs

**Decision:** Proceeding with custom React + Firebase implementation as specified in PRD to maintain full control and minimize complexity.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-08-22 | 1.0 | Initial fullstack architecture creation | Winston (Architect) |

## High Level Architecture

### Technical Summary

FoodDrop employs a serverless-first architecture using React for the frontend and Firebase services for the backend, deployed as a Progressive Web App optimized for mobile-first collection gaming. The frontend leverages React with Context API for state management, implementing gachapon mechanics through satisfying animations and real-time collection tracking. Backend services utilize Firebase Authentication for user management, Firestore for NoSQL data storage, Cloud Functions for subscription automation and content delivery, and Cloud Storage for optimized food item imagery. Key integration points include Stripe for subscription billing, automated weekly content unlocking through Cloud Functions, and social sharing APIs for viral growth mechanics. This architecture achieves the PRD's $5/day revenue goal through minimal operational overhead while supporting the educational content delivery and collection completion psychology that drives user retention.

### Platform and Infrastructure Choice

**Platform:** Firebase + Vercel  
**Key Services:** Firebase Auth, Firestore, Cloud Functions, Cloud Storage, Stripe API, Vercel hosting  
**Deployment Host and Regions:** Vercel Edge Network (global), Firebase multi-region (us-central1 primary)

### Repository Structure

**Structure:** Monorepo with npm workspaces  
**Monorepo Tool:** npm workspaces (built-in, zero config)  
**Package Organization:** apps/ for deployable code, packages/ for shared libraries

### High Level Architecture Diagram

```mermaid
graph TD
    A[User Browser] --> B[Vercel CDN]
    B --> C[React PWA]
    C --> D[Firebase Auth]
    C --> E[Firestore DB]
    C --> F[Cloud Storage]
    C --> G[Stripe API]
    H[Cloud Functions] --> E
    H --> I[Email Service]
    J[Weekly Scheduler] --> H
    E --> K[(User Profiles)]
    E --> L[(Food Items)]
    E --> M[(Collections)]
    E --> N[(Subscriptions)]
    F --> O[Food Images]
    G --> P[Billing Events]
    P --> H
```

### Architectural Patterns

- **Jamstack Architecture:** Static React build with serverless APIs - _Rationale:_ Optimal performance and scalability for content-heavy applications with minimal backend complexity
- **Component-Based UI:** Reusable React components with TypeScript - _Rationale:_ Maintainability and type safety across collection interfaces and educational content displays
- **Event-Driven Backend:** Firebase triggers and Cloud Functions - _Rationale:_ Enables automated content delivery and subscription management without server maintenance
- **Progressive Web App:** Service worker caching with offline capabilities - _Rationale:_ App-like experience without app store barriers, critical for user acquisition strategy
- **Serverless Functions:** Firebase Cloud Functions for business logic - _Rationale:_ Zero infrastructure management while supporting subscription billing and content automation

## Tech Stack

### Technology Stack Table

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

## Data Models

### User

**Purpose:** Represents registered users with authentication, subscription status, and collection progress tracking

**Key Attributes:**
- uid: string - Firebase Auth unique identifier for secure user reference
- email: string - User email address for authentication and communication
- displayName: string - Optional user display name for profile personalization
- subscriptionStatus: 'active' | 'inactive' | 'cancelled' - Current subscription state for content access control
- subscriptionId: string - Stripe subscription ID for billing management
- createdAt: Timestamp - Account creation date for analytics and user lifecycle tracking
- lastLoginAt: Timestamp - Recent activity tracking for engagement metrics
- preferences: UserPreferences - User customization settings and content preferences

#### TypeScript Interface

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

#### Relationships
- One-to-many with UserCollections (user owns multiple collected items)
- One-to-one with SubscriptionData (billing information)
- One-to-many with SharedItems (social sharing history)

### FoodItem

**Purpose:** Core content entity representing individual collectible food items with cultural/educational information

**Key Attributes:**
- id: string - Unique identifier for food item reference and collection tracking
- name: string - Display name of the food item for UI presentation
- description: string - Brief description for card displays and search functionality
- culturalBackground: string - Detailed cultural and historical context for educational value
- recipe?: Recipe - Optional cooking instructions when applicable to food type
- imageUrl: string - Cloud Storage URL for high-quality food photography
- thumbnailUrl: string - Optimized thumbnail for collection grid displays
- theme: ThemeCategory - Themed pack classification for collection organization
- rarity: 'common' | 'uncommon' | 'rare' | 'legendary' - Gachapon probability weighting
- origin: FoodOrigin - Geographic and cultural source information
- tags: string[] - Searchable keywords for content discovery and filtering

#### TypeScript Interface

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

#### Relationships
- Many-to-many with Users through UserCollections (users collect multiple items)
- One-to-many with ContentPacks (items belong to weekly content releases)
- Referenced in SharedItems for social media sharing

### UserCollection

**Purpose:** Junction entity tracking which food items each user has collected with metadata

**Key Attributes:**
- userId: string - Reference to User who collected the item
- foodItemId: string - Reference to collected FoodItem
- collectedAt: Timestamp - When item was obtained for progress tracking
- discoveryMethod: string - How item was obtained (gachapon, bonus, etc.)
- viewedEducationalContent: boolean - Whether user engaged with cultural content
- shared: boolean - Whether user shared this item on social media

#### TypeScript Interface

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

#### Relationships
- Many-to-one with User (collection belongs to one user)
- Many-to-one with FoodItem (references specific food item)
- Used for collection completion calculations and progress tracking

### ContentPack

**Purpose:** Weekly themed collections that organize food items for subscription content delivery

**Key Attributes:**
- id: string - Unique pack identifier for content delivery automation
- theme: ThemeCategory - Pack theme matching food item classifications
- name: string - Display name for pack (e.g., "Street Foods of Bangkok")
- description: string - Pack description for user anticipation and discovery
- foodItemIds: string[] - Array of food items included in this pack
- releaseDate: Timestamp - When pack becomes available to subscribers
- isActive: boolean - Whether pack is currently available for collection
- subscriberCount: number - Analytics for pack popularity tracking

#### TypeScript Interface

```typescript
interface ContentPack {
  id: string;
  theme: ThemeCategory;
  name: string;
  description: string;
  foodItemIds: string[];
  releaseDate: Timestamp;
  isActive: boolean;
  subscriberCount: number;
  createdAt: Timestamp;
}
```

#### Relationships
- One-to-many with FoodItems (pack contains multiple food items)
- Referenced by subscription automation for weekly content delivery
- Used for collection progress calculations by theme

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: FoodDrop API
  version: 1.0.0
  description: RESTful API for FoodDrop food collection game with subscription and educational content

servers:
  - url: https://us-central1-fooddrop-app.cloudfunctions.net/api
    description: Firebase Cloud Functions API

paths:
  /auth/profile:
    get:
      summary: Get current user profile
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
    
  /collections/my:
    get:
      summary: Get user's collected food items
      security:
        - BearerAuth: []
      parameters:
        - name: theme
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
      responses:
        '200':
          description: User's collection
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/UserCollection'
  
  /gachapon/pull:
    post:
      summary: Perform gachapon pull to collect new food item
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                packId:
                  type: string
                  description: Content pack to pull from
      responses:
        '200':
          description: Successful pull result
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  foodItem:
                    $ref: '#/components/schemas/FoodItem'
                  isNew:
                    type: boolean
                  collectionProgress:
                    type: object
        '402':
          description: Subscription required
          
  /food-items/{id}:
    get:
      summary: Get detailed food item information
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Food item details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FoodItem'
  
  /subscriptions/create:
    post:
      summary: Create Stripe subscription
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                paymentMethodId:
                  type: string
      responses:
        '200':
          description: Subscription created
          content:
            application/json:
              schema:
                type: object
                properties:
                  subscriptionId:
                    type: string
                  clientSecret:
                    type: string
  
  /subscriptions/cancel:
    post:
      summary: Cancel current subscription
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Subscription cancelled

components:
  schemas:
    User:
      type: object
      properties:
        uid:
          type: string
        email:
          type: string
        displayName:
          type: string
        subscriptionStatus:
          type: string
          enum: [active, inactive, cancelled]
        createdAt:
          type: string
          format: date-time
    
    FoodItem:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        culturalBackground:
          type: string
        imageUrl:
          type: string
        theme:
          type: string
          enum: [weird-cursed, global-street, historical-desserts, mythical-foods]
        rarity:
          type: string
          enum: [common, uncommon, rare, legendary]
    
    UserCollection:
      type: object
      properties:
        userId:
          type: string
        foodItemId:
          type: string
        collectedAt:
          type: string
          format: date-time
        discoveryMethod:
          type: string
        viewedEducationalContent:
          type: boolean

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Components

### Authentication Service
**Responsibility:** Manages user authentication, session management, and subscription status validation

**Key Interfaces:**
- `authenticateUser(token: string): Promise<User>`
- `validateSubscription(userId: string): Promise<boolean>`
- `updateUserProfile(userId: string, updates: Partial<User>): Promise<void>`

**Dependencies:** Firebase Auth, Firestore users collection

**Technology Stack:** Firebase Auth SDK, Cloud Functions for custom claims

### Collection Engine
**Responsibility:** Handles gachapon mechanics, probability calculations, and collection tracking

**Key Interfaces:**
- `performPull(userId: string, packId: string): Promise<PullResult>`
- `getCollectionProgress(userId: string): Promise<CollectionProgress>`
- `updateUserCollection(userId: string, foodItemId: string): Promise<void>`

**Dependencies:** Firestore food-items and user-collections, Content Service

**Technology Stack:** Cloud Functions with Firestore transactions for atomic operations

### Content Management Service
**Responsibility:** Manages food item database, weekly content packs, and educational content delivery

**Key Interfaces:**
- `getActivePacks(): Promise<ContentPack[]>`
- `getFoodItemDetails(id: string): Promise<FoodItem>`
- `scheduleWeeklyRelease(packId: string, date: Date): Promise<void>`

**Dependencies:** Firestore content collections, Cloud Storage for images

**Technology Stack:** Cloud Functions with scheduled triggers, Firestore queries

### Subscription Service
**Responsibility:** Integrates with Stripe for billing management and subscription lifecycle

**Key Interfaces:**
- `createSubscription(userId: string, paymentMethodId: string): Promise<SubscriptionResult>`
- `cancelSubscription(subscriptionId: string): Promise<void>`
- `handleWebhook(event: StripeEvent): Promise<void>`

**Dependencies:** Stripe API, Firestore user records, Authentication Service

**Technology Stack:** Stripe Node.js SDK, Cloud Functions with webhook endpoints

### Social Sharing Service
**Responsibility:** Generates shareable content and tracks viral growth metrics

**Key Interfaces:**
- `generateShareContent(foodItem: FoodItem, userId: string): Promise<ShareContent>`
- `trackShare(userId: string, foodItemId: string, platform: string): Promise<void>`
- `getViralMetrics(): Promise<ViralStats>`

**Dependencies:** Content Management Service, Analytics Service

**Technology Stack:** Cloud Functions for share generation, Firebase Analytics for tracking

### Component Diagrams

```mermaid
graph TD
    A[React App] --> B[Authentication Service]
    A --> C[Collection Engine]
    A --> D[Content Management Service]
    A --> E[Social Sharing Service]
    
    B --> F[Firebase Auth]
    B --> G[Firestore Users]
    
    C --> G
    C --> H[Firestore Collections]
    C --> D
    
    D --> I[Firestore Content]
    D --> J[Cloud Storage]
    
    E --> D
    E --> K[Firebase Analytics]
    
    L[Subscription Service] --> M[Stripe API]
    L --> G
    L --> B
    
    N[Cloud Scheduler] --> D
    M --> L
```

## External APIs

### Stripe Payment API
- **Purpose:** Subscription billing management and payment processing
- **Documentation:** https://stripe.com/docs/api
- **Base URL(s):** https://api.stripe.com/v1
- **Authentication:** Secret key authorization header
- **Rate Limits:** 100 requests per second per account

**Key Endpoints Used:**
- `POST /subscriptions` - Create new subscription
- `GET /subscriptions/{id}` - Retrieve subscription details  
- `POST /subscriptions/{id}` - Update subscription
- `DELETE /subscriptions/{id}` - Cancel subscription
- `POST /webhooks` - Handle billing events

**Integration Notes:** All payment processing handled by Stripe hosted checkout. Webhooks used for subscription status synchronization with Firestore. Customer portal enables self-service subscription management.

### Firebase Services (External to our functions)
- **Purpose:** Backend-as-a-service providing authentication, database, storage, and hosting
- **Documentation:** https://firebase.google.com/docs
- **Base URL(s):** Various Firebase service endpoints
- **Authentication:** Service account keys and Firebase Admin SDK
- **Rate Limits:** Generous free tier quotas suitable for MVP scale

**Key Services Used:**
- Authentication for user management
- Firestore for real-time database
- Cloud Storage for image hosting
- Cloud Functions for serverless compute
- Analytics for usage tracking

**Integration Notes:** Native Firebase SDK integration provides seamless real-time updates and offline capability. Security rules enforce data access controls at database level.

## Core Workflows

```mermaid
sequenceDiagram
    participant U as User
    participant A as React App  
    participant Auth as Firebase Auth
    participant CE as Collection Engine
    participant FS as Firestore
    participant S as Stripe
    participant SS as Subscription Service

    Note over U,SS: Gachapon Collection Flow with Subscription Check
    
    U->>A: Click "Pull" button
    A->>Auth: Validate user session
    Auth-->>A: User authenticated
    
    A->>CE: performPull(userId, packId)
    CE->>FS: Check user subscription status
    FS-->>CE: subscriptionStatus: 'inactive'
    
    CE-->>A: Subscription required error
    A->>U: Show subscription prompt
    
    U->>A: Subscribe ($2.99/month)
    A->>S: Create checkout session
    S-->>A: Checkout URL
    A->>U: Redirect to Stripe checkout
    
    U->>S: Complete payment
    S->>SS: Webhook: subscription.created
    SS->>FS: Update user subscription status
    SS->>FS: Trigger welcome content unlock
    
    S-->>A: Payment success redirect
    A->>U: Welcome message + "Pull Now"
    
    U->>A: Click "Pull" (retry)
    A->>CE: performPull(userId, packId)
    CE->>FS: Verify subscription + get available items
    FS-->>CE: Active subscription + item pool
    
    CE->>CE: Calculate probability + select item
    CE->>FS: Update user collection (atomic)
    FS-->>CE: Collection updated + progress
    
    CE-->>A: PullResult with new food item
    A->>U: Success animation + item reveal
    A->>U: Show food item details + share option
```

## Database Schema

```sql
-- Firestore Collection Structure (NoSQL Document Format)

-- Users Collection
users/{userId} {
  uid: string,
  email: string,
  displayName?: string,
  subscriptionStatus: 'active' | 'inactive' | 'cancelled',
  subscriptionId?: string,
  stripeCustomerId?: string,
  createdAt: timestamp,
  lastLoginAt: timestamp,
  preferences: {
    emailNotifications: boolean,
    shareByDefault: boolean,
    preferredThemes: string[]
  },
  stats: {
    totalItemsCollected: number,
    packagesCompleted: number,
    lastPullAt?: timestamp
  }
}

-- Food Items Collection  
food-items/{itemId} {
  id: string,
  name: string,
  description: string,
  culturalBackground: string,
  recipe?: {
    ingredients: string[],
    instructions: string[],
    preparationTime: number,
    servings: number,
    difficulty: 'easy' | 'medium' | 'hard'
  },
  imageUrl: string,
  thumbnailUrl: string,
  theme: 'weird-cursed' | 'global-street' | 'historical-desserts' | 'mythical-foods',
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary',
  origin: {
    country: string,
    region?: string,
    culturalPeriod?: string,
    significance: string
  },
  tags: string[],
  createdAt: timestamp,
  isActive: boolean
}

-- User Collections Subcollection
users/{userId}/collections/{collectionId} {
  foodItemId: string,
  collectedAt: timestamp,
  discoveryMethod: 'gachapon' | 'bonus' | 'achievement',
  viewedEducationalContent: boolean,
  shared: boolean,
  shareCount: number
}

-- Content Packs Collection
content-packs/{packId} {
  id: string,
  theme: string,
  name: string,
  description: string,
  foodItemIds: string[],
  releaseDate: timestamp,
  isActive: boolean,
  subscriberCount: number,
  createdAt: timestamp,
  rarityDistribution: {
    common: number,
    uncommon: number, 
    rare: number,
    legendary: number
  }
}

-- Subscription Events Collection (for webhooks)
subscription-events/{eventId} {
  stripeEventId: string,
  userId: string,
  type: string,
  processed: boolean,
  processedAt?: timestamp,
  data: object,
  createdAt: timestamp
}

-- Analytics Collection
analytics/daily-stats/{date} {
  date: string,
  pullCount: number,
  newUsers: number,
  activeSubscribers: number,
  revenue: number,
  topFoodItems: string[],
  shareEvents: number
}

-- Firestore Indexes
-- Composite indexes for efficient queries:
-- users/{userId}/collections: [foodItemId, collectedAt]
-- food-items: [theme, rarity, isActive]
-- content-packs: [isActive, releaseDate]
-- food-items: [tags, isActive] (for search)
```

## Frontend Architecture

### Component Architecture

#### Component Organization
```
src/
├── components/
│   ├── common/                 # Reusable UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── LoadingSpinner/
│   │   └── ProgressRing/
│   ├── gachapon/              # Collection-specific components  
│   │   ├── PullButton/
│   │   ├── PullAnimation/
│   │   ├── ItemReveal/
│   │   └── DuplicateHandler/
│   ├── collection/            # Collection display components
│   │   ├── CollectionGrid/
│   │   ├── FoodItemCard/
│   │   ├── ProgressTracker/
│   │   └── CompletionCelebration/
│   ├── education/             # Educational content components
│   │   ├── FoodItemDetail/
│   │   ├── CulturalContent/
│   │   ├── RecipeViewer/
│   │   └── RelatedItems/
│   └── subscription/          # Billing components
│       ├── SubscriptionPrompt/
│       ├── PricingDisplay/
│       └── SubscriptionManager/
├── pages/                     # Route components
│   ├── Dashboard/
│   ├── Collections/
│   ├── Discover/
│   └── Profile/
├── hooks/                     # Custom React hooks
├── services/                  # API client services
├── stores/                    # Context providers
└── utils/                     # Frontend utilities
```

#### Component Template
```typescript
// Template for collection-focused components
interface FoodItemCardProps {
  foodItem: FoodItem;
  isCollected: boolean;
  onSelect: (item: FoodItem) => void;
  showEducationalHint?: boolean;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  foodItem,
  isCollected,
  onSelect,
  showEducationalHint = false
}) => {
  const { user } = useAuth();
  const { trackInteraction } = useAnalytics();
  
  const handleClick = useCallback(() => {
    trackInteraction('food_item_view', { itemId: foodItem.id });
    onSelect(foodItem);
  }, [foodItem.id, onSelect, trackInteraction]);

  return (
    <Card 
      className={`food-item-card ${isCollected ? 'collected' : 'placeholder'}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${foodItem.name} from ${foodItem.origin.country}`}
    >
      {isCollected ? (
        <img 
          src={foodItem.thumbnailUrl} 
          alt={foodItem.name}
          className="food-image"
          loading="lazy"
        />
      ) : (
        <div className="placeholder-silhouette" />
      )}
      
      <div className="item-info">
        <h3 className="item-name">{isCollected ? foodItem.name : '???'}</h3>
        <span className="rarity-badge">{foodItem.rarity}</span>
        {showEducationalHint && isCollected && (
          <div className="educational-hint">
            <BookIcon size={16} />
            <span>Learn more</span>
          </div>
        )}
      </div>
    </Card>
  );
};
```

### State Management Architecture

#### State Structure
```typescript
// Global application state using React Context
interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
  };
  collection: {
    items: UserCollection[];
    progress: CollectionProgress;
    activePacks: ContentPack[];
    loading: boolean;
  };
  subscription: {
    status: SubscriptionStatus;
    currentPlan: SubscriptionPlan | null;
    billingInfo: BillingInfo | null;
  };
  ui: {
    pullAnimation: PullAnimationState;
    notifications: Notification[];
    theme: 'light' | 'dark';
  };
}

// Context providers for separation of concerns
const AuthProvider: React.FC<{ children: React.ReactNode }>;
const CollectionProvider: React.FC<{ children: React.ReactNode }>;
const SubscriptionProvider: React.FC<{ children: React.ReactNode }>;
```

#### State Management Patterns
- **Optimistic Updates:** UI updates immediately, reverts on API failure
- **Real-time Sync:** Firestore listeners for live collection updates
- **Offline Support:** Local state persistence with sync on reconnection
- **Error Boundaries:** Component-level error handling with retry mechanisms
- **Loading States:** Granular loading indicators for different UI sections

### Routing Architecture

#### Route Organization
```
/                           # Landing/Dashboard (authenticated users)
/login                      # Authentication
/register                   # User registration
/dashboard                  # Main collection interface
/collections                # Collection management
  /collections/:theme       # Themed pack view
/discover                   # Educational content browsing
/food/:id                   # Food item detail view
/profile                    # User account management
  /profile/subscription     # Subscription management
  /profile/settings         # User preferences
/share/:itemId              # Social sharing landing
```

#### Protected Route Pattern
```typescript
// Higher-order component for subscription-gated routes
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
  fallback?: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresSubscription = false,
  fallback: Fallback = SubscriptionPrompt
}) => {
  const { user, isAuthenticated } = useAuth();
  const { subscriptionStatus } = useSubscription();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiresSubscription && subscriptionStatus !== 'active') {
    return <Fallback />;
  }
  
  return <>{children}</>;
};

// Usage in router configuration
<Route path="/dashboard" element={
  <ProtectedRoute requiresSubscription={true}>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Frontend Services Layer

#### API Client Setup
```typescript
// Centralized API client with authentication and error handling
class ApiClient {
  private baseURL = process.env.REACT_APP_API_URL;
  private auth = getAuth();

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = await this.auth.currentUser?.getIdToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    
    return response.json();
  }

  // Specialized methods for different domains
  collection = new CollectionApi(this);
  subscription = new SubscriptionApi(this);
  social = new SocialApi(this);
}

export const apiClient = new ApiClient();
```

#### Service Example
```typescript
// Collection service with optimistic updates and caching
export class CollectionService {
  constructor(private api: ApiClient) {}

  async performPull(packId: string): Promise<PullResult> {
    try {
      // Optimistic UI update
      this.updateUIOptimistically('pulling');
      
      const result = await this.api.request<PullResult>('/gachapon/pull', {
        method: 'POST',
        body: JSON.stringify({ packId })
      });
      
      // Update local cache
      await this.updateLocalCollection(result.foodItem);
      
      return result;
    } catch (error) {
      // Revert optimistic update
      this.revertOptimisticUpdate();
      throw error;
    }
  }

  async getUserCollection(theme?: string): Promise<UserCollection[]> {
    const cached = this.getCachedCollection(theme);
    if (cached && !this.isStale(cached)) {
      return cached.data;
    }

    const fresh = await this.api.request<UserCollection[]>('/collections/my', {
      method: 'GET',
      params: theme ? { theme } : undefined
    });

    this.setCachedCollection(fresh, theme);
    return fresh;
  }
}
```

## Backend Architecture

### Service Architecture

#### Function Organization
```
functions/
├── src/
│   ├── auth/              # Authentication functions
│   │   ├── onUserCreate.ts
│   │   ├── onUserDelete.ts
│   │   └── validateToken.ts
│   ├── api/               # HTTP API endpoints
│   │   ├── collections.ts
│   │   ├── gachapon.ts
│   │   ├── subscriptions.ts
│   │   └── food-items.ts
│   ├── triggers/          # Database triggers
│   │   ├── onCollectionUpdate.ts
│   │   ├── onSubscriptionChange.ts
│   │   └── onContentPackRelease.ts
│   ├── scheduled/         # Cron jobs
│   │   ├── weeklyContentRelease.ts
│   │   ├── analyticsAggregation.ts
│   │   └── subscriptionReminders.ts
│   ├── webhooks/          # External service webhooks
│   │   ├── stripeWebhook.ts
│   │   └── socialWebhook.ts
│   └── shared/            # Shared utilities
│       ├── auth.ts
│       ├── validation.ts
│       ├── errors.ts
│       └── analytics.ts
```

#### Function Template
```typescript
// Serverless function template with authentication and error handling
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { validateAuth, validateSubscription } from '../shared/auth';
import { validateInput } from '../shared/validation';
import { trackAnalytics } from '../shared/analytics';

interface PullRequest {
  packId: string;
}

interface PullResponse {
  success: boolean;
  foodItem: FoodItem;
  isNew: boolean;
  collectionProgress: CollectionProgress;
}

export const performGachaponPull = onCall<PullRequest, PullResponse>({
  region: 'us-central1',
  cors: true,
  enforceAppCheck: true
}, async (request) => {
  try {
    // Authentication
    const user = await validateAuth(request.auth);
    
    // Subscription validation
    await validateSubscription(user.uid);
    
    // Input validation
    const { packId } = validateInput(request.data, {
      packId: { type: 'string', required: true }
    });
    
    // Business logic
    const result = await pullService.performPull(user.uid, packId);
    
    // Analytics tracking
    await trackAnalytics('gachapon_pull', {
      userId: user.uid,
      packId,
      itemId: result.foodItem.id,
      isNew: result.isNew
    });
    
    return result;
    
  } catch (error) {
    console.error('Gachapon pull error:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Pull failed', { 
      code: 'PULL_FAILED',
      timestamp: new Date().toISOString()
    });
  }
});
```

### Database Architecture

#### Schema Design
```sql
-- Optimized Firestore structure for gachapon mechanics
-- Collections designed for efficient queries and real-time updates

-- Primary Collections
users/                      # User profiles and subscription status
food-items/                 # Master food item catalog
content-packs/              # Weekly themed releases
analytics/                  # Usage and revenue tracking

-- User Subcollections (for data isolation and security)
users/{userId}/collections/ # User's collected items
users/{userId}/preferences/ # User settings and customization
users/{userId}/analytics/   # Personal usage statistics

-- Real-time optimization indexes
-- food-items: [theme, rarity, isActive] - for pack filtering
-- users/{userId}/collections: [collectedAt] - for recent items
-- content-packs: [isActive, releaseDate] - for current content
-- users: [subscriptionStatus, lastLoginAt] - for engagement queries
```

#### Data Access Layer
```typescript
// Repository pattern for consistent data access
export class CollectionRepository {
  private db = getFirestore();

  async getUserCollection(userId: string, theme?: string): Promise<UserCollection[]> {
    let query = this.db
      .collection(`users/${userId}/collections`)
      .orderBy('collectedAt', 'desc');
    
    if (theme) {
      // Join with food-items to filter by theme
      const foodItems = await this.getFoodItemsByTheme(theme);
      const itemIds = foodItems.map(item => item.id);
      query = query.where('foodItemId', 'in', itemIds);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserCollection));
  }

  async addToCollection(userId: string, foodItemId: string): Promise<void> {
    const batch = this.db.batch();
    
    // Add to user's collection
    const collectionRef = this.db
      .collection(`users/${userId}/collections`)
      .doc();
    
    batch.set(collectionRef, {
      foodItemId,
      collectedAt: FieldValue.serverTimestamp(),
      discoveryMethod: 'gachapon',
      viewedEducationalContent: false,
      shared: false
    });
    
    // Update user stats
    const userRef = this.db.doc(`users/${userId}`);
    batch.update(userRef, {
      'stats.totalItemsCollected': FieldValue.increment(1),
      'stats.lastPullAt': FieldValue.serverTimestamp()
    });
    
    await batch.commit();
  }

  async getCollectionProgress(userId: string): Promise<CollectionProgress> {
    const [collections, allPacks] = await Promise.all([
      this.getUserCollection(userId),
      this.getActivePacks()
    ]);
    
    const progress: CollectionProgress = {};
    
    for (const pack of allPacks) {
      const collected = collections.filter(c => 
        pack.foodItemIds.includes(c.foodItemId)
      ).length;
      
      progress[pack.theme] = {
        collected,
        total: pack.foodItemIds.length,
        percentage: Math.round((collected / pack.foodItemIds.length) * 100)
      };
    }
    
    return progress;
  }
}
```

### Authentication and Authorization

#### Auth Flow
```mermaid
sequenceDiagram
    participant U as User
    participant A as React App
    participant FA as Firebase Auth
    participant CF as Cloud Functions
    participant FS as Firestore
    
    U->>A: Login with email/password
    A->>FA: signInWithEmailAndPassword()
    FA-->>A: User credential + ID token
    
    A->>CF: API call with Bearer token
    CF->>FA: Verify ID token
    FA-->>CF: Decoded token + user claims
    
    CF->>FS: Check user subscription status
    FS-->>CF: User document with subscription data
    
    CF->>CF: Authorize request based on subscription
    CF-->>A: API response or 402 Payment Required
    
    Note over U,FS: Custom Claims for Subscription Status
    
    CF->>FA: Set custom claims for active subscriber
    FA->>A: Token refresh with new claims
    A->>A: Update UI based on subscription status
```

#### Middleware/Guards
```typescript
// Authentication middleware for Cloud Functions
export async function validateAuth(auth: AuthData | undefined): Promise<DecodedIdToken> {
  if (!auth?.token) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(auth.token);
    return decodedToken;
  } catch (error) {
    throw new HttpsError('unauthenticated', 'Invalid authentication token');
  }
}

// Subscription authorization guard
export async function validateSubscription(userId: string): Promise<void> {
  const userDoc = await getFirestore().doc(`users/${userId}`).get();
  
  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User not found');
  }
  
  const userData = userDoc.data();
  
  if (userData?.subscriptionStatus !== 'active') {
    throw new HttpsError('permission-denied', 'Active subscription required', {
      code: 'SUBSCRIPTION_REQUIRED',
      subscriptionStatus: userData?.subscriptionStatus || 'none'
    });
  }
}

// Role-based access control for admin functions
export async function validateAdminAccess(auth: AuthData): Promise<void> {
  const user = await validateAuth(auth);
  
  if (!user.admin) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }
}
```

## Unified Project Structure

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

## Development Workflow

### Local Development Setup

#### Prerequisites
```bash
# Install Node.js (v18+ required for Firebase Functions)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Firebase CLI globally
npm install -g firebase-tools

# Install Java (required for Firestore emulator)
sudo apt-get install openjdk-11-jre-headless

# Verify installations
node --version    # Should be 18+
npm --version
firebase --version
java -version
```

#### Initial Setup
```bash
# Clone repository and install dependencies
git clone <repository-url> fooddrop
cd fooddrop
npm install

# Install dependencies for all packages
npm run install:all

# Set up Firebase project
firebase login
firebase use --add  # Select your Firebase project

# Copy environment template and configure
cp .env.example .env.local
# Edit .env.local with your Firebase config and Stripe keys

# Initialize Firebase emulators
firebase init emulators
# Select: Firestore, Functions, Auth, Storage

# Start development environment
npm run dev
```

#### Development Commands
```bash
# Start all services (frontend + backend + emulators)
npm run dev

# Start frontend only (React app on port 3000)
npm run dev:web

# Start backend only (Firebase emulators + functions)
npm run dev:functions

# Run tests
npm test                    # All tests
npm run test:web           # Frontend tests only
npm run test:functions     # Backend tests only
npm run test:e2e          # End-to-end tests with Playwright

# Build for production
npm run build             # Build all packages
npm run build:web         # Frontend build only
npm run build:functions   # Backend build only

# Linting and formatting
npm run lint              # ESLint across all packages
npm run format            # Prettier formatting
npm run type-check        # TypeScript compilation check
```

### Environment Configuration

#### Required Environment Variables
```bash
# Frontend (.env.local)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=fooddrop-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fooddrop-app
REACT_APP_FIREBASE_STORAGE_BUCKET=fooddrop-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_API_URL=http://localhost:5001/fooddrop-app/us-central1/api

# Backend (.env - for Firebase Functions)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SENDGRID_API_KEY=SG.your_sendgrid_api_key
ADMIN_EMAIL=admin@fooddrop.com

# Shared (both environments)
NODE_ENV=development
FIREBASE_PROJECT_ID=fooddrop-app
FIREBASE_REGION=us-central1
```

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel (connected to GitHub for automatic deployments)
- **Build Command:** `npm run build:web`
- **Output Directory:** `apps/web/dist`
- **CDN/Edge:** Vercel Edge Network with automatic static optimization

**Backend Deployment:**
- **Platform:** Firebase Cloud Functions
- **Build Command:** `npm run build:functions`
- **Deployment Method:** Firebase CLI with GitHub Actions integration

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run test:e2e

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build:web
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build:functions
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: fooddrop-app
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:5001 | Local development with emulators |
| Staging | https://staging.fooddrop.app | https://us-central1-fooddrop-staging.cloudfunctions.net | Pre-production testing |
| Production | https://fooddrop.app | https://us-central1-fooddrop-app.cloudfunctions.net | Live environment |

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: `script-src 'self' https://js.stripe.com; object-src 'none'; base-uri 'self';`
- XSS Prevention: Automatic React escaping + DOMPurify for user-generated content
- Secure Storage: Firebase Auth tokens in httpOnly cookies, sensitive data in secure localStorage

**Backend Security:**
- Input Validation: Joi schema validation for all API endpoints with sanitization
- Rate Limiting: 100 requests/minute per user, 1000/minute per IP using Firebase Functions
- CORS Policy: `{ origin: ['https://fooddrop.app', 'https://staging.fooddrop.app'], credentials: true }`

**Authentication Security:**
- Token Storage: Firebase Auth ID tokens with automatic refresh
- Session Management: Firebase Auth session cookies with secure, httpOnly, sameSite flags
- Password Policy: Minimum 8 characters, complexity requirements via Firebase Auth

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: <500KB initial bundle, <100KB per route chunk
- Loading Strategy: React.lazy() code splitting, image lazy loading with Intersection Observer
- Caching Strategy: Service Worker with Cache API for food images, localStorage for user preferences

**Backend Performance:**
- Response Time Target: <200ms for API calls, <500ms for gachapon pulls
- Database Optimization: Firestore composite indexes, pagination with cursors, connection pooling
- Caching Strategy: Firebase Functions memory caching, CDN caching for static assets (24h TTL)

## Testing Strategy

### Testing Pyramid
```
    E2E Tests (Playwright)
   /                      \
  Integration Tests (Firebase Emulator)
 /                                      \
Frontend Unit Tests (Jest)    Backend Unit Tests (Jest)
```

### Test Organization

#### Frontend Tests
```
apps/web/tests/
├── components/           # Component unit tests
│   ├── gachapon/
│   │   ├── PullButton.test.tsx
│   │   └── PullAnimation.test.tsx
│   └── collection/
│       ├── CollectionGrid.test.tsx
│       └── FoodItemCard.test.tsx
├── hooks/               # Custom hook tests
│   ├── useAuth.test.ts
│   └── useCollection.test.ts
├── services/            # API client tests
│   ├── CollectionService.test.ts
│   └── SubscriptionService.test.ts
└── integration/         # Integration tests
    ├── auth-flow.test.tsx
    └── collection-flow.test.tsx
```

#### Backend Tests
```
apps/functions/tests/
├── api/                 # API endpoint tests
│   ├── gachapon.test.ts
│   └── subscriptions.test.ts
├── triggers/            # Database trigger tests
│   ├── onCollectionUpdate.test.ts
│   └── onUserCreate.test.ts
├── scheduled/           # Scheduled function tests
│   └── weeklyContent.test.ts
└── shared/              # Utility tests
    ├── auth.test.ts
    └── validation.test.ts
```

#### E2E Tests
```
tests/e2e/
├── auth/                # Authentication flows
│   ├── login.spec.ts
│   └── registration.spec.ts
├── collection/          # Collection workflows
│   ├── gachapon-pull.spec.ts
│   └── collection-progress.spec.ts
├── subscription/        # Billing workflows
│   ├── subscribe.spec.ts
│   └── cancel-subscription.spec.ts
└── fixtures/            # Test data and utilities
    ├── test-users.json
    └── mock-food-items.json
```

### Test Examples

#### Frontend Component Test
```typescript
// apps/web/tests/components/gachapon/PullButton.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PullButton } from '@/components/gachapon/PullButton';
import { AuthProvider } from '@/stores/AuthContext';
import { CollectionProvider } from '@/stores/CollectionContext';

const MockProviders = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <CollectionProvider>
      {children}
    </CollectionProvider>
  </AuthProvider>
);

describe('PullButton', () => {
  it('should trigger pull animation when clicked', async () => {
    const mockPull = jest.fn().mockResolvedValue({
      success: true,
      foodItem: { id: '1', name: 'Test Food' },
      isNew: true
    });

    render(
      <MockProviders>
        <PullButton onPull={mockPull} disabled={false} />
      </MockProviders>
    );

    const pullButton = screen.getByRole('button', { name: /pull/i });
    fireEvent.click(pullButton);

    expect(pullButton).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => {
      expect(mockPull).toHaveBeenCalledTimes(1);
    });
  });

  it('should show subscription prompt when not subscribed', () => {
    const mockAuthContext = {
      user: { subscriptionStatus: 'inactive' }
    };

    render(
      <MockProviders>
        <PullButton onPull={jest.fn()} disabled={true} />
      </MockProviders>
    );

    expect(screen.getByText(/subscription required/i)).toBeInTheDocument();
  });
});
```

#### Backend API Test
```typescript
// apps/functions/tests/api/gachapon.test.ts
import { test } from 'firebase-functions-test';
import { performGachaponPull } from '@/api/gachapon';

const testEnv = test();

describe('Gachapon API', () => {
  afterAll(() => {
    testEnv.cleanup();
  });

  it('should successfully pull food item for subscribed user', async () => {
    const mockRequest = {
      auth: {
        uid: 'test-user-123',
        token: 'valid-token'
      },
      data: {
        packId: 'global-street-foods'
      }
    };

    // Mock Firestore user with active subscription
    const mockUser = {
      uid: 'test-user-123',
      subscriptionStatus: 'active'
    };

    const result = await performGachaponPull(mockRequest);

    expect(result.success).toBe(true);
    expect(result.foodItem).toHaveProperty('id');
    expect(result.foodItem).toHaveProperty('name');
    expect(typeof result.isNew).toBe('boolean');
  });

  it('should reject pull for non-subscribed user', async () => {
    const mockRequest = {
      auth: {
        uid: 'test-user-456',
        token: 'valid-token'
      },
      data: {
        packId: 'global-street-foods'
      }
    };

    await expect(performGachaponPull(mockRequest))
      .rejects
      .toThrow('Active subscription required');
  });
});
```

#### E2E Test
```typescript
// tests/e2e/collection/gachapon-pull.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Gachapon Collection Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated user with active subscription
    await page.goto('/dashboard');
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-subscriber-token');
    });
  });

  test('should successfully collect new food item', async ({ page }) => {
    // Navigate to gachapon interface
    await page.click('[data-testid="pull-button"]');
    
    // Wait for pull animation to complete
    await page.waitForSelector('[data-testid="item-reveal"]', { 
      timeout: 5000 
    });

    // Verify new item appears in collection
    const foodItemName = await page.textContent('[data-testid="revealed-item-name"]');
    expect(foodItemName).toBeTruthy();

    // Check collection progress updated
    const progressRing = page.locator('[data-testid="collection-progress"]');
    await expect(progressRing).toBeVisible();

    // Verify item appears in collection grid
    await page.click('[data-testid="view-collection"]');
    await expect(page.locator(`[data-testid="collection-item-${foodItemName}"]`))
      .toBeVisible();
  });

  test('should handle duplicate item gracefully', async ({ page }) => {
    // Simulate pulling a duplicate item
    await page.route('/api/gachapon/pull', route => {
      route.fulfill({
        json: {
          success: true,
          foodItem: { id: '1', name: 'Duplicate Item' },
          isNew: false,
          duplicateReward: { type: 'progress', value: 10 }
        }
      });
    });

    await page.click('[data-testid="pull-button"]');
    
    // Should show duplicate handling UI
    await expect(page.locator('[data-testid="duplicate-reward"]'))
      .toBeVisible();
  });
});
```

## Coding Standards

### Critical Fullstack Rules
- **Type Sharing:** Always define types in packages/shared and import from there - prevents frontend/backend type drift
- **API Calls:** Never make direct HTTP calls - use the service layer for consistent error handling and caching
- **Environment Variables:** Access only through config objects, never process.env directly - enables runtime validation
- **Error Handling:** All API routes must use the standard error handler - ensures consistent error format and logging
- **State Updates:** Never mutate state directly - use proper state management patterns for predictable updates
- **Authentication:** Always validate auth in protected routes and API endpoints - security cannot be bypassed
- **Database Queries:** Use repository pattern for all data access - enables testing and consistent query optimization
- **Component Props:** Define explicit TypeScript interfaces for all component props - prevents runtime errors
- **Firebase Rules:** Never bypass Firestore security rules in client code - security must be enforced at database level
- **Image Optimization:** Always use optimized images with proper alt text - ensures performance and accessibility

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `FoodItemCard.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/food-items` |
| Database Collections | - | kebab-case | `food-items` |
| Database Fields | - | camelCase | `subscriptionStatus` |
| Functions | camelCase | camelCase | `performGachaponPull` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `SUBSCRIPTION_PRICE` |
| Files | kebab-case | kebab-case | `subscription-service.ts` |

## Error Handling Strategy

### Error Flow
```mermaid
sequenceDiagram
    participant U as User
    participant A as React App
    participant S as Service Layer
    participant CF as Cloud Functions
    participant FS as Firestore

    U->>A: Trigger action (e.g., gachapon pull)
    A->>S: Call service method
    S->>CF: HTTP request with auth
    CF->>FS: Database operation
    FS-->>CF: Database error
    CF->>CF: Log error + format response
    CF-->>S: Structured error response
    S->>S: Parse error + update cache
    S-->>A: Service layer error
    A->>A: Display user-friendly message
    A->>U: Show error UI with retry option
```

### Error Response Format
```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Frontend Error Handling
```typescript
// Global error boundary with retry logic
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Firebase Analytics
    logError('react_error_boundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
          onReport={() => this.reportError()}
        />
      );
    }

    return this.props.children;
  }
}

// Service layer error handling with retry logic
export class ApiService {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers: await this.getAuthHeaders(options.headers)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new ApiError(response.status, errorData);
        }

        return response.json();
      } catch (error) {
        attempt++;
        
        if (this.isRetryableError(error) && attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
          continue;
        }
        
        throw this.enrichError(error, endpoint, attempt);
      }
    }
  }

  private isRetryableError(error: any): boolean {
    return error.status >= 500 || error.code === 'NETWORK_ERROR';
  }
}
```

### Backend Error Handling
```typescript
// Standard error handler for Cloud Functions
export function handleFunctionError(error: any, context: string): never {
  const errorId = generateErrorId();
  
  // Log structured error
  console.error(`[${errorId}] ${context}:`, {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });

  // Send to error tracking service
  reportError(error, { context, errorId });

  // Throw standardized HttpsError
  if (error instanceof HttpsError) {
    throw error;
  }

  // Map common errors to standard format
  if (error.code === 'permission-denied') {
    throw new HttpsError('permission-denied', 'Access denied', { errorId });
  }

  if (error.code === 'not-found') {
    throw new HttpsError('not-found', 'Resource not found', { errorId });
  }

  // Default internal error
  throw new HttpsError('internal', 'An unexpected error occurred', { 
    errorId,
    retryable: true 
  });
}

// Database operation wrapper with transaction retry
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      
      if (error.code === 'aborted' && attempt < maxRetries) {
        // Firestore transaction conflict - retry
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
        continue;
      }
      
      throw error;
    }
  }
}
```

## Monitoring and Observability

### Monitoring Stack
- **Frontend Monitoring:** Firebase Analytics + Performance Monitoring for Core Web Vitals and user interactions
- **Backend Monitoring:** Firebase Functions Logs + Cloud Monitoring for function performance and errors
- **Error Tracking:** Firebase Crashlytics for crash reporting and error aggregation
- **Performance Monitoring:** Lighthouse CI for automated performance testing and Core Web Vitals tracking

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)
- JavaScript errors with stack traces and user context
- API response times from frontend perspective
- User interactions (gachapon pulls, collection views, educational content engagement)
- Conversion funnel metrics (signup → subscription → retention)

**Backend Metrics:**
- Request rate per endpoint with 95th percentile response times
- Error rate by function with categorization (4xx vs 5xx)
- Response time distribution for critical paths (authentication, gachapon pulls)
- Database query performance with slow query identification
- Subscription lifecycle events (creation, renewal, cancellation)
- Weekly content delivery success rates

**Business Metrics:**
- Monthly Recurring Revenue (MRR) with growth trends
- User acquisition cost (CAC) and lifetime value (LTV)
- Collection completion rates by themed pack
- Educational content engagement rates
- Social sharing conversion rates and viral coefficient

## Checklist Results Report

### Executive Summary

**Overall Architecture Completeness**: 97% - Comprehensive architecture ready for implementation  
**MVP Scope Appropriateness**: Excellent - Well-balanced technical approach  
**Readiness for Development Phase**: **READY** - All necessary technical specifications present  
**Most Critical Gap**: Minor operational documentation (disaster recovery procedures)

### Category Analysis Table

| Category | Status | Critical Issues |
|----------|--------|-----------------|
| 1. Requirements Alignment | PASS | None |
| 2. Architecture Fundamentals | PASS | None |
| 3. Technical Stack & Decisions | PASS | None |
| 4. Frontend Design & Implementation | PASS | None |
| 5. Resilience & Operational Readiness | PARTIAL | Disaster recovery procedures |
| 6. Security & Compliance | PASS | None |
| 7. Implementation Guidance | PASS | None |
| 8. Dependency & Integration Management | PARTIAL | Security scanning automation |
| 9. AI Agent Implementation Suitability | PASS | None |
| 10. Accessibility Implementation | PARTIAL | Testing automation details |

### Top Issues by Priority

**HIGH Priority**: None

**MEDIUM Priority**:
- Disaster recovery procedures need documentation for production readiness
- Load testing strategy should be defined for gachapon mechanics under high load

**LOW Priority**:
- Dependency security scanning automation for supply chain security
- Visual regression testing for collection animations
- Enhanced accessibility testing automation

### Architecture Readiness

**Exceptionally Well-Architected**:
- Type-safe fullstack development with shared interfaces
- Serverless-first approach minimizes operational overhead
- Mobile-optimized PWA with offline capabilities
- Comprehensive error handling and resilience patterns
- AI agent implementation optimized design

**Implementation Confidence**: **Very High** - Architecture provides clear, actionable guidance for development

### Final Decision

**✅ APPROVED FOR DEVELOPMENT**: The architecture is comprehensive, well-designed, and ready for AI-driven implementation. The identified issues are minor operational enhancements that can be addressed during development phases.