// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data : null,
    loading : false,
    error : null   
    
};

const slice = createSlice({
    name: "preferences",
    initialState,
    reducers: {
        start(state){
            state.loading = true ;
        },
        success(state,action){
            state.data= action.payload;
            state.loading = false ;
        },
        fail(state,action){
            state.error = action.payload;
            state.loading = false ;
        }
    }

})

export const { start , success, fail } = slice.actions;
export default slice.reducer;