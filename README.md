# Redux Todos: Async Thunk + Fake API

A todo app built with **Expo**, **React Native** and **Redux Toolkit**, written as a step-by-step Redux learning project.

On this branch, todos are **loaded from a fake API** using `createAsyncThunk`. The screen shows a spinner while loading, and an error with a **Try again** button when the request fails. The fake API waits 1 second and fails about 20% of the time on purpose, so you can see every state.

> Branch: `feature/redux-todos-async-thunk-fake-api`. It builds on `feature/redux-todos-local-state`, which has the same app with todos kept only in local Redux state and no API.

## Features

- Todos load from a fake API when the screen opens
- Loading spinner, error message and **Try again** button
- Add a todo
- Tap a todo to toggle it between **pending** and **completed**
- Delete a todo
- Filter tabs: **All / Pending / Completed**
- "X of Y completed" summary
- Redux DevTools support through the Expo dev tools plugin

Adding, toggling and deleting still change Redux state locally after the list has loaded. Only loading goes through the fake API.

## What this branch adds

| Concept | Where |
|---|---|
| Fake API (data source with delay and random failure) | `src/features/todos/data/todos.api.ts` |
| `createAsyncThunk` (`fetchTodos`) | `src/features/todos/todos.slice.ts` |
| `rejectWithValue` for readable error messages | inside `fetchTodos` |
| `extraReducers` handling `pending` / `fulfilled` / `rejected` | `src/features/todos/todos.slice.ts` |
| `loadStatus` and `error` in state | `src/features/todos/types.ts` |
| Load on open with `useEffect`, plus loading / error / retry UI | `src/features/todos/screens/todos-screen.tsx` |

### Concepts from the local-state branch

| Concept | Where |
|---|---|
| Store with `configureStore` | `src/shared/store/store.ts` |
| Typed hooks (`useAppSelector`, `useAppDispatch`) | `src/shared/store/hooks.ts` |
| Slice with `createSlice` and a `prepare` callback | `src/features/todos/todos.slice.ts` |
| Memoized selectors (`createSelector`) | `src/features/todos/todos.selectors.ts` |
| `Provider` connecting the store to the app | `src/app/_layout.tsx` |
| Redux DevTools in Expo | `devTools: false` + `enhancers` in `store.ts` |

## How loading works

```
Screen opens: loadStatus = 'idle'                → spinner
useEffect: dispatch(fetchTodos())
  ├─ todos/fetchTodos/pending                    → loadStatus = 'loading'
  │    ...fake API waits 1 second...
  ├─ todos/fetchTodos/fulfilled                  → items = server todos, 'succeeded' → list
  └─ todos/fetchTodos/rejected                   → 'failed', error = message → error + Try again
```

## Project structure

```
src/
├── app/
│   └── _layout.tsx                # Redux Provider + TodosScreen
├── features/
│   └── todos/
│       ├── types.ts               # Todo, TodoFilter, LoadStatus, TodosState
│       ├── todos.slice.ts         # state, reducers, fetchTodos thunk, extraReducers
│       ├── todos.selectors.ts     # list, filter, load status and error selectors
│       ├── data/
│       │   └── todos.api.ts       # fake API
│       ├── components/
│       │   ├── todo-item.tsx      # one row
│       │   └── filter-tabs.tsx    # All / Pending / Completed
│       └── screens/
│           └── todos-screen.tsx   # the screen
└── shared/
    └── store/
        ├── store.ts               # configureStore, RootState, AppDispatch
        └── hooks.ts               # typed hooks
docs/
└── redux-notes.md                 # learning notes and interview Q&A
```

## State shape

```ts
{
  todos: {
    items: Todo[],                                          // every todo (never filtered)
    filter: 'all' | 'pending' | 'completed',                // selected tab
    loadStatus: 'idle' | 'loading' | 'succeeded' | 'failed', // progress of fetchTodos
    error: string | null                                    // message when loading failed
  }
}
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

   The project includes an `.npmrc` with `legacy-peer-deps=true`, needed by some UI dependencies.

2. Start the app:

   ```bash
   npx expo start
   ```

   Then open it in Expo Go, an Android emulator, an iOS simulator, or a development build.

3. Reload the app a few times. About 1 in 5 loads fails, so you'll see the error screen and can try **Try again**.

## Using Redux DevTools

1. Start the app with `npx expo start` and open it on a device or emulator.
2. In the terminal running Expo, press **Shift + M**.
3. Choose **`redux-devtools-expo-dev-plugin`**. A Chrome window opens.
4. Watch `todos/fetchTodos/pending` followed by `/fulfilled` or `/rejected`, and open each one's **Action** tab to see its payload.

## Learning notes

See [`docs/redux-notes.md`](docs/redux-notes.md) for a summary of the Redux concepts, when to choose Redux over Zustand, common mistakes, and interview questions with answers.

## Scripts

| Command | What it does |
|---|---|
| `npx expo start` | start the dev server |
| `npx tsc --noEmit` | type-check |
| `npx expo lint` | lint |

## Tech stack

- Expo SDK 57 with Expo Router
- React Native 0.86, React 19
- Redux Toolkit 2 and React Redux 9
- TypeScript
