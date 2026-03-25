// @ts-nocheck
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import onboardingReducer from "../features/onboarding/onboardingSlice";
import preferenceReducer from "../features/preferences/preferencesSlice";
import discoveryReducer from "../features/discovery/discoverySlice";
import matchesReducer from "../features/matches/matchesSlice";
import chatReducer from "../features/chat/chatSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        onboarding: onboardingReducer,
        preferences: preferenceReducer,
        discovery: discoveryReducer,
        matches: matchesReducer,
        chat: chatReducer,
    }
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
