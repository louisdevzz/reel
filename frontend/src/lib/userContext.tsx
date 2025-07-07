import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '../types'
import { apiService } from './apiService'

interface UserContextType {
  currentUser: User | null
  account: string | null
  isConnected: boolean
  setCurrentUser: (user: User | null) => void
} 

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  children,
  account,
  isConnected
}: { children: ReactNode, account: string | null, isConnected: boolean }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

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
    <UserContext.Provider value={{ currentUser, account, isConnected, setCurrentUser }}>
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