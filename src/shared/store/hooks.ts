// The two hooks react-redux provides for reading state and dispatching actions
import { useDispatch, useSelector } from 'react-redux';
// The types we exported from the store file
import type { AppDispatch, RootState } from './store';

// useAppDispatch: same as useDispatch, but it knows the AppDispatch type
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
// useAppSelector: same as useSelector, but it knows the shape of RootState
export const useAppSelector = useSelector.withTypes<RootState>();