import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import { RouterProvider } from 'react-router-dom'

import './index.css'

import { Auth0Provider } from '@auth0/auth0-react'
import { store } from './app/store'
import { router } from './app/router.jsx'
import AuthSync from './features/auth/AuthSync.jsx'
import { Provider } from 'react-redux'

// import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
    domain="dev-aobtnrv6g50bmj1a.us.auth0.com"
    clientId='2Pz3Q6dir2WRg5lDLW8ucrmo3HG92cOR'
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "http://localhost:4000"
    }}
    >
      <Provider store={store}>
        <AuthSync>
          <RouterProvider router={router} />
        </AuthSync>
        </Provider>
    </Auth0Provider>
  </StrictMode>
)
