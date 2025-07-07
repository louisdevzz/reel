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
  isRestoringSession: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Keyless (Google)
  const { 
    activeAccount: rawKeylessAccount, 
    disconnectKeylessAccount: originalDisconnectKeylessAccount, 
    clearAllStoredData,
    accounts: storedAccounts,
    switchKeylessAccount,
    getEphemeralKeyPair
  } = useKeylessAccounts()

  // Wrapper for disconnectKeylessAccount that also sets logout flag
  const disconnectKeylessAccount = () => {
    console.log('Disconnecting keyless account and setting logout flag')
    originalDisconnectKeylessAccount()
    localStorage.setItem('keyless_logged_out', 'true')
  }
  
  // KeylessAccount type: { address: string, ... } or undefined
  const keylessAccount = rawKeylessAccount?.accountAddress.toString()
  const isKeylessConnected = !!keylessAccount

  // Wallet (Petra)
  const [walletAccount, setWalletAccount] = useState<string | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isRestoringSession, setIsRestoringSession] = useState(false)

  // Auto-restore keyless session on mount
  useEffect(() => {
    const restoreKeylessSession = async () => {
      // If already connected, no need to restore
      if (isKeylessConnected) return

      // Check if user has explicitly logged out by checking localStorage
      const hasLoggedOut = localStorage.getItem('keyless_logged_out') === 'true'
      if (hasLoggedOut) {
        console.log('User has logged out, skipping auto-restore')
        clearAllStoredData()
        localStorage.removeItem('keyless_logged_out')
        return
      }

      // Check if we have stored accounts and a valid ephemeral key pair
      if (storedAccounts.length > 0) {
        console.log('Found stored accounts, attempting to restore session...')
        setIsRestoringSession(true)
        const ephemeralKeyPair = getEphemeralKeyPair()
        
        if (ephemeralKeyPair) {
          // Try to restore the first stored account
          const firstAccount = storedAccounts[0]
          try {
            await switchKeylessAccount(firstAccount.idToken.raw)
            console.log('Successfully restored keyless session')
          } catch (error) {
            console.log('Failed to restore keyless session:', error)
            // If restoration fails, clear the stored data
            clearAllStoredData()
          } finally {
            setIsRestoringSession(false)
          }
        } else {
          // If no valid ephemeral key pair, clear stored data
          console.log('No valid ephemeral key pair found, clearing stored data')
          clearAllStoredData()
          setIsRestoringSession(false)
        }
      }
    }

    // Small delay to ensure Zustand store is hydrated
    const timer = setTimeout(restoreKeylessSession, 100)
    return () => clearTimeout(timer)
  }, [storedAccounts, isKeylessConnected, getEphemeralKeyPair, switchKeylessAccount, clearAllStoredData])

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
      isRestoringSession,
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