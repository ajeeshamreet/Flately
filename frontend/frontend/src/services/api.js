// import { useAuth0 } from "@auth0/auth0-react";

import axios from "axios";

/**
 * INTENT: Centralized API client for all backend requests
 * 
 * WHY AXIOS:
 * - Automatic JSON parsing (no .json() needed)
 * - Better error handling (throws on 4xx/5xx)
 * - Request/response interceptors for auth
 * - Timeout support
 * - XSRF protection built-in
 * 
 * WHY THIS PATTERN:
 * - Single source of truth for API config
 * - Easy to add auth headers everywhere
 * - Consistent error handling
 */


const api = axios.create({
    baseURL: 'http://localhost:4000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Make an authenticated API request
 * 
 * @param {string} path - API endpoint (e.g., '/profiles/me')
 * @param {object} options - Axios config (method, data, etc.)
 * @param {function} getToken - Auth0's getAccessTokenSilently function
 * @returns {Promise} - Response data
 */

export async function apiRequest(path,options = { }, getToken){
        const token = await getToken()

        const response= await api({
            url:path,
            ...options,
            headers:{
                ...options.headers,
                Authorization:`Bearer ${token}`,
            },
        })
        return response.data;

    } 
// see wr are eporting the default api , the axios , object , inc ase we need it afterwarsds 

export default api;
//         return response.data;
//         const res= await fetch(`http://localhost:4000${path}`, {
//             ...options,
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`,
//             },
//         });

//         const data = await res.json();
//         if (!res.ok) {throw data };
//         return data;
// }