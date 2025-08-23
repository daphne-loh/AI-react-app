# FoodDrop Coding Standards

This document defines the coding standards, conventions, and best practices for the FoodDrop project development.

## Critical Fullstack Rules

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

## Naming Conventions

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

## Error Handling Standards

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
```

## TypeScript Standards

### Interface Definitions
- Always define explicit interfaces for component props
- Use shared types from packages/shared for consistency
- Prefer interfaces over types for object shapes
- Use strict mode TypeScript configuration

### Type Safety Rules
- No `any` types except for legitimate external library integrations
- Use type guards for runtime type checking
- Implement proper error boundaries with typed error handling
- Use discriminated unions for state management

## Component Standards

### React Component Structure
```typescript
interface ComponentProps {
  // Explicit prop definitions
  requiredProp: string;
  optionalProp?: number;
  onAction: (data: ActionData) => void;
}

export const Component: React.FC<ComponentProps> = ({
  requiredProp,
  optionalProp = defaultValue,
  onAction
}) => {
  // Component implementation
};
```

### Hook Patterns
```typescript
// Custom hook with proper typing
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Security Standards

- **Authentication:** Always validate user tokens in protected routes
- **Authorization:** Implement role-based access control at database level
- **Input Validation:** Sanitize all user inputs before processing
- **Environment Variables:** Never expose secrets in client-side code
- **Firebase Rules:** Enforce security rules at database level, not just client-side

## Performance Standards

- **Bundle Size:** Target <500KB initial bundle, <100KB per route chunk
- **Core Web Vitals:** LCP <2.5s, FID <100ms, CLS <0.1
- **Image Optimization:** Use optimized images with proper lazy loading
- **Code Splitting:** Implement React.lazy() for route-based splitting
- **Caching:** Use service workers for offline capability and performance

## Testing Standards

- **Unit Tests:** 80% code coverage for new components and functions
- **Integration Tests:** Test Firebase integration and API endpoints
- **E2E Tests:** Critical user flows must have Playwright tests
- **Test Organization:** Co-locate test files with source code
- **Mock Strategy:** Mock external services, test business logic

## Accessibility Standards

- **WCAG 2.1 AA Compliance:** All components must meet accessibility standards
- **Semantic HTML:** Use proper HTML elements and ARIA labels
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader:** Proper alt text and descriptive labels
- **Color Contrast:** Meet 4.5:1 ratio for normal text, 3:1 for large text