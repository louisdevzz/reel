import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useKeylessAccounts } from '../lib/core/useKeylessAccounts'

interface AuthContextType {
  account: string | null
  isConnected: boolean
  loginType: 'wallet' | 'keyless' | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  disconnectKeylessAccount: () => void
  disconnect: () => void
  walletAccount: string | null
  keylessAccount: string | null
  isWalletConnected: boolean
  isKeylessConnected: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Keyless (Google)
  const { activeAccount: rawKeylessAccount, disconnectKeylessAccount } = useKeylessAccounts()
  // KeylessAccount type: { address: string, ... } or undefined
  const keylessAccount = rawKeylessAccount?.accountAddress.toString()
  const isKeylessConnected = !!keylessAccount

  // Wallet (Petra)
  const [walletAccount, setWalletAccount] = useState<string | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  // Check wallet connection on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.aptos) {
      window.aptos.isConnected().then((connected: boolean) => {
        if (connected && window.aptos) {
          window.aptos.account().then((account: any) => {
            setWalletAccount(account?.address || null)
            setIsWalletConnected(true)
          })
        }
      })
    }
  }, [])

  // Connect/disconnect wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.aptos) {
      window.open('https://petra.app/', '_blank')
      return
    }
    try {
      await window.aptos.connect()
      const account = await window.aptos.account()
      setWalletAccount(account?.address || null)
      setIsWalletConnected(true)
    } catch (e) {
      // handle error
    }
  }
  const disconnectWallet = async () => {
    if (typeof window !== 'undefined' && window.aptos) {
      await window.aptos.disconnect()
    }
    setWalletAccount(null)
    setIsWalletConnected(false)
  }

  // Ưu tiên wallet nếu cả hai cùng login
  const account: string | null = walletAccount || keylessAccount || null
  const isConnected = !!account
  const loginType: 'wallet' | 'keyless' | null = walletAccount ? 'wallet' : (keylessAccount ? 'keyless' : null)

  // Hàm disconnect tổng hợp
  const disconnect = () => {
    if (loginType === 'wallet') disconnectWallet()
    if (loginType === 'keyless') disconnectKeylessAccount()
  }

  return (
    <AuthContext.Provider value={{
      account,
      isConnected,
      loginType,
      connectWallet,
      disconnectWallet,
      disconnectKeylessAccount,
      disconnect,
      walletAccount,
      keylessAccount: keylessAccount || null,
      isWalletConnected,
      isKeylessConnected,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 