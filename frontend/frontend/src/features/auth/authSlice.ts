// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user:null,
    loading: true
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers:{
        setAuth(state,action){
            state.isAuthenticated = true ;
            state.user = action.payload;
            state.loading = false;
        },
        clearAuth(state){
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
        },
        // authLoading(state){
        //     state.loading = true ;
        // }


    }
})

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;


