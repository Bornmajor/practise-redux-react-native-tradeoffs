// 1. Required by InversifyJS (it uses the Reflect metadata API internally); must be first
import 'reflect-metadata';

import { Container } from 'inversify';
import type { AxiosInstance } from 'axios';
import { env } from '@/shared/config/env';
import { createHttpClient } from '@/shared/api/http-client';
import {
  AxiosSubscriptionRemote,
  type SubscriptionRemote,
} from '@/features/subscriptions/data/subscription.remote';
import {
  ApiSubscriptionRepository,
  type SubscriptionRepository,
} from '@/features/subscriptions/data/subscription.repository';

// 2. TOKENS: unique names for each dependency (the "dish names")
export const TOKENS = {
  HttpClient: Symbol.for('HttpClient'),
  SubscriptionRemote: Symbol.for('SubscriptionRemote'),
  SubscriptionRepository: Symbol.for('SubscriptionRepository'),
};

// 3. The CONTAINER: knows how to build everything (the "kitchen")
export const container = new Container();

// 4. BINDINGS: how to build each dependency (the "recipes")

// HttpClient: already built, just store it
container
  .bind<AxiosInstance>(TOKENS.HttpClient)
  .toConstantValue(createHttpClient({ baseUrl: env.apiUrl, apiKey: env.apiKey }));

// Remote: needs the HttpClient
container
  .bind<SubscriptionRemote>(TOKENS.SubscriptionRemote)
  .toResolvedValue((http: AxiosInstance) => new AxiosSubscriptionRemote(http), [TOKENS.HttpClient])
  .inSingletonScope();

// Repository: needs the Remote
container
  .bind<SubscriptionRepository>(TOKENS.SubscriptionRepository)
  .toResolvedValue(
    (remote: SubscriptionRemote) => new ApiSubscriptionRepository(remote),
    [TOKENS.SubscriptionRemote],
  )
  .inSingletonScope();

// 5. GET: build the finished repository once and export it.
// The rest of the app imports this, never the container itself.
export const subscriptionRepository = container.get<SubscriptionRepository>(
  TOKENS.SubscriptionRepository,
);
