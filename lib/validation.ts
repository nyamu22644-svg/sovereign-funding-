// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export const validateField = (value: any, rules: ValidationRules): string | null => {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'This field is required';
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return customError;
  }

  return null;
};

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRules>
): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/.+/,
};

// Password strength checker
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  const strengths = [
    { score: 0, label: 'Very Weak', color: 'text-red-500' },
    { score: 1, label: 'Weak', color: 'text-red-400' },
    { score: 2, label: 'Fair', color: 'text-yellow-500' },
    { score: 3, label: 'Good', color: 'text-blue-500' },
    { score: 4, label: 'Strong', color: 'text-green-500' },
    { score: 5, label: 'Very Strong', color: 'text-green-600' },
  ];

  return strengths[score] || strengths[0];
};