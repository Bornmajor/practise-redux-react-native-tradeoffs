import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { subscriptionRepository } from '@/di/container';
import { toSubscriptionError } from '../data/subscription.repository';
import type {
  Subscription,
  SubscriptionErrorCode,
  SubscriptionInput,
} from '../domain/subscription';

// The error shape stored in the Redux cache: plain data only (no class instances)
export type ApiError = { code: SubscriptionErrorCode; message?: string };

// Runs a repository call and returns what RTK Query expects:
// { data } on success, or { error } on failure (a queryFn must never throw)
async function run<T>(call: () => Promise<T>): Promise<{ data: T } | { error: ApiError }> {
  try {
    return { data: await call() };
  } catch (error) {
    const domainError = toSubscriptionError(error);
    if (__DEV__) {
      // The technical details stay in the console; only code + message go to the UI
      console.warn('[subscriptions]', domainError.code, domainError.originalError ?? domainError);
    }
    return { error: { code: domainError.code, message: domainError.message } };
  }
}

export const subscriptionsApi = createApi({
  // Where the cache lives in the Redux state: state.subscriptionsApi
  reducerPath: 'subscriptionsApi',

  // We don't call the API from here; each endpoint calls the repository (queryFn)
  baseQuery: fakeBaseQuery<ApiError>(),

  // Labels used to know which cached data a change makes out of date
  tagTypes: ['Subscription'],

  // ---- Cache settings ----
  keepUnusedDataFor: 300, // keep data 5 min after the last screen stops using it
  refetchOnMountOrArgChange: 30, // when a screen opens, refetch only if data is older than 30s
  refetchOnFocus: true, // refetch when the app comes back to the foreground
  refetchOnReconnect: true, // refetch when the network comes back

  endpoints: (build) => ({
    // READ: all subscriptions
    getSubscriptions: build.query<Subscription[], void>({
      queryFn: () => run(() => subscriptionRepository.getAll()),
      // "This result contains each of these items, plus the list itself"
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: 'Subscription' as const, id })),
        { type: 'Subscription' as const, id: 'LIST' },
      ],
    }),

    // READ: one subscription
    getSubscription: build.query<Subscription, string>({
      queryFn: (id) => run(() => subscriptionRepository.getById(id)),
      providesTags: (_result, _error, id) => [{ type: 'Subscription', id }],
    }),

    // WRITE: create → the list is out of date
    createSubscription: build.mutation<Subscription, SubscriptionInput>({
      queryFn: (input) => run(() => subscriptionRepository.create(input)),
      invalidatesTags: [{ type: 'Subscription', id: 'LIST' }],
    }),

    // WRITE: update → only that subscription is out of date (and lists containing it)
    updateSubscription: build.mutation<
      Subscription,
      { id: string; changes: Partial<SubscriptionInput> }
    >({
      queryFn: ({ id, changes }) => run(() => subscriptionRepository.update(id, changes)),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Subscription', id }],
    }),

    // WRITE: delete → that subscription and the list are out of date
    deleteSubscription: build.mutation<void, string>({
      queryFn: (id) => run(() => subscriptionRepository.remove(id)),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),
  }),
});

// Hooks generated from the endpoint names
export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionsApi;
