import { createSlice } from "@reduxjs/toolkit";

const initialState = {

    profile: null,
    loading: false,
    completed: false 
}

const onboardingSlice = createSlice({
    name : "onboarding",
    initialState,
    reducers:{
        startLoading(state){
            state.loading = true ;
        },
        setProfile(state, action){
            state.profile = action.payload;
            state.completed= action.payload?.onboardingCompleted || false ;
            state.loading = false ;
        }
    }
});


export const { startLoading, setProfile } = onboardingSlice.actions;
export default onboardingSlice.reducer;
