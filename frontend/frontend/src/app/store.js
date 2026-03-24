import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import onboardingReducer from "../features/onboarding/onboardingSlice";
import preferenceReducer from "../features/preferences/preferencesSlice";
import discoveryReducer from "../features/discovery/discoverySlice";  // ← ADD
import matchesReducer from "../features/matches/matchesSlice";        // ← ADD

export const store = configureStore({
    reducer: {
        auth : authReducer,
        onboarding : onboardingReducer,
        preferences : preferenceReducer,
        discovery: discoveryReducer,  // ← ADD
        matches: matchesReducer       // ← ADD
    }
})