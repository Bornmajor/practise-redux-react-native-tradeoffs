# Subscription Tracker API: notes for the mobile app

Backend project: `C:\Users\Admin\Documents\node\subscription-tracker-app` (Express 5 + Mongoose 9 / MongoDB).

## Overview

| | |
|---|---|
| Purpose | CRUD for subscriptions, designed for offline-first mobile sync |
| Run it | MongoDB running locally, then `npm run dev` in the backend project |
| Base URL | `http://localhost:5000` (`PORT` in the backend's `.env`, default 5000) |
| Health check | `GET /api/health` (no auth) → `{ "message": "Subscription Tracker API is running." }` |
| Admin dashboard | `http://localhost:5000` |

### Reaching the API from the app

`localhost` on a phone or emulator means the device itself, not the PC.

| Where the app runs | Base URL |
|---|---|
| Android emulator | `http://10.0.2.2:5000` |
| iOS simulator | `http://localhost:5000` |
| Physical phone (Expo Go) | `http://<PC-LAN-IP>:5000` (same Wi-Fi) |

Store it in the app's `.env` as `EXPO_PUBLIC_API_URL`. Plain `http://` works in development with Expo Go; production builds need HTTPS or extra configuration.

## Auth

- One shared API key; no users, login, passwords or JWTs.
- Header on every `/api/subscriptions` request: `x-api-key: <API_KEY>`
- `/api/health` is public.

| Case | Status | Body |
|---|---|---|
| header missing | `401` | `{ "message": "An API key is required." }` |
| wrong key | `401` | `{ "message": "The API key is invalid." }` |

Security note: anything bundled into a mobile app, including `EXPO_PUBLIC_*` values, can be extracted. A shared key is fine for practice but isn't a real secret; production apps use per-user authentication.

## Data: Subscription

| Field | Type | Who sets it | Rules |
|---|---|---|---|
| `_id` | string (UUID) | server on `POST`; client on `PUT /:id` | clients can generate IDs offline |
| `name` | string | client | required, trimmed |
| `price` | number | client | required, minimum `0.01` |
| `billingCycle` | `'daily' \| 'weekly' \| 'monthly' \| 'yearly'` | client | required |
| `nextPaymentDate` | date (ISO string in JSON) | client | required, valid date |
| `category` | string | client | required, trimmed |
| `updatedAt` | date | client sends it in the body (last-write-wins) | defaults to now if not sent |
| `deletedAt` | date or `null` | server (on `DELETE`) | non-null = soft-deleted (tombstone) |
| `serverUpdatedAt` | date | server only | server time of last stored change; used by delta pulls |
| `createdAt` | date | server only | set by Mongoose |
| `__v` | number | server only | Mongoose version key; ignore |

Writable fields: `name`, `price`, `billingCycle`, `nextPaymentDate`, `category` (plus `updatedAt` as the change time). Everything else in the body, including `_id`, is ignored.

```ts
export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

// What the API returns (dates are ISO strings in JSON)
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
export type SubscriptionWriteDto = {
  name: string;
  price: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string;   // ISO date
  category: string;
  updatedAt?: string;        // ISO time the change was made on the device
};
```

## Endpoints

All under `/api/subscriptions`, all need `x-api-key`, JSON bodies.

### `POST /api/subscriptions`: create (server generates the ID)

```json
{ "name": "Netflix", "price": 15.49, "billingCycle": "monthly",
  "nextPaymentDate": "2026-11-01", "category": "entertainment" }
```

`201` → `{ "message": "Subscription created successfully.", "subscription": { ... } }`

### `GET /api/subscriptions`: list (not deleted)

`200` → `{ "subscriptions": [ ... ], "serverTime": "<ISO>" }`

### `GET /api/subscriptions?updatedSince=<ISO>`: delta pull

`200` → `{ "subscriptions": [ ... ], "serverTime": "<ISO>" }`

- Every change stored after the cursor, including deletions (`deletedAt` set).
- Filters on `serverUpdatedAt` (server clock).
- Send the returned `serverTime` as `updatedSince` on the next pull.
- Invalid date → `400` `{ "message": "updatedSince must be a valid date." }`

### `GET /api/subscriptions/:id`: one

`200` → `{ "subscription": { ... } }`
`404` → `{ "message": "Subscription not found." }` (also when soft-deleted)

### `PUT /api/subscriptions/:id`: create or update (last-write-wins)

Body: any writable fields (partial allowed) + `updatedAt`.

| Situation | Status | Body |
|---|---|---|
| unknown ID: created under the client's ID | `201` | `{ message, subscription, applied: true }` |
| updated | `200` | `{ message, subscription, applied: true }` |
| server has a newer change | `200` | `{ message, subscription (newer server version), applied: false }` |
| subscription was deleted | `200` | `{ message, subscription (with deletedAt), applied: false }` |
| invalid data | `400` | `{ message }` |

Repeating the same `PUT` is safe (no duplicates).

### `DELETE /api/subscriptions/:id`: soft delete

Optional body `{ "updatedAt": "<ISO>" }`.

`200` → `{ "message": "Subscription deleted successfully." }` (repeating is safe)
`404` → not found (sync clients treat it as already gone)

## Errors

All errors are JSON `{ "message": "..." }`.

| Status | When |
|---|---|
| `400` | validation failed: missing field, price ≤ 0, wrong billing cycle, bad date, bad `updatedAt` / `updatedSince` |
| `401` | missing or wrong API key |
| `404` | subscription not found or deleted; unknown URL (`Route not found: METHOD /url`) |
| `500` | unexpected server error |

Suggested domain error codes in the app: `400 → VALIDATION`, `401 → UNAUTHORIZED`, `404 → NOT_FOUND`, network failure → `OFFLINE`, `≥500 → SERVER`, anything else → `UNKNOWN`.

## Sync protocol

1. **Push** local changes:
   - creates and edits → `PUT /:id` with fields + `updatedAt`
   - deletions → `DELETE /:id` with `{ updatedAt }`; treat `404` as done
   - `applied: false` → replace the local copy with the returned `subscription`, or delete it locally if it has `deletedAt`
2. **Pull** → `GET ?updatedSince=<last serverTime>` (omit on the first sync)
   - upsert each returned subscription locally
   - delete local copies of those with `deletedAt`
   - store the new `serverTime`

Known limitation: last-write-wins trusts device clocks for `updatedAt`.
