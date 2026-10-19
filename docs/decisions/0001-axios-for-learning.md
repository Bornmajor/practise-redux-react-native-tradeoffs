# 0001: Use Axios as the HTTP client (for learning)

**Status:** Accepted, learning project
**Date:** 2026-10-19

## Context

The app calls the Subscription Tracker REST API: JSON in and out, one `x-api-key`
header, no file uploads, no token refresh.

RTK Query's built-in `fetchBaseQuery` already covers this: base URL, headers via
`prepareHeaders`, JSON parsing and error status codes.

## Decision

Use **Axios** in the remote data source anyway, **to practise an advanced HTTP client**:
instances, default headers, interceptors, timeouts and typed error handling.

## Consequences

- One extra dependency (`axios`) that this API does not strictly need.
- Axios stays **inside the data layer** (`http-client.ts` and remote data sources).
  Repositories, RTK Query and the UI never import it, so it can be swapped for
  `fetch` or `fetchBaseQuery` by changing only those files.

## When Axios is genuinely worth it

- interceptors that refresh an expired login token and retry the request
- upload or download progress (e.g. photos, files)
- request cancellation and timeouts shared across many endpoints
- a team or codebase that already standardizes on it

For a small JSON API like this one, prefer `fetchBaseQuery` (or `fetch`) in real projects.
