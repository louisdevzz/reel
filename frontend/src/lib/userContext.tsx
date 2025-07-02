import { createContext, useContext, ReactNode } from 'react'
import { User } from '../types'

interface UserContextType {
  currentUser: User | null
  account: string | null
  isConnected: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ 
  children, 
  currentUser, 
  account, 
  isConnected 
}: UserContextType & { children: ReactNode }) {
  return (
    <UserContext.Provider value={{ currentUser, account, isConnected }}>
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