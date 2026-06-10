"use client"

import React from 'react'
import { User, Star, ShoppingCart, Share2, ExternalLink } from "lucide-react"

// 1. ИМПОРТИРУЕМ ТИП ЗАПРОСА ВМЕСТО СХЕМЫ
import { GetCollectionQuery } from '@/graphql/generated'

// 2. ВЫТАСКИВАЕМ ТИП АВТОРА ИЗ СТРУКТУРЫ ОТВЕТА
type AuthorData = GetCollectionQuery['getCollectionById']['author'];

interface AuthorSidebarProps {
  author: AuthorData; 
}

export default function AuthorSidebar({ author }: AuthorSidebarProps) {
  const { 
    username, 
    bio, 
    rating = 0, 
    totalSales = 0, 
    avatarUrl, 
    socialLinks 
  } = author;

  return (
    <div className="border border-border/60 bg-card text-foreground rounded-none shadow-xl font-sans overflow-hidden">
      
      <div className="border-b border-border/40 p-4 flex justify-between items-center bg-muted/20">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Author Profile
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Verified</span>
        </div>
      </div>

      <div className="p-6 space-y-6">

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-background border border-border/40 rounded-none relative overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={username} 
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <User size={28} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              @{username}
            </h3>
            <span className="inline-block text-[9px] font-medium uppercase tracking-widest text-muted-foreground border border-border/60 px-2 py-0.5">
              Studio Partner
            </span>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-muted-foreground font-normal">
          {bio || "No custom bio parameters submitted for this profile matrix."}
        </p>

        <div className="grid grid-cols-2 border border-border/40 bg-background divide-x divide-border/40 rounded-none">
          <div className="p-3 text-center">
            <div className="flex justify-center items-center gap-1.5 text-muted-foreground mb-1">
              <Star size={13} className="text-primary fill-primary/20 stroke-[1.5]" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Rating</span>
            </div>
            <div className="text-lg font-bold tracking-tight text-foreground">{rating?.toFixed(1) || "N/A"}</div>
          </div>
          
          <div className="p-3 text-center">
            <div className="flex justify-center items-center gap-1.5 text-muted-foreground mb-1">
              <ShoppingCart size={13} className="stroke-[1.5]" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Sales</span>
            </div>
            <div className="text-lg font-bold tracking-tight text-foreground">{totalSales?.toString() || "N/A"}</div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Share2 size={13} className="stroke-[1.5]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">External Channels</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {socialLinks && socialLinks.length > 0 ? (
              socialLinks.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link?.url || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex justify-between items-center border border-border/60 p-3 bg-background hover:bg-accent text-foreground transition-all rounded-none"
                >
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {link?.platform}
                  </span>
                  <ExternalLink size={13} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-px transition-all stroke-[1.5]" />
                </a>
              ))
            ) : (
              <div className="text-[10px] text-muted-foreground/60 text-center py-4 border border-dashed border-border/40 rounded-none uppercase tracking-wide">
                No external links submitted
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-muted/30 p-2.5 text-[9px] font-medium uppercase text-center border-t border-border/30 text-muted-foreground/60 tracking-wider">
        Active Node Registry System Verified
      </div>
    </div>
  )
}