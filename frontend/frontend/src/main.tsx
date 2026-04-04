// @ts-nocheck
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import { RouterProvider } from 'react-router-dom'

import './index.css'

import { Auth0Provider } from '@auth0/auth0-react'
import { store } from './app/store'
import { router } from './app/router'
import AuthSync from './features/auth/AuthSync'
import { Provider } from 'react-redux'
import { runtimeConfig } from './config/runtimeConfig'

// import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
    domain={runtimeConfig.auth0Domain}
    clientId={runtimeConfig.auth0ClientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: runtimeConfig.auth0Audience
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
