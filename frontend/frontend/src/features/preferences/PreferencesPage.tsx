// @ts-nocheck
import { useDispatch } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { apiRequest } from "../../services/api";
import { start, success, fail } from "./preferencesSlice";

import PreferenceForm from "./PreferenceForm";


export default function PreferencesPage() {
    const dispatch = useDispatch();
    const { getAccessTokenSilently } = useAuth0();

    async function submit(data) {
        try {
            dispatch(start());
            const res = await apiRequest("/preferences/me", {
                method: "POST",
                data: data  // Use 'data' for axios, not 'body'
            }, getAccessTokenSilently);
            dispatch(success(res));
        }
        catch (error) {
            dispatch(fail(error.message));
        }
    }

    return (
        <>
            <h2>Set your preferences</h2>
            <PreferenceForm onSubmit={submit} />
        </>
    );
}
