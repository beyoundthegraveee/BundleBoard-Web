"use client"

import React from 'react'
import { User, Star, ShoppingCart, Share2, ExternalLink } from "lucide-react"

interface SocialLink {
  platform: string;
  url: string;
}

interface AuthorSidebarProps {
  author: {
    username: string;
    bio: string;
    rating: number;
    totalSales: number;
    avatarUrl?: string;
    socialLinks: SocialLink[];
  }
}

export default function AuthorSidebar({ author }: AuthorSidebarProps) {
  const { username, bio, rating, totalSales, avatarUrl, socialLinks } = author;

  return (
    <div className="border-2 border-black p-1 bg-white font-mono shadow-[8px_8px_0px_rgba(0,0,0,1)]">
      <div className="bg-black text-white p-3 flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operator_Profile_v4</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-zinc-600 rounded-full" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-zinc-100 border-2 border-black relative overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={40} strokeWidth={1} />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
              @{username}
            </h3>
            <div className="mt-2 inline-block bg-black text-white text-[8px] px-2 py-0.5 font-black uppercase tracking-widest">
              Verified_Author
            </div>
          </div>
        </div>

        <div className="text-[11px] font-bold uppercase leading-tight text-zinc-500 italic border-l-2 border-zinc-200 pl-4">
          // {bio}
        </div>

        <div className="grid grid-cols-2 gap-px bg-black border border-black text-center">
          <div className="bg-white p-3">
            <div className="flex justify-center items-center gap-1 text-red-600 mb-1">
              <Star size={12} fill="currentColor" />
              <span className="text-[9px] font-black uppercase">Rating</span>
            </div>
            <div className="text-xl font-black">{rating.toFixed(1)}</div>
          </div>
          <div className="bg-white p-3">
            <div className="flex justify-center items-center gap-1 text-zinc-400 mb-1">
              <ShoppingCart size={12} />
              <span className="text-[9px] font-black uppercase">Sales</span>
            </div>
            <div className="text-xl font-black">{totalSales}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Share2 size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">External_Channels</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {socialLinks && socialLinks.length > 0 ? (
              socialLinks.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex justify-between items-center border-2 border-black p-3 hover:bg-black hover:text-white transition-all"
                >
                  <span className="text-xs font-black uppercase tracking-tighter italic">
                    [{link.platform}]
                  </span>
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))
            ) : (
              <div className="text-[10px] opacity-30 italic uppercase p-2 border border-dashed border-black">
                No_Social_Nodes_Detected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-zinc-100 p-2 text-[8px] font-black uppercase text-center border-t border-black opacity-50">
        System_Status: Online // Last_Activity: Stable
      </div>
    </div>
  )
}