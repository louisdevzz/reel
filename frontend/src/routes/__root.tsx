import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Toaster } from 'react-hot-toast'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if already connected to Petra
    const checkConnection = () => {
      if ('aptos' in window && window.aptos) {
        window.aptos.isConnected().then((connected: boolean) => {
          if (connected && window.aptos) {
            window.aptos.account().then((account: any) => {
              setAccount(account?.address || null)
              setIsConnected(true)
            })
          }
        })
      }
    }

    checkConnection()
  }, [])

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
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return (
    <Layout
      account={account}
      isConnected={isConnected}
      connectWallet={connectWallet}
      disconnectWallet={disconnectWallet}
    >
      <Toaster />
      <Outlet />
    </Layout>
  )
} 