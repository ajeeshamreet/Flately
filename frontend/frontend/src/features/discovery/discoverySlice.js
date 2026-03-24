import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    feed : [],
    loading: false} 

const discoverySlice = createSlice({

    name: "discovery",
    initialState,
    reducers: {
        start(state) {
            state.loading = true;
        },
        setFeed(state,action) {
            state.feed = action.payload;
            state.loading = false;
        },
        removeUser(state,action) {
            state.feed = state.feed.filter(u => u.userId !== action.payload);
        }
    }
});

export const { start, setFeed, removeUser } = discoverySlice.actions;
export default discoverySlice.reducer;