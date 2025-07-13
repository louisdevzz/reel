import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { User } from '../lib/apiService'
import { apiService } from '../lib/apiService'
import { relayerService } from '../lib/relayerService'
import { toast } from 'react-hot-toast'

interface Category {
  name: string
  subCategories: string[]
}

interface CustomProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdated: (user: User) => void
  currentUser: User
}

interface ProfileFormData {
  username: string
  fullName: string
  email: string
  description: string
  avatar: string
  banner: string
  category: string
  subCategory: string
  tags: string[]
  social: {
    youtube?: string
    twitter?: string
    tiktok?: string
    twitch?: string
    instagram?: string
    website?: string
    discord?: string
    telegram?: string
    facebook?: string
    linkedin?: string
    github?: string
    other?: string
  }
}

export function CustomProfileDialog({
  isOpen,
  onClose,
  onProfileUpdated,
  currentUser
}: CustomProfileDialogProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    fullName: '',
    email: '',
    description: '',
    avatar: '',
    banner: '',
    category: 'Gaming',
    subCategory: 'Valorant',
    tags: [],
    social: {}
  })
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)

  const totalSteps = 4

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const categoriesData = await apiService.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  // Load current user data when dialog opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        username: currentUser.username,
        fullName: currentUser.fullName,
        email: currentUser.email,
        description: currentUser.description,
        avatar: currentUser.avatar || '',
        banner: currentUser.banner || '',
        category: currentUser.category,
        subCategory: currentUser.subCategory,
        tags: currentUser.tags || [],
        social: currentUser.social || {}
      })
      setAvatarPreview(currentUser.avatar || '')
      setBannerPreview(currentUser.banner || '')
    }
  }, [isOpen, currentUser])

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<ProfileFormData> = {}

    if (step === 1) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required'
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters'
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores'
      }

      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required'
      } else if (formData.fullName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters'
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required'
      } else if (formData.description.length < 10) {
        newErrors.description = 'Description must be at least 10 characters'
      }
      
      if (!formData.avatar.trim()) {
        newErrors.avatar = 'Avatar is required'
      }

      // Banner is optional, so no validation needed
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // Update user via API
      const updatedUser = await apiService.updateUser(currentUser.id, {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        description: formData.description,
        avatar: formData.avatar,
        banner: formData.banner,
        category: formData.category,
        subCategory: formData.subCategory,
        tags: formData.tags,
        social: formData.social
      })

      // Update user via relayer (blockchain)
      await relayerService.updateUserInfo({
        user_addr: currentUser.aptosAddress,
        full_name: formData.fullName,
        description: formData.description,
        avatar: formData.avatar,
        banner: formData.banner,
        category: formData.category,
        sub_category: formData.subCategory,
        tags: formData.tags,
        social: formData.social
      })

      if (updatedUser) {
        onProfileUpdated(updatedUser)
        toast.success('Profile updated successfully!')
        onClose()
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update failed:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const updateSocialField = (field: keyof ProfileFormData['social'], value: string) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: value
      }
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (currentStep < totalSteps) {
        handleNext()
      } else {
        handleSubmit()
      }
    }
  }

  const uploadToPinata = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PUBLIC_JWT_PINATA_SECRET}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Pinata error:', errorData);
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await res.json();
      if (!data.IpfsHash) {
        toast.error('Upload failed');
        return null;
      }
      
      return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (type: 'avatar' | 'banner', file: File) => {
    if (file) {
      try {
        const pinataRes = await uploadToPinata(file);
        
        if (pinataRes) {
          if (type === 'avatar') {
            setAvatarPreview(pinataRes);
            setFormData(prev => ({ ...prev, avatar: pinataRes }));
          } else {
            setBannerPreview(pinataRes);
            setFormData(prev => ({ ...prev, banner: pinataRes }));
          }
          toast.success(`${type === 'avatar' ? 'Avatar' : 'Banner'} uploaded successfully!`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${type}`);
      }
    }
  };

  const handleImageDrop = (type: 'avatar' | 'banner', e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(type, file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleFileSelect = (type: 'avatar' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(type, file);
    } else if (file) {
      toast.error('Please select a valid image file');
    }
  };

  const triggerFileInput = (type: 'avatar' | 'banner') => {
    if (type === 'avatar') {
      avatarFileInputRef.current?.click();
    } else {
      bannerFileInputRef.current?.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#18181b] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">
            Customize Your Profile
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Step {currentStep} of {totalSteps} - Update your profile information
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full bg-[#27272a] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your username"
              />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full bg-[#27272a] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full bg-[#27272a] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                onKeyPress={handleKeyPress}
                rows={4}
                className="w-full bg-[#27272a] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Tell us about yourself..."
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Avatar *</label>
              <div
                className="border-2 border-dashed border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:border-purple-500 focus:border-purple-500 relative bg-[#27272a]"
                onClick={() => triggerFileInput('avatar')}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleImageDrop('avatar', e)}
                style={{ minHeight: 150 }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover mb-2" />
                ) : (
                  <>
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto mb-2 text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15.75V19a2 2 0 002 2h14a2 2 0 002-2v-3.25M16.5 10.5L12 6m0 0L7.5 10.5M12 6v9" /></svg>
                    <div className="font-semibold text-base">Drag & drop <span className="text-purple-400">images</span> or <span className="underline text-purple-300">browse files</span></div>
                  </>
                )}
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileSelect('avatar', e)}
                  className="hidden"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                )}
              </div>
              {errors.avatar && <p className="text-red-400 text-sm mt-1">{errors.avatar}</p>}
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Banner</label>
              <div
                className="border-2 border-dashed border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:border-purple-500 focus:border-purple-500 relative bg-[#27272a]"
                onClick={() => triggerFileInput('banner')}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleImageDrop('banner', e)}
                style={{ minHeight: 150 }}
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" className="w-full max-w-lg h-20 object-cover rounded-xl mb-2" />
                ) : (
                  <>
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto mb-2 text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15.75V19a2 2 0 002 2h14a2 2 0 002-2v-3.25M16.5 10.5L12 6m0 0L7.5 10.5M12 6v9" /></svg>
                    <div className="font-semibold text-base">Drag & drop <span className="text-purple-400">images</span> or <span className="underline text-purple-300">browse files</span></div>
                  </>
                )}
                <input
                  ref={bannerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileSelect('banner', e)}
                  className="hidden"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                )}
              </div>
              {errors.banner && <p className="text-red-400 text-sm mt-1">{errors.banner}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Category and Subcategory */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const selectedCategory = e.target.value
                  const category = categories.find(cat => cat.name === selectedCategory)
                  setFormData(prev => ({ 
                    ...prev, 
                    category: selectedCategory,
                    subCategory: category?.subCategories[0] || 'Other' // Reset to first subcategory
                  }))
                }}
                onKeyPress={handleKeyPress}
                disabled={loadingCategories}
                className="w-full bg-[#27272a] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
              >
                {loadingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map(category => (
                    <option key={category.name} value={category.name}>{category.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subcategory *</label>
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                onKeyPress={handleKeyPress}
                disabled={loadingCategories}
                className="w-full bg-[#27272a] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
              >
                {loadingCategories ? (
                  <option>Loading subcategories...</option>
                ) : (
                  (() => {
                    const category = categories.find(cat => cat.name === formData.category)
                    return category?.subCategories.map(subCat => (
                      <option key={subCat} value={subCat}>{subCat}</option>
                    )) || []
                  })()
                )}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Tags */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <p className="text-gray-400 text-sm mb-3">Add tags that describe your content and interests</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-[#27272a] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Add a tag..."
                />
                <button
                  onClick={addTag}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Social Links */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Add your social media links (all optional)</p>
            
            {[
              { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@username' },
              { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' },
              { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
              { key: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/username' },
              { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
              { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
              { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/invite' },
              { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/username' },
              { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
              { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
              { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
              { key: 'other', label: 'Other', placeholder: 'Any other social link' }
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">{label}</label>
                <input
                  type="url"
                  value={formData.social[key as keyof typeof formData.social] || ''}
                  onChange={(e) => updateSocialField(key as keyof typeof formData.social, e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-[#27272a] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 px-6 py-3 rounded-lg transition-colors"
          >
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-6 py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Updating Profile...' : 'Save Changes'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 