import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "matches",
  initialState: { list: [], loading: false },
  reducers: {
    start(state) {
      state.loading = true;
    },
    setMatches(state, action) {
      state.list = action.payload;
      state.loading = false;
    }
  }
});

export const { start, setMatches } = slice.actions;
export default slice.reducer;
