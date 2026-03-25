// @ts-nocheck
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "./AppLayout";

import Landing from "../pages/Landing";
import NotFound from "../pages/NotFound";

// Import all page components
import DashboardPage from "../features/dashboard/DashboardPage";
import MatchesPage from "../features/matches/MatchesPage";
import DiscoveryPage from "../features/discovery/DiscoveryPage";
import OnboardingPage from "../features/onboarding/OnboardingPage";
import ChatPage from "../features/chat/ChatPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />
    },
    {
        element: <AppLayout />,
        children: [
            {
                path: "/app",
                element: (
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/onboarding",
                element: (
                    <ProtectedRoute>
                        <OnboardingPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/discover",
                element: (
                    <ProtectedRoute>
                        <DiscoveryPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/matches",
                element: (
                    <ProtectedRoute>
                        <MatchesPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/chat/:matchId?",
                element: (
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                )
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
]);