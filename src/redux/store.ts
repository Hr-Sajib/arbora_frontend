import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import baseApi from './api/baseApi'; // Only import baseApi

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer, // Use baseApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware), // Only baseApi middleware
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;