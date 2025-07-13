import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiService, User } from '../lib/apiService'

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