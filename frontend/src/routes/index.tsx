import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const livestreams = [
  {
    id: 1,
    title: 'NEW⭐️DROPS ON⭐️ ➔ EBR 105 SOLO 3 MARKING',
    streamer: 'German_intelligence',
    game: 'World of Tanks',
    viewers: 795,
    tags: ['WorldofTanks', 'Onslaught', 'DropsEnabled'],
    language: 'en',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_german_intelligence-440x248.jpg',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/1b1e7e7e-1b1e-4e7e-8e7e-1b1e7e7e1b1e-profile_image-70x70.png',
    isLive: true,
  },
  {
    id: 2,
    title: '2025 NBPL SPRING SPLIT GRAND FINAL TRIOS',
    streamer: 'NARAKABLADEPOINT',
    game: 'NARAKA: BLADEPOINT',
    viewers: 50,
    tags: ['naraka', 'TiếngViệt', 'Vietnamese', 'English'],
    language: 'vi',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_narakabladepoint-440x248.jpg',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/2b2e7e7e-2b2e-4e7e-8e7e-2b2e7e7e2b2e-profile_image-70x70.png',
    isLive: true,
  },
  {
    id: 3,
    title: '✨Hoy es la actualización✨ZVZ✨DROPS✅✨',
    streamer: 'whithblade',
    game: 'Albion Online',
    viewers: 645,
    tags: ['Español', 'méxico', 'drops', 'DropsActivados'],
    language: 'es',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_whithblade-440x248.jpg',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/3c3e7e7e-3c3e-4e7e-8e7e-3c3e7e7e3c3e-profile_image-70x70.png',
    isLive: true,
  },
]

const categories = [
  {
    id: 1,
    name: 'VALORANT',
    image: 'https://static-cdn.jtvnw.net/ttv-boxart/516575-285x380.jpg',
  },
  {
    id: 2,
    name: 'LEAGUE OF LEGENDS',
    image: 'https://static-cdn.jtvnw.net/ttv-boxart/21779-285x380.jpg',
  },
  {
    id: 3,
    name: 'ROBLOX',
    image: 'https://static-cdn.jtvnw.net/ttv-boxart/27471-285x380.jpg',
  },
  {
    id: 4,
    name: 'JUST CHATTING',
    image: 'https://static-cdn.jtvnw.net/ttv-boxart/509658-285x380.jpg',
  },
  {
    id: 5,
    name: 'COUNTER STRIKE 2',
    image: 'https://static-cdn.jtvnw.net/ttv-boxart/32399_2-285x380.jpg',
  },
  {
    id: 6,
    name: 'DOTA 2',
    image: 'https://static-cdn.jtvnw.net/ttv-boxart/29595-285x380.jpg',
  },
]

function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Livestreams */}
      <section className="px-4 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 flex-col md:flex-row">
            {livestreams.map((stream) => (
              <div key={stream.id} className="flex-1 bg-[#18181b] rounded-lg overflow-hidden border border-[#27272a] shadow group hover:scale-[1.03] transition-transform cursor-pointer">
                <div className="relative">
                  <img src={stream.thumbnail} alt={stream.title} className="w-full h-48 object-cover" />
                  {stream.isLive && (
                    <span className="absolute top-2 left-2 bg-red-600 text-xs font-bold px-2 py-1 rounded text-white">TRỰC TIẾP</span>
                  )}
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{stream.viewers} người xem</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <img src={stream.avatar} alt={stream.streamer} className="w-8 h-8 rounded-full border border-white" />
                  <div>
                    <div className="font-semibold truncate max-w-[200px]">{stream.title}</div>
                    <div className="text-xs text-gray-400">{stream.streamer}</div>
                    <div className="text-xs text-gray-400">{stream.game}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stream.tags.map((tag, i) => (
                        <span key={i} className="bg-[#27272a] text-xs px-2 py-0.5 rounded text-gray-300">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pt-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-purple-300">Các danh mục chúng tôi nghĩ bạn sẽ thích</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-[#18181b] rounded-lg overflow-hidden border border-[#27272a] shadow hover:scale-105 transition-transform cursor-pointer">
                <img src={cat.image} alt={cat.name} className="w-full h-48 object-cover" />
                <div className="p-2 text-center font-semibold text-white text-sm truncate">{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 