import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from '@/app/store'
import { router } from '@/app/router'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { AuthBootstrap } from '@/features/auth/AuthBootstrap'
import './index.css'

const app = (
  <Provider store={store}>
    <AuthProvider>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
    </AuthProvider>
  </Provider>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  app,
)
