# Redux Todos: Local State

A todo app built with **Expo**, **React Native** and **Redux Toolkit**, written as a step-by-step Redux learning project.

On this branch, all todos live in a Redux slice on the device. There is no API: adding, completing and deleting todos change Redux state directly.

> Branch: `feature/redux-todos-local-state`. The next step, loading todos from a fake API with `createAsyncThunk`, is on `feature/redux-todos-async-thunk-fake-api`.

## Features

- Add a todo
- Tap a todo to toggle it between **pending** and **completed**
- Delete a todo
- Filter tabs: **All / Pending / Completed**
- "X of Y completed" summary
- Redux DevTools support through the Expo dev tools plugin

## Redux concepts covered

| Concept | Where |
|---|---|
| Store with `configureStore` | `src/shared/store/store.ts` |
| Typed hooks (`useAppSelector`, `useAppDispatch`) | `src/shared/store/hooks.ts` |
| Slice with `createSlice` (reducers + generated actions) | `src/features/todos/todos.slice.ts` |
| `prepare` callback (creates the id with `nanoid` so reducers stay pure) | `todoAdded` in the slice |
| Immer: mutation-style updates inside reducers | every reducer in the slice |
| Selectors and memoized selectors (`createSelector`) | `src/features/todos/todos.selectors.ts` |
| `Provider` connecting the store to the app | `src/app/_layout.tsx` |
| Presentational components (no Redux inside) | `src/features/todos/components/` |
| Redux DevTools in Expo | `devTools: false` + `enhancers` in `store.ts` |

## Project structure

```
src/
├── app/
│   └── _layout.tsx                # Redux Provider + TodosScreen
├── features/
│   └── todos/
│       ├── types.ts               # Todo, TodoStatus, TodoFilter, TodosState
│       ├── todos.slice.ts         # state, reducers, actions
│       ├── todos.selectors.ts     # reading and deriving state
│       ├── components/
│       │   ├── todo-item.tsx      # one row
│       │   └── filter-tabs.tsx    # All / Pending / Completed
│       └── screens/
│           └── todos-screen.tsx   # the screen
└── shared/
    └── store/
        ├── store.ts               # configureStore, RootState, AppDispatch
        └── hooks.ts               # typed hooks
```

## State shape

```ts
{
  todos: {
    items: Todo[],                          // every todo (never filtered)
    filter: 'all' | 'pending' | 'completed' // selected tab
  }
}
```

Actions: `todoAdded`, `todoToggled`, `todoCompleted`, `todoMarkedPending`, `todoDeleted`, `filterChanged`.

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

## Using Redux DevTools

1. Start the app with `npx expo start` and open it on a device or emulator.
2. In the terminal running Expo, press **Shift + M**.
3. Choose **`redux-devtools-expo-dev-plugin`**. A Chrome window opens.
4. Interact with the app to see each action, its payload, the state diff, and the full state tree.

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
