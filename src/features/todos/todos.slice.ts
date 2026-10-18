// createSlice builds the reducer + actions; PayloadAction types an action's payload; nanoid makes unique ids
// createAsyncThunk creates async actions (pending / fulfilled / rejected)
import { createAsyncThunk, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
// Import the types we defined in step 1 (import type = only used for TypeScript, removed at runtime)
import type { Todo, TodoFilter, TodosState } from './types';
// The fake API (data source) from step 8
import { todosApi } from './data/todos.api';

// An async action: calls the API and dispatches pending → fulfilled / rejected automatically
export const fetchTodos = createAsyncThunk<
  Todo[],                     // what it returns on success (becomes the fulfilled payload)
  void,                       // what you pass when dispatching: nothing, so dispatch(fetchTodos())
  { rejectValue: string }     // what it returns on failure (becomes the rejected payload)
>(
  // Action type prefix: creates 'todos/fetchTodos/pending', '/fulfilled' and '/rejected'
  'todos/fetchTodos',
  // The async work; first argument is unused (void), second gives helper tools
  async (_, { rejectWithValue }) => {
    // try: run the request; catch: turn any failure into a clean string message
    try {
      // Wait for the API; the result becomes action.payload in "fulfilled"
      return await todosApi.getAll();
    } catch (error) {
      // Send a readable message as action.payload in "rejected"
      return rejectWithValue(error instanceof Error ? error.message : 'Something went wrong');
    }
  },
);

// The state the app starts with, before any action is dispatched
const initialState: TodosState = {
  // Empty: todos now come from the API instead of being hard-coded
  items: [],
  // Show all todos when the app starts
  filter: 'all',
  // Nothing has been requested yet
  loadStatus: 'idle',
  // No error yet
  error: null,
};

// createSlice generates the reducer and action creators for the "todos" part of state
const todosSlice = createSlice({
  // Prefix for every action type, e.g. 'todos/todoAdded'
  name: 'todos',
  // The starting state defined above
  initialState,
  // Each key here becomes one action + one case in the reducer
  reducers: {
    // Adds a new todo; written as an object because it needs a "prepare" step
    todoAdded: {

    //Note: Why todoAdded has a prepare step.
    // Reducers must be pure: the same input always gives the same output. nanoid() returns a different value every time, so it can’t run inside the reducer. prepare runs before the action is dispatched, creates the id there, and the reducer just stores it.

      // reducer: runs when the action reaches the store; receives the already-prepared payload
      reducer: (state, action: PayloadAction<Todo>) => {
        // Add the new todo to the end of the list (Immer makes this "mutation" safe)
        state.items.push(action.payload);
      },
      // prepare: runs when you call todoAdded('Buy milk'), before dispatch; builds the payload
      prepare: (title: string) => ({
        // The payload that the reducer above will receive
        payload: {
          // Create the id here, not in the reducer, so the reducer stays pure
          id: nanoid(),
          // Remove spaces at the start/end of what the user typed
          title: title.trim(),
          // Every new todo starts as pending
          status: 'pending',
        } as Todo, // Tell TypeScript this object is a Todo ('pending' stays the literal type)
      }),
    },

    // Marks one todo as completed; the payload is the todo's id
    //<string> - present Todo ID
    todoCompleted: (state, action: PayloadAction<string>) => {
      // Find the todo whose id matches the payload
      const todo = state.items.find((item) => item.id === action.payload);
      // Only change it if it was found (the id could be wrong)
      if (todo) todo.status = 'completed';
    },

    // Marks one todo as pending again; the payload is the todo's id
    todoMarkedPending: (state, action: PayloadAction<string>) => {
      // Find the todo whose id matches the payload
      const todo = state.items.find((item) => item.id === action.payload);
      // Only change it if it was found
      if (todo) todo.status = 'pending';
    },

    ///TODO:remove the two above and keep todoToggled
    // Switches a todo between pending and completed (handy for a checkbox tap)
    todoToggled: (state, action: PayloadAction<string>) => {
      // Find the todo whose id matches the payload
      const todo = state.items.find((item) => item.id === action.payload);
      // Stop here if no todo has that id
      if (!todo) return;
      // Flip the status: completed → pending, pending → completed
      todo.status = todo.status === 'completed' ? 'pending' : 'completed';
    },

    // Removes a todo from the list; the payload is the todo's id
    todoDeleted: (state, action: PayloadAction<string>) => {
      // Keep every todo except the one with this id (returning nothing is fine; we replaced state.items)
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    // Changes which tab is selected; the payload is the new filter
    filterChanged: (state, action: PayloadAction<TodoFilter>) => {
      // Replace the current filter; the todo list itself is not touched
      state.filter = action.payload;
    },
  },
  // extraReducers: respond to actions created OUTSIDE this slice's reducers (like the thunk's)
  extraReducers: (builder) => {
    // builder lets you add one case per action type
    builder
      // Request started
      .addCase(fetchTodos.pending, (state) => {
        // Show the spinner
        state.loadStatus = 'loading';
        // Clear any old error from a previous failed attempt
        state.error = null;
      })
      // Request succeeded; action.payload is the Todo[] the thunk returned
      .addCase(fetchTodos.fulfilled, (state, action) => {
        // Show the list
        state.loadStatus = 'succeeded';
        // Replace the list with the server's todos
        state.items = action.payload;

      })
      // Request failed; action.payload is the string from rejectWithValue
      .addCase(fetchTodos.rejected, (state, action) => {
        // Show the error UI
        state.loadStatus = 'failed';
        // Use our message; fall back to Redux's own error message if payload is missing
        state.error = action.payload ?? action.error.message ?? 'Something went wrong';
      });
  },
});

// Export the action creators Redux Toolkit generated from the reducer names above
export const {
  todoAdded,
  todoCompleted,
  todoMarkedPending,
  todoToggled,
  todoDeleted,
  filterChanged,
} = todosSlice.actions;

// Export the reducer so the store (step 3) can use it
export default todosSlice.reducer;