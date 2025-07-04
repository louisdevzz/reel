import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiService } from '../lib/apiService'
import { useUser } from '../lib/userContext'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
})

// Function to generate random filename
const generateRandomFilename = (originalName: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  const timestamp = Date.now()
  const extension = originalName.split('.').pop() || 'mp4'
  
  return `${result}-${timestamp}.${extension}`
}

function UploadPage() {
  const [video, setVideo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const { isConnected, currentUser } = useUser()

  // Update document title
  useEffect(() => {
    document.title = "Upload Video - Reel";
    
    // Reset title when component unmounts
    return () => {
      document.title = "Reel – A Decentralized SocialFi Platform for Video and Livestreaming";
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type only
      if (!file.type.startsWith('video/')) {
        alert('Vui lòng chọn file video hợp lệ!')
        return
      }

      setVideo(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!video || !title) {
      alert('Vui lòng chọn video và nhập tiêu đề!')
      return
    }

    if (!isConnected || !currentUser) {
      alert('Vui lòng kết nối ví và đăng ký tài khoản trước khi upload video!')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('Đang chuẩn bị upload...')

    // Set upload timeout
    const uploadTimeout = setTimeout(() => {
      setUploading(false)
      setUploadStatus('')
      alert('Upload timeout! Vui lòng thử lại hoặc kiểm tra kết nối mạng.')
    }, 1800000) // 30 minutes for large files

    try {
      // Generate new filename
      const newFilename = generateRandomFilename(video.name)
      
      // Create new File object with the new filename
      const renamedVideo = new File([video], newFilename, {
        type: video.type,
        lastModified: video.lastModified,
      })

      const formData = new FormData()
      formData.append('video', renamedVideo)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('userId', currentUser.id)
      formData.append('isPublic', 'true')

      setUploadStatus('Đang upload lên R2...')
      setUploadProgress(25)

      const response = await apiService.uploadVideo(formData)
      
      clearTimeout(uploadTimeout)
      
      if (response.success) {
        setUploadProgress(100)
        setUploadStatus('Upload thành công!')
        alert(`Upload thành công! Video được phân loại là: ${response.data.type}`)
        setVideo(null)
        setPreview(null)
        setTitle('')
        setDescription('')
      } else {
        alert('Upload thất bại: ' + response.error)
      }
    } catch (error) {
      clearTimeout(uploadTimeout)
      console.error('Upload error:', error)
      alert('Upload thất bại: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setUploadStatus('')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Kết nối ví để upload video</h1>
          <p className="text-gray-400">Vui lòng kết nối ví Aptos để có thể upload video</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Hoàn thành đăng ký</h1>
          <p className="text-gray-400">Vui lòng hoàn thành đăng ký tài khoản để có thể upload video</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
      <div className="w-full max-w-lg h-[calc(100vh-8rem)] overflow-y-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Upload New Video</h1>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Video File</label>
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

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>{uploadStatus}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

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