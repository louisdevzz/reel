import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/challenges')({
  component: ChallengesPage,
})

function ChallengesPage() {
  const [activeTab, setActiveTab] = useState('active')

  const activeChallenges = [
    {
      id: 1,
      title: "Create Your First Web3 Video",
      description: "Share your journey into the world of Web3 and blockchain technology",
      reward: "100 APT",
      participants: 1247,
      deadline: "2024-02-15",
      category: "Web3",
      difficulty: "Beginner",
      thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
      isParticipating: false
    },
    {
      id: 2,
      title: "NFT Art Showcase",
      description: "Create and showcase your NFT artwork in a creative video format",
      reward: "250 APT",
      participants: 892,
      deadline: "2024-02-20",
      category: "NFT",
      difficulty: "Intermediate",
      thumbnail: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=300&fit=crop",
      isParticipating: true
    },
    {
      id: 3,
      title: "DeFi Tutorial Masterclass",
      description: "Create an educational video explaining DeFi concepts to beginners",
      reward: "500 APT",
      participants: 456,
      deadline: "2024-02-25",
      category: "DeFi",
      difficulty: "Advanced",
      thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop",
      isParticipating: false
    }
  ]

  const completedChallenges = [
    {
      id: 4,
      title: "Crypto Trading Tips",
      description: "Share your best crypto trading strategies and tips",
      reward: "150 APT",
      participants: 2341,
      completedDate: "2024-01-30",
      category: "Trading",
      thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
      winner: "CryptoTrader123"
    }
  ]

  const joinChallenge = (challengeId: number) => {
    // TODO: Implement challenge joining logic
    console.log('Joining challenge:', challengeId)
  }

  const submitEntry = (challengeId: number) => {
    // TODO: Implement entry submission
    console.log('Submitting entry for challenge:', challengeId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Vibe Challenges</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Participate in exciting challenges, showcase your creativity, and earn APT rewards
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-pink-500 mb-2">15</div>
            <div className="text-gray-300">Active Challenges</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-violet-500 mb-2">2.5K</div>
            <div className="text-gray-300">Total Participants</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">5K APT</div>
            <div className="text-gray-300">Total Rewards</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">89</div>
            <div className="text-gray-300">Winners</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Active Challenges
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'active' ? (
            activeChallenges.map((challenge) => (
              <div key={challenge.id} className="card group hover:scale-105 transition-transform duration-300">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img 
                    src={challenge.thumbnail} 
                    alt={challenge.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {challenge.category}
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                    challenge.difficulty === 'Beginner' ? 'bg-green-500 text-white' :
                    challenge.difficulty === 'Intermediate' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {challenge.difficulty}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-lg">{challenge.title}</h3>
                  <p className="text-gray-300 text-sm">{challenge.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{challenge.participants} participants</span>
                    <span>Deadline: {challenge.deadline}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-500">{challenge.reward}</div>
                    {challenge.isParticipating ? (
                      <button 
                        onClick={() => submitEntry(challenge.id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        Submit Entry
                      </button>
                    ) : (
                      <button 
                        onClick={() => joinChallenge(challenge.id)}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Join Challenge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            completedChallenges.map((challenge) => (
              <div key={challenge.id} className="card group hover:scale-105 transition-transform duration-300">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img 
                    src={challenge.thumbnail} 
                    alt={challenge.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                  
                  {/* Completed Badge */}
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </div>
                  
                  {/* Winner Badge */}
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Winner
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-lg">{challenge.title}</h3>
                  <p className="text-gray-300 text-sm">{challenge.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{challenge.participants} participants</span>
                    <span>Completed: {challenge.completedDate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-500">{challenge.reward}</div>
                    <div className="text-sm text-gray-300">
                      Winner: {challenge.winner}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Featured Challenge */}
        <div className="mt-12">
          <div className="card">
            <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </div>
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Limited Time
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4">
                  Web3 Creator Challenge
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  Create the most innovative Web3 content and win a grand prize of 1000 APT! 
                  Show the world your creativity and technical skills.
                </p>
                
                <div className="flex items-center space-x-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-500">1000 APT</div>
                    <div className="text-gray-400 text-sm">Grand Prize</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-violet-500">5.2K</div>
                    <div className="text-gray-400 text-sm">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">3 Days</div>
                    <div className="text-gray-400 text-sm">Remaining</div>
                  </div>
                </div>
                
                <button className="btn-primary text-lg px-8 py-4">
                  Join Now
                </button>
              </div>
              
              <div className="flex-1">
                <img 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop"
                  alt="Featured Challenge"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 