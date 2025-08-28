import { ValidationRule } from '@fooddrop/shared';

export class ValidationError extends Error {
  constructor(
    public field: string,
    public rule: string,
    public value: any,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DataValidator {
  static validate(data: any, rules: ValidationRule[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const value = this.getNestedValue(data, rule.field);
      
      // Check required fields
      if (rule.required && (value === undefined || value === null)) {
        errors.push(new ValidationError(
          rule.field,
          'required',
          value,
          `Field '${rule.field}' is required`
        ));
        continue;
      }

      // Skip validation for optional fields that are not provided
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (!this.validateType(value, rule.type)) {
        errors.push(new ValidationError(
          rule.field,
          'type',
          value,
          `Field '${rule.field}' must be of type ${rule.type}`
        ));
        continue;
      }

      // String validations
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(new ValidationError(
            rule.field,
            'minLength',
            value,
            `Field '${rule.field}' must be at least ${rule.minLength} characters`
          ));
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(new ValidationError(
            rule.field,
            'maxLength',
            value,
            `Field '${rule.field}' must not exceed ${rule.maxLength} characters`
          ));
        }

        if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
          errors.push(new ValidationError(
            rule.field,
            'pattern',
            value,
            `Field '${rule.field}' does not match required pattern`
          ));
        }
      }

      // Number validations
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(new ValidationError(
            rule.field,
            'min',
            value,
            `Field '${rule.field}' must be at least ${rule.min}`
          ));
        }

        if (rule.max !== undefined && value > rule.max) {
          errors.push(new ValidationError(
            rule.field,
            'max',
            value,
            `Field '${rule.field}' must not exceed ${rule.max}`
          ));
        }
      }

      // Array validations
      if (rule.type === 'array' && Array.isArray(value)) {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(new ValidationError(
            rule.field,
            'minLength',
            value,
            `Field '${rule.field}' must have at least ${rule.minLength} items`
          ));
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(new ValidationError(
            rule.field,
            'maxLength',
            value,
            `Field '${rule.field}' must not have more than ${rule.maxLength} items`
          ));
        }
      }

      // Allowed values validation
      if (rule.allowedValues && !rule.allowedValues.includes(value)) {
        errors.push(new ValidationError(
          rule.field,
          'allowedValues',
          value,
          `Field '${rule.field}' must be one of: ${rule.allowedValues.join(', ')}`
        ));
      }

      // Custom validation
      if (rule.customValidator && !rule.customValidator(value)) {
        errors.push(new ValidationError(
          rule.field,
          'custom',
          value,
          `Field '${rule.field}' failed custom validation`
        ));
      }
    }

    return errors;
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  private static validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'timestamp':
        // Check for Firestore Timestamp or Date
        return value instanceof Date || 
               (value && typeof value === 'object' && typeof value.toDate === 'function');
      default:
        return true;
    }
  }

  static validateAndThrow(data: any, rules: ValidationRule[]): void {
    const errors = this.validate(data, rules);
    if (errors.length > 0) {
      throw errors[0]; // Throw the first error
    }
  }

  static isValid(data: any, rules: ValidationRule[]): boolean {
    return this.validate(data, rules).length === 0;
  }
}

// Helper functions for common validations
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000); // Limit length
};

export const validateGDPRConsent = (consent: any): boolean => {
  return consent && 
         consent.given === true && 
         consent.timestamp && 
         consent.version && 
         typeof consent.version === 'string';
};

// Helper function for compatibility with existing code
export const validateDocument = (data: any, rules: ValidationRule[]): { isValid: boolean; errors: string[] } => {
  const validationErrors = DataValidator.validate(data, rules);
  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors.map(error => error.message)
  };
};