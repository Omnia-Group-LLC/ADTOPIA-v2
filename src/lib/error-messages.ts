/**
 * User-friendly error message mapping
 * Converts technical error messages to helpful user-facing messages
 */

interface ErrorMapping {
  pattern: RegExp;
  userMessage: string;
}

const errorMappings: ErrorMapping[] = [
  // Database errors
  {
    pattern: /violates foreign key constraint/i,
    userMessage: "This item cannot be deleted because it's being used elsewhere. Please remove dependencies first.",
  },
  {
    pattern: /duplicate key value/i,
    userMessage: "This item already exists. Please use a different name or identifier.",
  },
  {
    pattern: /permission denied/i,
    userMessage: "You don't have permission to perform this action. Please contact an administrator.",
  },
  {
    pattern: /row level security/i,
    userMessage: "Access denied. You don't have permission to view or modify this data.",
  },
  
  // Storage errors
  {
    pattern: /storage.*not found/i,
    userMessage: "The file could not be found. It may have been deleted or moved.",
  },
  {
    pattern: /storage.*quota/i,
    userMessage: "Storage limit reached. Please delete some files or upgrade your plan.",
  },
  {
    pattern: /file.*too large/i,
    userMessage: "File is too large. Maximum file size is 50MB.",
  },
  
  // Network errors
  {
    pattern: /network.*error|fetch.*failed/i,
    userMessage: "Network connection issue. Please check your internet connection and try again.",
  },
  {
    pattern: /timeout/i,
    userMessage: "Request timed out. The server took too long to respond. Please try again.",
  },
  
  // Authentication errors
  {
    pattern: /not.*authenticated|invalid.*token/i,
    userMessage: "Your session has expired. Please log in again.",
  },
  {
    pattern: /invalid.*credentials/i,
    userMessage: "Invalid email or password. Please check your credentials and try again.",
  },
  
  // Edge function errors
  {
    pattern: /function.*not found/i,
    userMessage: "This feature is currently unavailable. Please try again later.",
  },
  {
    pattern: /rate limit/i,
    userMessage: "Too many requests. Please wait a moment and try again.",
  },
  
  // Stripe/Payment errors
  {
    pattern: /stripe.*webhook/i,
    userMessage: "Payment processing issue. If you completed payment, it will be processed shortly.",
  },
  {
    pattern: /payment.*failed/i,
    userMessage: "Payment could not be processed. Please check your payment method and try again.",
  },
];

/**
 * Converts a technical error to a user-friendly message
 */
export function getUserFriendlyError(error: unknown): string {
  const errorMessage = getErrorMessage(error);
  
  // Try to match against known error patterns
  for (const mapping of errorMappings) {
    if (mapping.pattern.test(errorMessage)) {
      return mapping.userMessage;
    }
  }
  
  // If no match, return a generic but helpful message
  if (errorMessage.length > 100) {
    return "An unexpected error occurred. Please try again or contact support if the problem persists.";
  }
  
  // Return the original message if it's short and potentially user-friendly
  return errorMessage;
}

/**
 * Extracts error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object') {
    // Supabase error format
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Axios error format
    if ('response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as any;
      if (response.data?.message) {
        return response.data.message;
      }
    }
  }
  
  return 'An unexpected error occurred';
}

/**
 * Logs error for debugging while showing user-friendly message
 */
export function handleError(error: unknown, context?: string): string {
  const technicalError = getErrorMessage(error);
  const userMessage = getUserFriendlyError(error);
  
  // Log technical details for debugging
  console.error(`[${context || 'Error'}]`, {
    userMessage,
    technicalError,
    fullError: error,
  });
  
  return userMessage;
}
