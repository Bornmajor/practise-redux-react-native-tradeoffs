import {
  HttpError,
  InvalidResponseError,
  NetworkError,
  ServerUnreachableError,
  TimeoutError,
} from '@/shared/api/http-errors';
import { SubscriptionError, type Subscription, type SubscriptionInput } from '../domain/subscription';
import { isDeleted, toSubscription, toWriteDto } from './subscription.dto';
import type { SubscriptionRemote } from './subscription.remote';

// The contract the rest of the app (RTK Query, in phase 3) depends on
export interface SubscriptionRepository {
  getAll(): Promise<Subscription[]>;
  getById(id: string): Promise<Subscription>;
  create(input: SubscriptionInput): Promise<Subscription>;
  update(id: string, changes: Partial<SubscriptionInput>): Promise<Subscription>;
  remove(id: string): Promise<void>;
}

// The ONE place where failures get their meaning in this feature.
// Every branch keeps the original error for logging.
export function toSubscriptionError(error: unknown): SubscriptionError {
  if (error instanceof SubscriptionError) return error; // already translated (e.g. CONFLICT)
  if (error instanceof TimeoutError) return new SubscriptionError('TIMEOUT', undefined, error);
  if (error instanceof NetworkError) return new SubscriptionError('OFFLINE', undefined, error);
  if (error instanceof ServerUnreachableError) {
    return new SubscriptionError('SERVER_UNREACHABLE', undefined, error);
  }
  if (error instanceof InvalidResponseError) {
    return new SubscriptionError('INVALID_RESPONSE', undefined, error);
  }
  if (error instanceof HttpError) {
    switch (error.status) {
      case 400:
        return new SubscriptionError('VALIDATION', error.serverMessage, error); // keep the server's reason
      case 401:
        return new SubscriptionError('UNAUTHORIZED', undefined, error);
      case 404:
        return new SubscriptionError('NOT_FOUND', undefined, error);
    }
    if (error.status >= 500) return new SubscriptionError('SERVER', undefined, error);
  }
  return new SubscriptionError('UNKNOWN', undefined, error); // the safety net
}

// The implementation backed by the remote API
export class ApiSubscriptionRepository implements SubscriptionRepository {
  // Constructor injection: the remote data source is passed in
  constructor(private readonly remote: SubscriptionRemote) {}

  // Runs a call and translates ANY failure (network, HTTP, mapping, unexpected)
  private async run<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (error) {
      throw toSubscriptionError(error);
    }
  }

  getAll() {
    return this.run(async () => (await this.remote.getAll()).map(toSubscription));
  }

  getById(id: string) {
    return this.run(async () => toSubscription(await this.remote.getById(id)));
  }

  create(input: SubscriptionInput) {
    return this.run(async () => toSubscription(await this.remote.create(toWriteDto(input))));
  }

  update(id: string, changes: Partial<SubscriptionInput>) {
    return this.run(async () => {
      const result = await this.remote.upsert(id, toWriteDto(changes));
      if (result.applied === false) {
        // Deleted meanwhile → it's gone; otherwise someone saved a newer version
        if (isDeleted(result.subscription)) throw new SubscriptionError('NOT_FOUND');
        throw new SubscriptionError(
          'CONFLICT',
          'This subscription was changed elsewhere. Reload and try again.',
        );
      }
      return toSubscription(result.subscription);
    });
  }

  remove(id: string) {
    return this.run(() => this.remote.remove(id));
  }
}
