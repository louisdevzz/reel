import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '../types'
import { apiService } from '../lib/apiService'

interface UserContextType {
  currentUser: User | null
  account: string | null
  isConnected: boolean
  setCurrentUser: (user: User | null) => void
  refetchCurrentUser: () => Promise<void>
} 

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  children,
  account,
  isConnected
}: { children: ReactNode, account: string | null, isConnected: boolean }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const refetchCurrentUser = async () => {
    if (account) {
      try {
        const user = await apiService.getUserByAccount(account)
        setCurrentUser(user)
      } catch (error) {
        console.error('Error refetching user:', error)
        setCurrentUser(null)
      }
    }
  }

  useEffect(() => {
    if (account) {
      apiService.getUserByAccount(account)
        .then(setCurrentUser)
        .catch(() => setCurrentUser(null))
    } else {
      setCurrentUser(null)
    }
  }, [account])

  // Auto refetch user data every minute when connected
  useEffect(() => {
    if (isConnected && account) {
      const interval = setInterval(() => {
        refetchCurrentUser()
      }, 10000) // 10 seconds

      return () => clearInterval(interval)
    }
  }, [isConnected, account])

  return (
    <UserContext.Provider value={{ currentUser, account, isConnected, setCurrentUser, refetchCurrentUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 