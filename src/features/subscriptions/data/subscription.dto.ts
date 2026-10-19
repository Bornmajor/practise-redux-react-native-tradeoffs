import { InvalidResponseError } from '@/shared/api/http-errors';
import {
  BILLING_CYCLES,
  type BillingCycle,
  type Subscription,
  type SubscriptionInput,
} from '../domain/subscription';

// What the API returns for one subscription (dates are ISO strings in JSON)
export type SubscriptionDto = {
  _id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  category: string;
  updatedAt: string;
  deletedAt: string | null;
  serverUpdatedAt: string;
  createdAt: string;
  __v?: number;
};

// What the app sends on POST / PUT
export type SubscriptionWriteDto = Partial<SubscriptionInput> & {
  updatedAt?: string; // when the change was made on the device (last-write-wins)
};

// Response bodies, per endpoint (`unknown`: validated before use)
export type ListResponse = { subscriptions: unknown[]; serverTime: string };
export type OneResponse = { subscription: unknown };
export type WriteResponse = { message: string; subscription: unknown; applied?: boolean };

// --- Validation helpers: throw InvalidResponseError with a precise reason ---

function requireString(value: unknown, field: string, id: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new InvalidResponseError(`subscription ${id}: "${field}" must be a non-empty string`);
  }
  return value;
}

function requireDateString(value: unknown, field: string, id: string): string {
  const text = requireString(value, field, id);
  if (Number.isNaN(new Date(text).getTime())) {
    throw new InvalidResponseError(`subscription ${id}: "${field}" is not a valid date`);
  }
  return text;
}

// API → domain. Takes `unknown` on purpose: the server's data is checked, not trusted.
export function toSubscription(raw: unknown): Subscription {
  if (typeof raw !== 'object' || raw === null) {
    throw new InvalidResponseError('subscription is not an object');
  }
  const dto = raw as Record<string, unknown>;

  const id = requireString(dto._id, '_id', '(unknown id)');

  if (typeof dto.price !== 'number' || !Number.isFinite(dto.price)) {
    throw new InvalidResponseError(`subscription ${id}: "price" must be a number`);
  }
  if (!BILLING_CYCLES.includes(dto.billingCycle as BillingCycle)) {
    throw new InvalidResponseError(
      `subscription ${id}: "billingCycle" is not one of ${BILLING_CYCLES.join(', ')}`,
    );
  }

  return {
    id,
    name: requireString(dto.name, 'name', id),
    price: dto.price,
    billingCycle: dto.billingCycle as BillingCycle,
    nextPaymentDate: requireDateString(dto.nextPaymentDate, 'nextPaymentDate', id),
    category: requireString(dto.category, 'category', id),
    updatedAt: requireDateString(dto.updatedAt, 'updatedAt', id),
    createdAt: requireDateString(dto.createdAt, 'createdAt', id),
  };
}

// Is this (already received) subscription soft-deleted on the server?
export function isDeleted(raw: unknown): boolean {
  return typeof raw === 'object' && raw !== null && (raw as { deletedAt?: unknown }).deletedAt != null;
}

// domain → API (for create and update)
export function toWriteDto(input: Partial<SubscriptionInput>): SubscriptionWriteDto {
  return {
    ...input,
    updatedAt: new Date().toISOString(), // "this change happened now"
  };
}
