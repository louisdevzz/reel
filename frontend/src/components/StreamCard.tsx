export default function StreamCard({ livestreams }: { livestreams: any[] }) {
  return (
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
  )
}