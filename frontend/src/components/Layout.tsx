import { Sidebar } from './Sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  account: string | null
  isConnected: boolean
  connectWallet: () => void
  disconnectWallet: () => void
}

export function Layout({ 
  children, 
  account, 
  isConnected, 
  connectWallet, 
  disconnectWallet 
}: LayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded)
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar isExpanded={isSidebarExpanded} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-0'}`}>
        <header className={`fixed top-0 right-0 h-16 bg-[#18181b] flex items-center px-6 z-20 border-b border-[#232327] transition-all duration-300 ${isSidebarExpanded ? 'left-64' : 'left-0'}`}>
          <div className="flex-1 flex items-center">
            {/* Reel Logo */}
            <Link to="/" className="flex items-center space-x-2 mr-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">R</span>
              </div>
              <span className="text-white font-bold text-xl">Reel</span>
            </Link>
            
            {/* Sidebar Toggle Button */}
            <button 
              onClick={toggleSidebar}
              className="mr-4 p-2 rounded bg-gray-800 hover:bg-gray-700 transition-all duration-200"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="w-full max-w-md px-4 py-2 rounded bg-black border border-gray-600 text-white focus:outline-none focus:border-white"
            />
            <button className="ml-2 p-2 rounded bg-gray-800 hover:bg-gray-700">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
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
                  <Link to="/videos" className="text-white hover:bg-gray-800 cursor-pointer">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Videos
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
                  <Link to="/upload" className="text-white hover:bg-gray-800 cursor-pointer">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-3 ml-8">
            {!isConnected ? (
              <>
                <button onClick={connectWallet} className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-200">Connect Wallet</button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-medium">P</span>
                    </div>
                    <span className="text-white text-sm">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#18181b] border border-[#232327] text-white">
                  <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Profile</span>
                      <span className="text-xs text-gray-400">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#232327]" />
                  <DropdownMenuItem 
                    onClick={disconnectWallet}
                    className="text-white hover:bg-gray-800 cursor-pointer"
                  >
                    Disconnect Wallet
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
    </div>
  )
} 