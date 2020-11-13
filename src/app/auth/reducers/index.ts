import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector, createReducer,
  createSelector,
  MetaReducer, on
} from '@ngrx/store';
import {environment} from '../../../environments/environment';
import {AuthActions} from '../action-types';

export const authFeatureKey = 'auth';

export interface AuthState {

}

export const initialAuthState: AuthState = {
  user: undefined
};

export const reducers: ActionReducerMap<AuthState> = {};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state, action) => {
      return {
        user: action.user
      };
    }
  ),
  on(AuthActions.logout, (state, action) => {
    return {
      user: undefined
    };
  })
);

export const metaReducers: MetaReducer<AuthState>[] = !environment.production ? [] : [];
