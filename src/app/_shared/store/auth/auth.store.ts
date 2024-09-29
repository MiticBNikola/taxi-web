import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

import { Customer } from '../../models/Customer';
import { Driver } from '../../models/Driver';

export type AuthState = {
  user: Customer | Driver | null;
  type: string | undefined;
  token?: string;
  session?: string;
  isLoading: boolean;
};

const initialState: AuthState = {
  user: null,
  type: undefined,
  token: undefined,
  session: undefined,
  isLoading: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withDevtools('auth'),
  withState(initialState),
  withMethods((store) => ({
    setToken: (token: string) => {
      localStorage.setItem('token', token);
      patchState(store, { token });
    },
    setSession: (session: string) => {
      localStorage.setItem('session', session);
      patchState(store, { session });
    },
    setAuthUser: (user: Customer | Driver, type: string) => {
      localStorage.setItem('type', type);
      patchState(store, { user, type });
    },
    setLoading: (isLoading: boolean) => patchState(store, { isLoading }),
    clearAuthUser: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('session');
      localStorage.removeItem('type');
      patchState(store, {
        user: null,
        type: undefined,
        token: undefined,
        session: undefined,
      });
    },
  })),
  withHooks((store) => ({
    onInit: () => {
      const localStorageToken = localStorage.getItem('token');
      const localStorageSession = localStorage.getItem('session');
      const localStorageType = localStorage.getItem('type');
      patchState(store, {
        ...(localStorageToken && localStorageToken !== '' && { token: localStorageToken }),
        ...(localStorageSession && localStorageSession !== '' && { session: localStorageSession }),
        ...(localStorageType && localStorageType !== '' && { type: localStorageType }),
      });
    },
  }))
);
