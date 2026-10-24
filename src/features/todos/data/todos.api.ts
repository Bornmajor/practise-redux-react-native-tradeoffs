// The Todo type, so the API's return value is typed
import type { Todo } from '../types';

// Pretend server data: what the "backend" would send back
const SERVER_TODOS: Todo[] = [
  // Each object is one todo, same shape as our Todo type
  { id: 'srv-1', title: 'Read the Redux Essentials tutorial', status: 'completed' },
  { id: 'srv-2', title: 'Write a slice', status: 'completed' },
  { id: 'srv-3', title: 'Learn createAsyncThunk', status: 'pending' },
  { id: 'srv-4', title: 'Open Redux DevTools', status: 'pending' },
  { id: 'srv-5', title: 'Handle loading and errors', status: 'pending' },
];

// The API object; later you'd replace the inside of these functions with real fetch calls
export const todosApi = {
  // Fetch all todos; returns a Promise because a real request takes time
  getAll(): Promise<Todo[]> {
    // Wrap setTimeout in a Promise so callers can "await" it
    return new Promise((resolve, reject) => {
      // Wait 1 second to imitate network delay
      setTimeout(() => {
        // Fail about 20% of the time so you can see the error state
        if (Math.random() < 0.2) {
          // Reject = the request failed; this becomes the "rejected" action
          reject(new Error('Could not reach the server'));
        } else {
          // Resolve = success; send a copy so the original array is never shared
          resolve(SERVER_TODOS.map((todo) => ({ ...todo })));
        }
      }, 1000);
    });
  },
};
