import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiService } from '../lib/apiService'
import { useUser } from '../contexts/userContext'
import { Upload, MoreVertical, Edit, Trash2, Copy, ExternalLink, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { toast } from 'react-hot-toast'

export const Route = createFileRoute('/studio')({
  component: StudioPage,
})

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

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}

function StudioPage() {
  const [video, setVideo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const [videos, setVideos] = useState<any[]>([])
  const [shorts, setShorts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'video' | 'short'; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { isConnected, currentUser } = useUser()

  useEffect(() => {
    document.title = 'Studio - Reel'
    return () => {
      document.title = 'Reel – A Decentralized SocialFi Platform for Video and Livestreaming'
    }
  }, [])

  useEffect(() => {
    if (isConnected && currentUser) {
      fetchUserVideos()
      fetchUserShorts()
    }
  }, [isConnected, currentUser])

  const fetchUserVideos = async () => {
    if (!currentUser) return;
    try {
      const videosData = await apiService.getVideosByUser(currentUser.id);
      setVideos(videosData);
    } catch (e) {
      console.error('Error fetching user videos:', e);
    }
  }

  const fetchUserShorts = async () => {
    if (!currentUser) return;
    try {
      const shortsData = await apiService.getShortsByUser(currentUser.id);
      setShorts(shortsData);
    } catch (e) {
      console.error('Error fetching user shorts:', e);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file!')
        return
      }
      setVideo(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideo(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('URL copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy URL')
    }
  }

  const handleDeleteVideo = async (videoId: string, type: 'video' | 'short') => {
    if (!currentUser) {
      toast.error('User not found')
      return
    }

    setIsDeleting(true)
    try {
      let success = false
      
      if (type === 'video') {
        success = await apiService.deleteVideo(videoId, currentUser.id)
      } else {
        success = await apiService.deleteShort(videoId, currentUser.id)
      }

      if (success) {
        toast.success(`Deleted successfully!`)
        await fetchUserVideos()
        await fetchUserShorts()
      } else {
        toast.error(`Failed to delete ${type}`)
      }
    } catch (error) {
      toast.error(`Failed to delete ${type}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteDialog = (videoId: string, type: 'video' | 'short', title: string) => {
    setItemToDelete({ id: videoId, type, title })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete || !currentUser) return
    
    await handleDeleteVideo(itemToDelete.id, itemToDelete.type)
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleEditVideo = (videoId: string, type: 'video' | 'short') => {
    // TODO: Implement edit functionality
    toast(`Edit ${type} functionality coming soon!`)
  }

  const handleUpload = async () => {
    if (!video || !title) {
      toast.error('Please select a video and enter a title!')
      return
    }
    if (!isConnected || !currentUser) {
      toast.error('Please connect your wallet and register before uploading!')
      return
    }
    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('Preparing upload...')
    const uploadTimeout = setTimeout(() => {
      setUploading(false)
      setUploadStatus('')
      toast.error('Upload timeout! Please try again or check your network connection.')
    }, 1800000)
    try {
      // Get video duration
      const duration = await getVideoDuration(video)
      const newFilename = generateRandomFilename(video.name)
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
      formData.append('duration', duration.toFixed(0))
      setUploadStatus('Uploading to R2...')
      setUploadProgress(50)
      const response = await apiService.uploadVideo(formData)
      clearTimeout(uploadTimeout)
      if (response.success) {
        setUploadProgress(100)
        setUploadStatus('Upload successful!')
        toast.success(`Upload successful! Video type: ${response.data.type}`)
        setVideo(null)
        setPreview(null)
        setTitle('')
        setDescription('')
        setDialogOpen(false)
        // Refetch both videos and shorts data
        await fetchUserVideos()
        await fetchUserShorts()
      } else {
        toast.error('Upload failed: ' + response.error)
      }
    } catch (error) {
      clearTimeout(uploadTimeout)
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
          <h1 className="text-2xl font-bold text-white mb-4">Connect your wallet to upload videos</h1>
          <p className="text-gray-400">Please connect your Aptos wallet to upload videos.</p>
        </div>
      </div>
    )
  }
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Complete registration</h1>
          <p className="text-gray-400">Please complete your account registration to upload videos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col items-center py-10">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">Your Videos</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="px-4 py-2 text-sm font-semibold bg-[#9147ff] text-white rounded-lg flex items-center gap-2" onClick={() => setDialogOpen(true)}>
                <Upload size={16} />
                Upload Video
              </button>
            </DialogTrigger>
            <DialogContent className="md:min-w-[800px] p-0 md:min-h-[500px] overflow-hidden bg-[#18181b]">
              <div className="flex flex-col md:flex-row w-full">
                {/* Left: File upload/preview */}
                <div className="flex-1 bg-[#232326] p-6 flex flex-col items-center justify-center border-r border-white/10 min-h-[340px]">
                  {!preview ? (
                    <div
                      className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-pink-500 rounded-lg cursor-pointer hover:bg-white/5 transition"
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => document.getElementById('video-upload-input')?.click()}
                    >
                      <span className="text-gray-400 mb-2">Drag & drop your video here</span>
                      <span className="text-gray-500 text-sm">or click to select file</span>
                      <input
                        id="video-upload-input"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <video src={preview} controls className="w-full rounded-lg mb-2 max-h-48" />
                  )}
                  {video && (
                    <button
                      className="mt-2 text-xs text-pink-400 hover:underline"
                      onClick={() => { setVideo(null); setPreview(null); }}
                    >
                      Remove file
                    </button>
                  )}
                </div>
                {/* Right: Form */}
                <div className="flex-1 p-6 flex flex-col gap-4">
                  <DialogHeader>
                    <DialogTitle className="text-white">Upload New Video</DialogTitle>
                    <DialogDescription className="text-white">Fill in the details and upload your video.</DialogDescription>
                  </DialogHeader>
                  <label className="block text-gray-300">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full text-white bg-white/10 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-pink-500"
                  />
                  <label className="block text-gray-300">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full text-white bg-white/10 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-pink-500"
                    rows={3}
                  />
                  {uploading && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-300 mb-1">
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
                    className="w-full py-3 text-base flex items-center justify-center gap-2 mt-2 bg-[#9147ff] text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleUpload}
                    disabled={!video || !title || uploading}
                  >
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : 'Upload Video'}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Tabs for Videos and Shorts */}
        <Tabs defaultValue="videos" className="mb-4">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="shorts">Shorts</TabsTrigger>
          </TabsList>
          <TabsContent value="videos">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-700 bg-[#18181b] text-sm">
                <thead>
                  <tr className="bg-[#232326]">
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Video</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Title</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Visibility</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Restriction</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Date</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Views</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Comments</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Likes</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-gray-400 text-center py-8 bg-[#18181b]">No videos uploaded yet.</td>
                    </tr>
                  ) : (
                    videos.map((v, idx) => (
                      <tr key={v.id || idx} className="hover:bg-[#232326] transition cursor-pointer">
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b]">
                          <Link to="/v/$videoId" params={{ videoId: v.id }}>
                            <video 
                              src={v.videoUrl} 
                              className="w-24 h-14 object-cover rounded" 
                              poster=""
                              preload="metadata"
                            />
                          </Link>
                        </td>
                        <td className="border-b border-gray-700 px-3 py-2 max-w-[220px] bg-[#18181b]">
                          <Link to="/v/$videoId" params={{ videoId: v.id }} className="block">
                            <div className="font-semibold text-white truncate">{v.title.length > 100 ? v.title.slice(0, 100)+"..." : v.title}</div>
                            <div className="text-gray-400 text-xs truncate">{v.description.length > 100 ? v.description.slice(0, 100)+"..." : v.description}</div>
                          </Link>
                        </td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">Public</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">None</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">{v.views || 0}</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">{v.comments || 0}</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">{v.likes || 0}</td>
                        <td className="border-b border-gray-700 px-3 py-2 text-center bg-[#18181b]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                                <MoreVertical size={16} className="text-gray-300" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#232326] border-gray-700">
                              <DropdownMenuItem 
                                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleEditVideo(v.id, 'video')}
                              >
                                <Edit size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                                onClick={() => copyToClipboard(`${window.location.origin}/v/${v.id}`)}
                              >
                                <Copy size={14} className="mr-2" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                                onClick={() => window.open(`/v/${v.id}`, '_blank')}
                              >
                                <ExternalLink size={14} className="mr-2" />
                                Open Video
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                                onClick={() => openDeleteDialog(v.id, 'video', v.title)}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="shorts">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-700 bg-[#18181b] text-sm">
                <thead>
                  <tr className="bg-[#232326]">
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Short</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Title</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Visibility</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Restriction</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Date</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Views</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Comments</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Likes</th>
                    <th className="border-b border-gray-700 px-3 py-2 text-left font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shorts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-gray-400 text-center py-8 bg-[#18181b]">No shorts uploaded yet.</td>
                    </tr>
                  ) : (
                    shorts.map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-[#232326] transition cursor-pointer">
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b]">
                          <Link to="/s/$videoId" params={{ videoId: s.id }}>
                            <video 
                              src={s.videoUrl} 
                              className="w-24 h-14 object-cover rounded" 
                              poster=""
                              preload="metadata"
                            />
                          </Link>
                        </td>
                        <td className="border-b border-gray-700 px-3 py-2 max-w-[220px] bg-[#18181b]">
                          <Link to="/s/$videoId" params={{ videoId: s.id }} className="block">
                            <div className="font-semibold text-white truncate">{s.title}</div>
                            <div className="text-gray-400 text-xs truncate">{s.description}</div>
                          </Link>
                        </td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">Public</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">None</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">{s.views || 0}</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">{s.comments || 0}</td>
                        <td className="border-b border-gray-700 px-3 py-2 bg-[#18181b] text-gray-200">{s.likes || 0}</td>
                        <td className="border-b border-gray-700 px-3 py-2 text-center bg-[#18181b]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                                <MoreVertical size={16} className="text-gray-300" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#232326] border-gray-700">
                              <DropdownMenuItem 
                                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleEditVideo(s.id, 'short')}
                              >
                                <Edit size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                                onClick={() => copyToClipboard(`${window.location.origin}/s/${s.id}`)}
                              >
                                <Copy size={14} className="mr-2" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                                onClick={() => window.open(`/s/${s.id}`, '_blank')}
                              >
                                <ExternalLink size={14} className="mr-2" />
                                Open Short
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                                onClick={() => openDeleteDialog(s.id, 'short', s.title)}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="md:min-w-[400px] bg-[#18181b] border border-gray-700">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white">Delete {itemToDelete?.type}</DialogTitle>
            <DialogDescription className="text-gray-300 mt-2">
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 mt-6">
            <button
              className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setDeleteDialogOpen(false)
                setItemToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 