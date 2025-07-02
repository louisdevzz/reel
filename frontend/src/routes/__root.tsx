import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Toaster } from 'react-hot-toast'
import { UserRegistrationDialog } from '../components/UserRegistrationDialog'
import { User } from '../types'
import { apiService } from '../lib/apiService'
import { UserProvider } from '../lib/userContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if already connected to Petra
    const checkConnection = () => {
      if ('aptos' in window && window.aptos) {
        window.aptos.isConnected().then((connected: boolean) => {
          if (connected && window.aptos) {
            window.aptos.account().then((account: any) => {
              setAccount(account?.address || null)
              setIsConnected(true)
              // Check if user is registered
              checkUserRegistration(account?.address)
            })
          }
        })
      }
    }

    checkConnection()
  }, [])

  const checkUserRegistration = async (address: string) => {
    if (!address) return
    
    try {
      const { exists, user } = await apiService.checkUserExists(address)
      if (exists && user) {
        setCurrentUser(user)
        setShowRegistrationDialog(false)
      } else {
        setShowRegistrationDialog(true)
      }
    } catch (error) {
      console.error('Error checking user registration:', error)
      setShowRegistrationDialog(true)
    }
  }

  const getAptosWallet = () => {
    if ('aptos' in window) {
      return window.aptos
    } else {
      window.open('https://petra.app/', '_blank')
      return null
    }
  }

  const connectWallet = async () => {
    const wallet = getAptosWallet()
    if (!wallet) return
    
    try {
      const response = await wallet.connect()
      console.log('Connected:', response)
      
      const account = await wallet.account()
      setAccount(account?.address || null)
      setIsConnected(true)
      
      // Check if user is registered after connection
      checkUserRegistration(account?.address)
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      if (error.code === 4001) {
        console.log('User rejected the connection request')
      }
    }
  }

  const disconnectWallet = async () => {
    const wallet = getAptosWallet()
    if (!wallet) return
    
    try {
      await wallet.disconnect()
      setAccount(null)
      setIsConnected(false)
      setCurrentUser(null)
      setShowRegistrationDialog(false)
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const handleRegistrationComplete = (user: User) => {
    setCurrentUser(user)
    setShowRegistrationDialog(false)
  }

  return (
    <UserProvider currentUser={currentUser} account={account} isConnected={isConnected}>
      <Layout
        account={account}
        isConnected={isConnected}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      >
        <Toaster />
        <Outlet />
      </Layout>
      
      <UserRegistrationDialog
        isOpen={showRegistrationDialog}
        onClose={() => {}} // Cannot be closed - must complete registration
        onRegistrationComplete={handleRegistrationComplete}
        aptosAddress={account || ''}
      />
    </UserProvider>
  )
} 