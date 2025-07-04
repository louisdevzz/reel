import { useState, useEffect } from 'react'
import { apiService, User } from '../lib/apiService'
import { Link } from '@tanstack/react-router'
import { User as UserIcon, Hash, Users, Eye, Heart } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})


interface SearchParams {
  q?: string
  category?: string
  subCategory?: string
}

function SearchPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({})

  // Update document title based on search
  useEffect(() => {
    if (searchParams.q) {
      document.title = `Search: "${searchParams.q}" - Reel`;
    } else if (searchParams.category) {
      if (searchParams.subCategory) {
        document.title = `${searchParams.category} > ${searchParams.subCategory} - Reel`;
      } else {
        document.title = `${searchParams.category} - Reel`;
      }
    } else {
      document.title = "Featured Users - Reel";
    }
    
    // Reset title when component unmounts
    return () => {
      document.title = "Reel – A Decentralized SocialFi Platform for Video and Livestreaming";
    };
  }, [searchParams.q, searchParams.category, searchParams.subCategory]);

  // Get search parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const params: SearchParams = {
      q: urlParams.get('q') || undefined,
      category: urlParams.get('category') || undefined,
      subCategory: urlParams.get('subCategory') || undefined
    }
    setSearchParams(params)
  }, [])

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true)
      setError(null)

      try {
        let results: User[] = []

        if (searchParams.q) {
          // General search
          results = await apiService.searchUsers(searchParams.q, 50)
        } else if (searchParams.category) {
          // Category search
          results = await apiService.searchByCategory(searchParams.category, searchParams.subCategory, 50)
        } else {
          // Default: show top users
          results = await apiService.getTopUsersByFollowers(50)
        }

        setUsers(results)
      } catch (err) {
        console.error('Search failed:', err)
        setError('An error occurred while searching')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [searchParams.q, searchParams.category, searchParams.subCategory])

  const getSearchTitle = () => {
    if (searchParams.q) {
      return `Search results for "${searchParams.q}"`
    } else if (searchParams.category) {
      if (searchParams.subCategory) {
        return `${searchParams.category} > ${searchParams.subCategory}`
      }
      return `Category: ${searchParams.category}`
    }
    return 'Featured Users'
  }

  const getSearchSubtitle = () => {
    if (searchParams.q) {
      return `${users.length} results found`
    } else if (searchParams.category) {
      return `${users.length} users in this category`
    }
    return 'Users with the most followers'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Searching...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{getSearchTitle()}</h1>
          <p className="text-gray-400">{getSearchSubtitle()}</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Link
                key={user.id}
                to="/u/$username"
                params={{ username: user.username }}
                className="bg-[#18181b] border border-[#232327] rounded-lg p-6 hover:bg-[#232327] transition-all duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {user.fullName}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">@{user.username}</p>
                    
                    {user.description && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {user.description}
                      </p>
                    )}

                    {/* Category */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400 text-sm">
                        {user.category}
                        {user.subCategory && ` > ${user.subCategory}`}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{user.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{user.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{user.totalDonationCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  {user.rank <= 10 && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 text-white flex items-center justify-center">
                        <span className="text-white font-bold text-sm">#{user.rank}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No results found
            </h3>
            <p className="text-gray-500">
              {searchParams.q 
                ? `No users match "${searchParams.q}"`
                : 'No users in this category'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 