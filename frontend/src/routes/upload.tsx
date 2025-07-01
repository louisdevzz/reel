import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
})

function UploadPage() {
  const [video, setVideo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideo(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    // TODO: Gửi video lên backend hoặc IPFS
    setTimeout(() => {
      setUploading(false)
      alert('Upload thành công!')
      setVideo(null)
      setPreview(null)
      setTitle('')
      setDescription('')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-center">
      <div className="card w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Upload New Video</h1>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Video File (15-60s)</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full text-white bg-white/10 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-pink-500"
          />
        </div>
        {preview && (
          <video src={preview} controls className="w-full rounded-lg mb-4" />
        )}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-white bg-white/10 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-pink-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full text-white bg-white/10 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-pink-500"
            rows={3}
          />
        </div>
        <button
          className="btn-primary w-full py-3 text-lg"
          onClick={handleUpload}
          disabled={!video || !title || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    </div>
  )
} 