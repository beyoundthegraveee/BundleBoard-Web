"use client"

import React, { useState } from 'react'
import { Loader2, User, Upload, Edit2, Check, X, Plus, Trash2, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import { useSupabase } from '@/hooks/useSupabase'
import { useMutation } from "@apollo/client/react"
import { UpdateAvatarDocument, UpdateProfileDetailsDocument, GetUserProfileQuery } from "@/graphql/generated"
import { convertToWebP } from '@/lib/imageProcessor' 
import { ALLOWED_PLATFORMS, validateSocialUrl } from '@/lib/socialLinks'

interface ProfileAvatarProps {
  userData?: GetUserProfileQuery['getUserProfile'] | null; 
  onUpdate: () => void;
}

export function ProfileAvatar({ userData, onUpdate }: ProfileAvatarProps) {
  const supabase = useSupabase()

  const [isUploading, setIsUploading] = useState(false)
  const [executeUpdateAvatar] = useMutation(UpdateAvatarDocument)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bio, setBio] = useState(userData?.bio || "")
  const [socialLinks, setSocialLinks] = useState<{platform: string, url: string}[]>(
    userData?.socialLinks?.map(link => ({ platform: link.platform, url: link.url })) || []
  )
  const [linkErrors, setLinkErrors] = useState<boolean[]>(new Array(socialLinks.length).fill(false))
  const [executeUpdateProfile] = useMutation(UpdateProfileDetailsDocument)

  const handleSaveProfile = async () => {
    const platformIds = socialLinks.map(link => link.platform);
    const hasDuplicates = new Set(platformIds).size !== platformIds.length;

    if (hasDuplicates) {
      toast.error("You cannot add the same platform more than once");
      return;
    }

    const newErrors = socialLinks.map(link => {
      if (!link.url || link.url.trim() === "") return true;
      return !validateSocialUrl(link.platform, link.url);
    });

    setLinkErrors(newErrors);

    if (newErrors.some(err => err)) {
      toast.error("Please check the link format");
      return;
    }

    setIsSaving(true)
    try {
      await executeUpdateProfile({
        variables: {
          bio: bio,
          socialLinks: socialLinks.map(link => ({ platform: link.platform, url: link.url }))
        }
      })
      setIsEditing(false)
      toast.success("Profile configuration updated successfully.");
      onUpdate()
    } catch (err: any) {
      console.error("PROFILE_UPDATE_FAILURE:", err)
      toast.error("Failed to commit profile changes.");
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userData?.id) return

    setIsUploading(true)
    try {
      const processedBlob = await convertToWebP(file, 500, 0.85)
      const fileName = `avatars/${userData.id}-${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from("previews")
        .upload(fileName, processedBlob, { contentType: "image/webp", upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from("previews").getPublicUrl(fileName)
      
      await executeUpdateAvatar({
        variables: { 
          input: { 
            id: userData.id, 
            avatarUrl: publicUrl 
          } 
        }
      })
      
      onUpdate()
    } catch (err: any) {
      console.error("AVATAR_UPLOAD_FAILURE:", err.message || err)
    } finally {
      setIsUploading(false)
    }
  }

  const addSocialLink = () => {
    if (socialLinks.length >= ALLOWED_PLATFORMS.length) return 
    setSocialLinks([...socialLinks, { platform: ALLOWED_PLATFORMS[0].id, url: "" }])
  }

  const updateSocialLink = (index: number, key: 'platform' | 'url', value: string) => {
    const newLinks = [...socialLinks]
    newLinks[index][key] = value
    setSocialLinks(newLinks)
    const newErrors = [...linkErrors]
    newErrors[index] = false
    setLinkErrors(newErrors)
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-8 pt-2 w-full mb-6">
      <div className="flex flex-col gap-3 w-full sm:w-40 shrink-0">
        <div className="relative w-full aspect-square border border-border/80 rounded-none bg-muted overflow-hidden shadow-sm">
          {userData?.avatarUrl ? (
            <img src={userData.avatarUrl} alt="avatar" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
              <User size={48} strokeWidth={1.2} />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          )}
        </div>
        
        <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border/80 bg-background text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:border-primary/50 cursor-pointer transition-all rounded-none shadow-sm shrink-0">
          <Upload size={12} className="stroke-[1.8]" /> 
          {isUploading ? "Syncing..." : "Update Avatar"}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
        </label>
      </div>

      <div className="flex flex-col flex-1 min-w-0 py-0.5 justify-start">
        <div className="mb-4 border-b border-border/30 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight leading-none text-foreground font-display mb-1.5 truncate max-w-xs md:max-w-md block">
            {userData?.username || "Guest Node"}
          </h2>
          <p className="text-[11px] font-medium tracking-tight text-muted-foreground/90 lowercase truncate block max-w-xs md:max-w-md">
            {userData?.email}
          </p>
        </div>

        {!isEditing ? (
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block font-mono">
                Author Description // Bio
              </span>
              <p className="text-sm text-foreground/80 leading-relaxed font-normal whitespace-pre-wrap">
                {userData?.bio || <span className="opacity-40 italic text-xs">No description provided.</span>}
              </p>

              {userData?.socialLinks && userData.socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {userData.socialLinks.map((link, idx) => {
                    const platformDef = ALLOWED_PLATFORMS.find(p => p.id === link.platform)
                    const Icon = platformDef?.icon || LinkIcon
                    return (
                      <a 
                        key={idx} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 border border-border/80 bg-background text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:border-primary/50 transition-all rounded-none"
                      >
                        <Icon size={12} /> {platformDef?.label || link.platform}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-start">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-border/80 bg-background text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:border-primary/50 transition-all rounded-none"
              >
                <Edit2 size={10} /> Edit Identity
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-200 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block font-mono">
                  Update Bio
                </label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short description about your digital studio..."
                  className="w-full h-24 p-3 bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-foreground resize-none rounded-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block font-mono">
                    Social Network Matrix
                  </label>
                  {socialLinks.length < ALLOWED_PLATFORMS.length && (
                    <button 
                      onClick={addSocialLink}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                    >
                      <Plus size={10} /> Add Link
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {socialLinks.length === 0 && (
                    <div className="text-xs text-muted-foreground/50 italic border border-dashed border-border/40 p-3 text-center">
                      No active network links.
                    </div>
                  )}
                  {socialLinks.map((link, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <select 
                        value={link.platform}
                        onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                        className="w-full sm:w-1/3 bg-background border border-border/80 p-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-primary text-foreground rounded-none cursor-pointer"
                      >
                        {ALLOWED_PLATFORMS.map(platform => {
                          const isUsed = socialLinks.some(l => l.platform === platform.id) && link.platform !== platform.id;
                          return (
                            <option key={platform.id} value={platform.id} disabled={isUsed}>
                              {platform.label}
                            </option>
                          );
                        })}
                      </select>
                      
                      <input 
                        type="url"
                        placeholder="https://"
                        value={link.url}
                        onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                        className={`flex-1 bg-background border p-2 text-xs text-foreground outline-none rounded-none transition-all ${
                          linkErrors[idx] 
                            ? "border-destructive ring-1 ring-destructive" 
                            : "border-border/80 focus:border-primary focus:ring-1 focus:ring-primary"
                        }`}
                      />
                      
                      <button 
                        onClick={() => removeSocialLink(idx)}
                        className="p-2 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors flex items-center justify-center rounded-none"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2 justify-start">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-4 py-2 border border-border/80 bg-background text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:border-primary/50 transition-all rounded-none"
              >
                <X size={10} /> Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 border border-primary bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-none disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />} 
                Commit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}