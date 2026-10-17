// createSelector builds "memoized" selectors: they only recalculate when their input changes
import { createSelector } from '@reduxjs/toolkit';
// RootState tells TypeScript the shape of the whole Redux state
import type { RootState } from '@/shared/store/store';

// Basic selector: returns the full todo list from state
export const selectTodos = (state: RootState) => state.todos.items;

// Memoized selector: only the pending todos
export const selectPendingTodos = createSelector(
  // Input: the full list (from the selector above)
  [selectTodos],
  // Output: filter it; only re-runs when the list itself changes
  (todos) => todos.filter((todo) => todo.status === 'pending'),
);

// Memoized selector: only the completed todos
export const selectCompletedTodos = createSelector(
  // Input: the full list
  [selectTodos],
  // Output: keep only completed ones
  (todos) => todos.filter((todo) => todo.status === 'completed'),
);

// Simple selector: how many todos are completed (a number, so no memoizing needed)
export const selectCompletedCount = (state: RootState) =>
  // Count the items whose status is 'completed'
  state.todos.items.filter((todo) => todo.status === 'completed').length;

// Basic selector: which filter tab is selected
export const selectFilter = (state: RootState) => state.todos.filter;

// Memoized selector with TWO inputs: the list and the filter
export const selectVisibleTodos = createSelector(
  // Inputs: their results are passed to the function below, in this order
  [selectTodos, selectFilter],
  // Re-runs only when the list OR the filter changes
  (todos, filter) =>
    // 'all' → return the list as is (same array, no copy)
    filter === 'all'
      ? todos
      // Otherwise keep only todos whose status matches the filter
      : todos.filter((todo) => todo.status === filter),
);

// Where the API request is: 'idle' | 'loading' | 'succeeded' | 'failed'
export const selectLoadStatus = (state: RootState) => state.todos.loadStatus;

// The error message if loading failed, otherwise null
export const selectLoadError = (state: RootState) => state.todos.error;