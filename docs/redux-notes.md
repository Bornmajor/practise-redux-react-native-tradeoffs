# Redux Notes

Summary of what I learned building the todo app with Redux Toolkit, and how to explain Redux in an interview.

## 1. Redux in one sentence

**Redux is a predictable state container: all shared state lives in one store, and the only way to change it is to dispatch an action that a pure reducer turns into new state.**

## 2. Core ideas

| Concept | One-line explanation | In the todo app |
|---|---|---|
| **Store** | the single object holding all app state | `configureStore({ reducer: { todos } })` |
| **Action** | a plain object describing what happened | `{ type: 'todos/todoToggled', payload: '1' }` |
| **Reducer** | a pure function: `(state, action) => newState` | `todoToggled` in the slice |
| **Dispatch** | how you send an action to the store | `dispatch(todoToggled(id))` |
| **Selector** | a function that reads a piece of state | `selectVisibleTodos` |
| **Slice** | one feature's state, reducers and actions together | `todosSlice` |
| **Thunk** | async logic that dispatches actions | `fetchTodos` (pending → fulfilled/rejected) |
| **RTK Query** | API layer with caching and request status built in | `useGetTodosQuery()` |

**Data flow:** UI → `dispatch(action)` → reducer → new state → selectors → UI re-renders.

## 3. The rules that make it work

1. **One-way data flow:** state only changes through dispatched actions.
2. **Reducers are pure:** no API calls, random ids or timers. That's why the id moved into `prepare` and requests moved into thunks.
3. **State is immutable:** never change state in place. Redux Toolkit uses Immer, so mutation-style code is only safe inside slices.
4. **Derived data is computed, not stored:** "visible todos" comes from a selector and isn't saved in state.

## 4. When to use Redux

**Use it when:**

- one event must update many features (logout, switching accounts)
- several developers or teams need one consistent pattern
- state changes are complex and you need to trace or replay them
- server data and app state are tightly linked (RTK Query)
- the codebase already uses it

**Don't use it when:**

- the app is small, with a few independent global values → **Zustand** or React Context
- the state only belongs to one component → **`useState`**
- it's only server data → **TanStack Query** or **RTK Query**, not a hand-written slice

**Where each kind of state belongs:**

| State | Tool |
|---|---|
| Local to one component (input text, modal open) | `useState` |
| Shared app/client state (session, filter, settings) | Redux slice or Zustand |
| Server data (lists, profiles) | RTK Query or TanStack Query |
| Secrets (tokens) | `expo-secure-store`, never Redux |

### Redux vs Zustand in one example

**Logout must clear cart, wishlist, orders, checkout and profile.**

- **Redux:** dispatch one `loggedOut` action. Each slice handles it in its own `extraReducers` and resets itself. The logout code doesn't know which features exist, and a new feature adds one line in its own file.
- **Zustand:** logout (or a reset registry) must call every store's reset function. It works, but the logout code has to know about every store, and forgetting a new one leaks the previous user's data.

**A few independent settings (theme, units) in a small app:** Zustand is one short file with no Provider. Redux needs a slice, store, typed hooks and a Provider before storing one value.

## 5. Mistakes to avoid

- Putting **API data in hand-written slices** with your own loading flags. Use RTK Query instead.
- Putting **everything** in Redux, including form inputs and local UI state.
- **Storing derived data** (filtered lists, counts) instead of computing it with selectors.
- Selectors that return **a new array on every call** without `createSelector`, which causes extra re-renders.
- Side effects (API calls, ids, timers) **inside reducers**.
- **One status field for every request.** Each request needs its own status, which RTK Query tracks for you.

## 6. Interview questions and answers

**What is Redux?**

> A state management library where shared state lives in one store and changes only through dispatched actions handled by pure reducers. That makes state changes predictable and traceable. Today we write it with Redux Toolkit, which removes most of the old boilerplate.

**Explain the Redux data flow.**

> The UI dispatches an action describing what happened. The store passes the current state and the action to the reducer, which returns new state. Components subscribed through selectors re-render if the data they use changed. It's one-way: UI → action → reducer → state → UI.

**Why must reducers be pure?**

> So the same state and action always produce the same result. That makes behavior predictable, testable, and replayable in DevTools. Side effects like API calls go in thunks or RTK Query, and random values like ids are created before the action reaches the reducer, for example in `prepare`.

**How does Redux Toolkit let you write `state.items.push()` if state is immutable?**

> It uses Immer. Inside `createSlice`, you write code that looks like mutation on a draft, and Immer produces a new immutable state from those changes. That only works inside slice reducers.

**How do you handle async logic in Redux?**

> For general async flows, `createAsyncThunk`, which dispatches pending, fulfilled and rejected actions that the slice handles in `extraReducers`. For API data, RTK Query: you define endpoints once, and it generates hooks with caching, loading and error states, plus automatic refetching through tags.

**Redux vs Zustand: when would you choose each?**

> Redux when many features react to the same events, like logout clearing every slice, when a larger team needs one consistent structure, or when complex flows need tracing with DevTools. Zustand when the app is small and global state is a few independent values: it's less setup and code. For server data I'd use RTK Query with Redux, or TanStack Query with Zustand.

**Redux vs Context API?**

> Context passes values down the tree, but every consumer re-renders when the value changes, and it has no actions, middleware or DevTools. It's fine for rarely changing values like theme. Redux lets components subscribe to just the slice of state they need, and adds structure and debugging for frequently changing shared state.

**What's the difference between `reducers` and `extraReducers`?**

> `reducers` defines the slice's own actions and generates their action creators. `extraReducers` responds to actions defined elsewhere, such as thunk lifecycle actions or another slice's actions like `loggedOut`.

**What are selectors, and why memoize them?**

> Functions that read or derive data from state. A selector that filters returns a new array every time, which would re-render components on every state change. `createSelector` caches the result and only recalculates when its inputs change.

**Query vs mutation in RTK Query?**

> A query reads data: it runs automatically, is cached and provides tags. A mutation changes server data: it runs only when called, isn't cached, and invalidates tags so the related queries refetch.

## 7. The one-statement answer

> Redux fits complex state because every change is a named action handled by pure reducers in one central store, so any feature can react to any event, and every change is predictable, traceable and testable.

## 8. What I built

| Branch | Concepts practised |
|---|---|
| `feature/redux-todos-local-state` | store, slice, actions, `prepare`, selectors, `createSelector`, Provider, typed hooks, DevTools |
| `feature/redux-todos-async-thunk-fake-api` | `createAsyncThunk`, `extraReducers`, `rejectWithValue`, loading and error states |
| `feature/redux-todos-rtk-query` (next) | queries, mutations, tags, cache-driven UI |

In an interview: "I built a todo app first with local state, then thunks, then RTK Query, and here's what each step changed." That shows understanding of *why* each tool exists, not just how to use it.
