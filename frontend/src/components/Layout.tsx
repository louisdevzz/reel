import { ArrowLeftFromLine, ArrowRightFromLine, Spool } from 'lucide-react'
import { Sidebar } from './Sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiService, User } from '../lib/apiService'
import { SearchBar } from './SearchBar'
import ConnectDialog from './ConnectDialog'
import { useAuth } from '../lib/authContext'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { account, isConnected, connectWallet, disconnect } = useAuth()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded)
  }

  // Tự động đóng dialog khi đã connect thành công
  useEffect(() => {
    if (isConnected && connectDialogOpen) {
      setConnectDialogOpen(false)
    }
  }, [isConnected, connectDialogOpen])

  // Fetch user data when account changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!account) {
        setUser(null)
        return
      }

      setLoading(true)
      try {
        const userData = await apiService.getUserByAptosAddress(account)
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [account])

  // Get display name - username if available, otherwise fallback to address
  const getDisplayName = () => {
    if (user?.username) {
      return user.fullName
    }
    if (account) {
      return `${account.slice(0, 6)}...${account.slice(-4)}`
    }
    return 'Unknown'
  }


  return (
    <div className="min-h-screen flex overflow-hidden relative">
      <button
        onClick={toggleSidebar}
        className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#232327] border border-[#2f2f35] border-r-0 rounded-r-lg p-2 hover:bg-[#2f2f35] transition-all duration-300 ${isSidebarExpanded ? 'left-64' : 'left-0'}`}
        aria-label="Toggle Sidebar"
      >
        {isSidebarExpanded
          ? <ArrowLeftFromLine className="w-4 h-4 text-white" />
          : <ArrowRightFromLine className="w-4 h-4 text-white" />
        }
      </button>
      <Sidebar isExpanded={isSidebarExpanded} />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#18181b] border-b border-[#2f2f35] flex items-center px-10 z-20">
          <div className="flex-1 flex items-center">
            <Link to="/" className="flex items-center space-x-2 mr-20">
              <img src="/logo-light-rmbg.png" alt="logo" className="w-8 h-8" />
              <span className="text-white font-bold text-2xl">Reel</span>
            </Link>
            
            <SearchBar className="w-full max-w-md" />
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="text-white text-sm">Home</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-[#18181b] border border-[#232327] text-white">
                <DropdownMenuItem asChild>
                  <Link to="/" className="text-white hover:bg-gray-800 cursor-pointer">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/reels" className="text-white hover:bg-gray-800 cursor-pointer">
                    <Spool className="w-4 h-4 mr-2" />
                    Reels
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/livestream" className="text-white hover:bg-gray-800 cursor-pointer">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Livestream
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/challenges" className="text-white hover:bg-gray-800 cursor-pointer">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Challenges
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/nfts" className="text-white hover:bg-gray-800 cursor-pointer">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    NFTs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#232327]" />
                <DropdownMenuItem asChild>
                  <Link to="/studio" className="text-white hover:bg-gray-800 cursor-pointer">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Studio
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-3 ml-8">
            {!isConnected ? (
              <>
                <button onClick={() => setConnectDialogOpen(true)} className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-200">Login</button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        user?.avatar ? (
                          <img src={user?.avatar} alt={user?.username} className="w-full rounded-full h-full object-cover" />
                        ) : (
                          <span className="text-black text-sm font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
                        )
                      )}
                    </div>
                    <span className="text-white text-sm">
                      {loading ? 'Loading...' : getDisplayName()}
                    </span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#18181b] border border-[#232327] text-white">
                  <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer">
                    <Link to="/live/$username" params={{ username: user?.username || '' }} className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user?.username ? user.fullName : 'Profile'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {user?.username ? `@${user.username}` : getDisplayName()}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  {user && (
                    <>
                      <DropdownMenuSeparator className="bg-[#232327]" />
                      <DropdownMenuItem asChild>
                        <Link to="/u/$username" params={{ username: user.username }} className="text-white hover:bg-gray-800 cursor-pointer">
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user && (
                    <>
                      <DropdownMenuSeparator className="bg-[#232327]" />
                      <DropdownMenuItem asChild>
                        <Link to="/wallet" className="text-white hover:bg-gray-800 cursor-pointer">
                          Wallet
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-[#232327]" />
                  <DropdownMenuItem 
                    onClick={disconnect}
                    className="text-white hover:bg-gray-800 cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <main className="flex-1 bg-black text-white p-0 min-h-screen mt-16 overflow-y-auto">
          {children}
        </main>
      </div>
      <ConnectDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        connectWallet={connectWallet}
      />
    </div>
  )
} 