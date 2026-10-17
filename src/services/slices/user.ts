import {
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { SerializedError } from '@reduxjs/toolkit';
import type { TUser } from '@utils-types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  authError: SerializedError | null;
  updateError: SerializedError | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  authError: null,
  updateError: null,
};

const saveTokens = (accessToken: string, refresh: string): void => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refresh);
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const checkUserAuth = createAsyncThunk('user/checkAuth', async () => {
  if (!localStorage.getItem('refreshToken')) return null;

  try {
    // Сессионная кука с accessToken пропадает после закрытия браузера
    if (!getCookie('accessToken')) await refreshToken();
    const { user } = await getUserApi();
    return user;
  } catch {
    clearTokens();
    return null;
  }
});

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const res = await registerUserApi(data);
    saveTokens(res.accessToken, res.refreshToken);
    return res.user;
  }
);

export const loginUser = createAsyncThunk('user/login', async (data: TLoginData) => {
  const res = await loginUserApi(data);
  saveTokens(res.accessToken, res.refreshToken);
  return res.user;
});

export const logoutUser = createAsyncThunk('user/logout', async () => {
  try {
    await logoutApi();
  } finally {
    clearTokens();
  }
});

export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => (await updateUserApi(data)).user
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.authError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.isAuthChecked = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.authError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.authError = action.error;
      })
      .addCase(loginUser.pending, (state) => {
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authError = action.error;
      })
      // Токены удаляются в любом случае, поэтому и пользователь сбрасывается всегда
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateError = action.error;
      });
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectAuthError: (state) => state.authError,
    selectUpdateUserError: (state) => state.updateError,
  },
});

export const { clearAuthError } = userSlice.actions;

export const {
  selectUser,
  selectIsAuthChecked,
  selectAuthError,
  selectUpdateUserError,
} = userSlice.selectors;
