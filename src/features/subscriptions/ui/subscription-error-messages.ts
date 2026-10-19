import type { SubscriptionErrorCode } from '../domain/subscription';

// One sentence per code: what happened, and what the user can do.
// Record<…> makes TypeScript fail if a new code has no message.
export const subscriptionErrorMessages: Record<SubscriptionErrorCode, string> = {
  VALIDATION: 'Some details are invalid. Please check the form.',
  UNAUTHORIZED: 'The app is not authorized to reach the server.',
  NOT_FOUND: 'This subscription no longer exists.',
  CONFLICT: 'This subscription was changed elsewhere. Reload and try again.',
  OFFLINE: "You're offline. Check your Wi-Fi and try again.",
  TIMEOUT: 'The server took too long to respond. Try again.',
  SERVER: 'Something went wrong on our side. Please try again later.',
  INVALID_RESPONSE: 'We received unexpected data. Please try again later.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

// Codes where a "Try again" button makes sense
export const retryableCodes: SubscriptionErrorCode[] = [
  'OFFLINE',
  'TIMEOUT',
  'SERVER',
  'INVALID_RESPONSE',
  'UNKNOWN',
];

// The message to show. For VALIDATION, prefer the server's specific reason
// (e.g. "Subscription price must be greater than zero.").
export function getErrorMessage(error: { code: SubscriptionErrorCode; message?: string }): string {
  if (error.code === 'VALIDATION' && error.message && error.message !== 'VALIDATION') {
    return error.message;
  }
  return subscriptionErrorMessages[error.code];
}
