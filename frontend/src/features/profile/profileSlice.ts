import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Profile } from '@/types'

type ProfileState = {
  data: Profile | null
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  initialized: false,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setProfile(state, action: PayloadAction<Profile | null>) {
      state.data = action.payload
      state.loading = false
      state.error = null
      state.initialized = true
    },
    setProfileError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.loading = false
      state.initialized = true
    },
    clearProfile(state) {
      state.data = null
      state.loading = false
      state.error = null
      state.initialized = false
    },
  },
})

export const { setProfileLoading, setProfile, setProfileError, clearProfile } = profileSlice.actions
export default profileSlice.reducer
