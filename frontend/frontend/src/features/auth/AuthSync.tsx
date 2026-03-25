// @ts-nocheck
import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { setAuth, clearAuth } from "./authSlice";
import { apiRequest } from "../../services/api";

export default function AuthSync({ children }) {
  const { isAuthenticated, user, isLoading, getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const syncedRef = useRef(false);

  useEffect(() => {
    console.log("🔄 AuthSync:", {
      isLoading,
      isAuthenticated,
      user: user?.email,
    });

    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log("✅ Dispatching setAuth");
        dispatch(setAuth(user));

        // Sync user with backend (create user record if not exists)
        if (!syncedRef.current) {
          syncedRef.current = true;
          syncUserWithBackend();
        }
      } else {
        console.log("❌ Dispatching clearAuth");
        dispatch(clearAuth());
        syncedRef.current = false;
      }
    }
  }, [isAuthenticated, user, isLoading, dispatch]);

  async function syncUserWithBackend() {
    try {
      console.log("🔄 Syncing user with backend...");
      const userData = await apiRequest("/users/me", {}, getAccessTokenSilently);
      console.log("✅ User synced:", userData);
    } catch (error) {
      console.error("❌ Failed to sync user with backend:", error);
    }
  }

  return children;
}
