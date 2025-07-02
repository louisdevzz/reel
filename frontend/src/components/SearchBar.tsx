import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { apiService, User } from '../lib/apiService'
import { Search, X, User as UserIcon, Hash, CheckCircle2, Dot } from 'lucide-react'

interface SearchBarProps {
  className?: string
}

interface SearchSuggestion {
  type: 'user' | 'category' | 'subCategory'
  data: User | string
  displayText: string
  subtitle?: string
  avatar?: string
  verified?: boolean
  live?: boolean
}

export function SearchBar({ className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSuggestions(query.trim())
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const result = await apiService.getSearchSuggestions(searchQuery, 5)
      const newSuggestions: SearchSuggestion[] = []

      // Add user suggestions
      result.users.forEach(user => {
        newSuggestions.push({
          type: 'user',
          data: user,
          displayText: user.fullName,
          subtitle: `@${user.username} • ${user.category}`,
          avatar: user.avatar,
          verified: true, // giả lập luôn verified, có thể sửa lại nếu có field
          live: false // TODO: nếu có field isLive thì lấy, tạm thời random hoặc luôn false
        })
      })

      // Add category suggestions
      result.categories.forEach(category => {
        newSuggestions.push({
          type: 'category',
          data: category,
          displayText: category,
          subtitle: 'Category'
        })
      })

      // Add subcategory suggestions
      result.subCategories.forEach(subCategory => {
        newSuggestions.push({
          type: 'subCategory',
          data: subCategory,
          displayText: subCategory,
          subtitle: 'Subcategory'
        })
      })

      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex])
      } else if (query.trim()) {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'user') {
      const user = suggestion.data as User
      window.location.href = `/u/${user.username}`
    } else if (suggestion.type === 'category') {
      const category = suggestion.data as string
      window.location.href = `/search?category=${encodeURIComponent(category)}`
    } else if (suggestion.type === 'subCategory') {
      const subCategory = suggestion.data as string
      window.location.href = `/search?subCategory=${encodeURIComponent(subCategory)}`
    }
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setQuery('')
  }

  const handleSearch = () => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Render suggestion item giống Twitch
  const renderSuggestion = (suggestion: SearchSuggestion, index: number) => {
    if (suggestion.type === 'user') {
      return (
        <div className="flex items-center space-x-3 w-full">
          {/* Avatar */}
          {suggestion.avatar ? (
            <img src={suggestion.avatar} alt={suggestion.displayText} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-white font-medium truncate">{suggestion.displayText}</span>
            {suggestion.verified && <CheckCircle2 className="inline ml-1 w-4 h-4 text-purple-400 align-text-bottom" aria-label="Verified" />}
            <span className="block text-xs text-gray-400 truncate">{suggestion.subtitle}</span>
          </div>
          {/* LIVE badge (giả lập) */}
          {suggestion.live && (
            <span className="ml-2 px-2 py-0.5 bg-red-600 text-xs text-white rounded font-bold">LIVE</span>
          )}
        </div>
      )
    } else if (suggestion.type === 'category' || suggestion.type === 'subCategory') {
      return (
        <div className="flex items-center space-x-3 w-full">
          <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
            <Hash className="w-4 h-4 text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white font-medium truncate">{suggestion.displayText}</span>
            <span className="block text-xs text-gray-400 truncate">{suggestion.subtitle}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder="Search users, categories..."
          className="w-full max-w-md px-4 py-2 pr-10 rounded bg-transparent border border-gray-600 text-white focus:outline-none focus:border-white placeholder-gray-400"
        />
        {/* Search Icon */}
        <button
          type="button"
          onClick={handleSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#18181b] border border-[#232327] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto min-w-[320px]">
          {suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#232327] transition-colors flex items-center space-x-3 ${
                    index === selectedIndex ? 'bg-[#232327]' : ''
                  }`}
                >
                  {renderSuggestion(suggestion, index)}
                </button>
              ))}
              {/* Search all results */}
              <div className="border-t border-[#232327] mt-2 pt-2">
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-2 text-left hover:bg-[#232327] transition-colors text-blue-400 font-medium flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search "{query}"...
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-400 text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
} 