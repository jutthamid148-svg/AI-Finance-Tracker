import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { User, Lock, Camera, Save, Eye, EyeOff, Loader2, Crown } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      currency: user?.currency || 'PKR',
    }
  })

  const passwordForm = useForm()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }

    setAvatarUploading(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      setAvatarPreview(base64)
      const res = await authAPI.updateProfile({ avatar: base64 })
      updateUser(res.data)
      toast.success('Profile picture updated!')
    } catch {
      toast.error('Failed to upload image')
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true)
    try {
      const res = await authAPI.updateProfile({ avatar: '' })
      updateUser(res.data)
      setAvatarPreview(null)
      toast.success('Profile picture removed')
    } catch {
      toast.error('Failed to remove image')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onSaveProfile = async (data: any) => {
    setSaving(true)
    try {
      const res = await authAPI.updateProfile(data)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (data: any) => {
    setSaving(true)
    try {
      await authAPI.changePassword(data)
      toast.success('Password changed successfully!')
      passwordForm.reset()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const currentAvatar = avatarPreview || user?.avatar

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Profile Settings</h1>
        <p className="text-white/50 text-sm">Manage your account information</p>
      </div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {/* Avatar circle */}
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group relative"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change photo"
            >
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold group-hover:opacity-70 transition-opacity">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Camera size={20} className="text-white" />
              </div>
            </div>

            {/* Upload indicator button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {avatarUploading
                ? <Loader2 size={12} className="text-white animate-spin" />
                : <Camera size={13} className="text-white" />
              }
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h2 className="text-xl font-bold">{user?.full_name}</h2>
              {user?.is_pro && (
                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Crown size={10} /> Pro
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`badge text-xs ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
                {user?.is_verified ? '✅ Verified' : '⚠️ Unverified'}
              </span>
              {currentAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarUploading}
                  className="text-xs text-white/30 hover:text-red-400 transition-colors"
                >
                  Remove photo
                </button>
              )}
            </div>
            <p className="text-white/25 text-xs mt-2">Click photo to upload • JPG/PNG/GIF • Max 2MB</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'profile', label: 'Profile Info', icon: User },
          { key: 'password', label: 'Change Password', icon: Lock },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card">
          <h2 className="font-bold text-lg mb-6">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className="input" {...profileForm.register('first_name', { required: true })} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" {...profileForm.register('last_name', { required: true })} />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
              <p className="text-white/30 text-xs mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" placeholder="03XX-XXXXXXX" {...profileForm.register('phone')} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" {...profileForm.register('currency')}>
                <option value="PKR">🇵🇰 PKR — Pakistani Rupee</option>
                <option value="USD">🇺🇸 USD — US Dollar</option>
                <option value="EUR">🇪🇺 EUR — Euro</option>
                <option value="GBP">🇬🇧 GBP — British Pound</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <div className="spinner w-4 h-4 border-2" /> : <Save size={16} />}
              Save Changes
            </button>
          </form>
        </motion.div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card">
          <h2 className="font-bold text-lg mb-6">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-5">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Enter current password"
                  {...passwordForm.register('old_password', { required: true })}
                />
                <button type="button" onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Min 8 characters"
                  {...passwordForm.register('new_password', { required: true, minLength: 8 })}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat new password"
                {...passwordForm.register('new_password2', {
                  required: true,
                  validate: v => v === passwordForm.watch('new_password') || 'Passwords do not match'
                })}
              />
              {passwordForm.formState.errors.new_password2 && (
                <p className="text-danger text-xs mt-1">Passwords do not match</p>
              )}
            </div>
            <div className="glass p-4 rounded-xl border border-primary/20">
              <p className="text-xs text-white/50 font-medium mb-2">Password requirements:</p>
              <ul className="text-xs text-white/40 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Mix of letters and numbers recommended</li>
                <li>• Avoid common passwords</li>
              </ul>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <div className="spinner w-4 h-4 border-2" /> : <Lock size={16} />}
              Change Password
            </button>
          </form>
        </motion.div>
      )}

      {/* Account Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} className="card mt-6">
        <h2 className="font-bold mb-4">Account Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="glass p-3 rounded-xl">
            <p className="text-white/40 text-xs">Account ID</p>
            <p className="font-mono text-xs mt-1 text-white/70">{user?.id?.slice(0, 8)}...</p>
          </div>
          <div className="glass p-3 rounded-xl">
            <p className="text-white/40 text-xs">Member Since</p>
            <p className="text-xs mt-1 text-white/70">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
