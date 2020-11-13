import {createAction, props} from '@ngrx/store';
import {User} from '../_shared/models/User';

export const login = createAction(
  '[Login Page] User Login',
  props<{user: User}>()
);

export const logout = createAction(
  '[Top Menu] Logout'
)
