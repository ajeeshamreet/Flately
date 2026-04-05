import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthSession, AuthStatus, User } from '@/types'

type AuthState = {
  status: AuthStatus
  accessToken: string | null
  user: User | null
  error: string | null
}

const initialState: AuthState = {
  status: 'loading',
  accessToken: null,
  user: null,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading(state) {
      state.status = 'loading'
      state.error = null
    },
    finishAuthBootstrap(state) {
      if (state.status === 'loading') {
        state.status = 'unauthenticated'
      }
      state.error = null
      state.accessToken = null
      state.user = null
    },
    setSession(state, action: PayloadAction<AuthSession>) {
      state.status = 'authenticated'
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      state.error = null
    },
    clearSession(state) {
      state.status = 'unauthenticated'
      state.accessToken = null
      state.user = null
      state.error = null
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.status = 'unauthenticated'
      state.error = action.payload
      state.accessToken = null
      state.user = null
    },
  },
})

export const { setAuthLoading, finishAuthBootstrap, setSession, clearSession, setAuthError } = authSlice.actions
export default authSlice.reducer
