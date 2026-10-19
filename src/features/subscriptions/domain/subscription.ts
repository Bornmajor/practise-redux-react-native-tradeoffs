// How often a subscription charges (the same four values the API accepts)
export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

// The list the UI can show in a picker
export const BILLING_CYCLES: BillingCycle[] = ['daily', 'weekly', 'monthly', 'yearly'];

// The app's own subscription shape (plain data, so it can live in the Redux store)
export type Subscription = {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string; // ISO date string; formatted in the UI
  category: string;
  updatedAt: string; // ISO time of the last change
  createdAt: string; // ISO time it was created
};

// What the user fills in on the create/edit form
export type SubscriptionInput = {
  name: string;
  price: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string; // ISO date string
  category: string;
};

// Errors in the app's own language; the UI maps codes to messages
export type SubscriptionErrorCode =
  | 'VALIDATION' // 400: the server rejected the data
  | 'UNAUTHORIZED' // 401: missing or wrong API key
  | 'NOT_FOUND' // 404: doesn't exist or was deleted
  | 'CONFLICT' // PUT not applied: the server has a newer version
  | 'OFFLINE' // no response: no internet, wrong IP, server down
  | 'TIMEOUT' // the request took too long
  | 'SERVER' // 500+
  | 'INVALID_RESPONSE' // the server sent data we can't use
  | 'UNKNOWN'; // anything we didn't predict

export class SubscriptionError extends Error {
  constructor(
    public readonly code: SubscriptionErrorCode,
    message?: string, // a user-facing reason, e.g. the server's validation message
    public readonly originalError?: unknown, // the error that caused this one, for logs only
  ) {
    super(message ?? code);
    this.name = 'SubscriptionError';
  }
}
