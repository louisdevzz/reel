import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider, useAuth } from '../contexts/authContext'
import { UserProvider } from '../contexts/userContext'
import { Layout } from '../components/Layout'
import { CustomToaster } from '../components/CustomToaster'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <AuthUserBridge>
        <CustomToaster />
        <Outlet />
      </AuthUserBridge>
    </AuthProvider>
  )
}

function AuthUserBridge({ children }: { children: React.ReactNode }) {
  const { account, isConnected } = useAuth()
  return (
    <UserProvider account={account} isConnected={isConnected}>
      <Layout>
        {children}
      </Layout>
    </UserProvider>
  )
} 