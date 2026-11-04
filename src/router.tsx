import { createBrowserRouter, Navigate } from 'react-router'
import { GuestOnly } from '@/components/auth/GuestOnly'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireRole } from '@/components/auth/RequireRole'
import { AppLayout } from '@/layouts/AppLayout'
import { CustomersPage } from '@/pages/CustomersPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { UsersPage } from '@/pages/UsersPage'

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/customers', element: <CustomersPage /> },
          {
            element: <RequireRole role="admin" />,
            children: [{ path: '/users', element: <UsersPage /> }],
          },
          // Catálogo de componentes: solo en desarrollo y en su propio chunk
          ...(import.meta.env.DEV
            ? [{ path: '/ui-kit', lazy: async () => ({ Component: (await import('@/pages/UiKitPage')).UiKitPage }) }]
            : []),
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
