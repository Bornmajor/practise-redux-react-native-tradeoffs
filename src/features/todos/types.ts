// A todo can only be in one of these two states, nothing else
export type TodoStatus = 'pending' | 'completed';

// Which todos the list shows: everything, or one status (reuses TodoStatus)
export type TodoFilter = 'all' | TodoStatus;

// Where the "load todos from the API" request is
export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// The shape of a single todo item
export type Todo = {
  id: string;            // unique identifier, used to find the todo when updating it
  title: string;         // the text the user typed, e.g. "Buy milk"
  status: TodoStatus;    // 'pending' or 'completed', uses the type above
};

// The shape of the todos part of the Redux state
export type TodosState = {
  items: Todo[];         // the list of all todos (never filtered)
  filter: TodoFilter;    // which tab is selected
  loadStatus: LoadStatus;  // progress of loading from the API
  error: string | null;    // error message if loading failed, otherwise null
};