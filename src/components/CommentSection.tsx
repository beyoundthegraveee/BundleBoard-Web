"use client"

import React, { useState } from 'react'
import { Terminal, Send, User } from "lucide-react"

interface CommentsSectionProps {
  targetId: string;
  authorUsername?: string; 
}

export default function CommentsSection({ targetId, authorUsername }: CommentsSectionProps) {
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([
    { id: 1, author: "System", text: "Node initialized. Awaiting transmissions.", time: "System Log" },
    { id: 2, author: "Kiryl Kurzau", text: "Welcome to the asset node pack. Drop a log entry below.", time: "2 hours ago" }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setComments(prev => [...prev, { 
      id: Date.now(), 
      author: "Current User", 
      text: comment, 
      time: "Just now" 
    }])
    setComment("")
  }

  return (
    <section className="border border-border/60 bg-card p-6 rounded-none shadow-md flex flex-col w-full space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <Terminal size={18} className="text-primary stroke-[1.8]" />
          <h3 className="text-xl font-bold uppercase tracking-wider font-display text-foreground">
            Comments
          </h3>
        </div>
      </div>
      
      <div className="space-y-4 max-h-64 overflow-y-auto font-mono text-[11px] pr-2">
        {comments.map((c) => {
          const isCollectionAuthor = authorUsername && c.author.toLowerCase() === authorUsername.toLowerCase();

          return (
            <div key={c.id} className="flex gap-3 border-l-2 border-border/40 pl-3 py-0.5">
              <div className="text-muted-foreground shrink-0 mt-0.5">
                <User size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex gap-2 items-center mb-1 flex-wrap">
                  <span className="font-bold text-foreground">@{c.author}</span>
                  
                  {isCollectionAuthor && (
                    <span className="text-[8px] bg-primary/10 border border-primary/40 px-1.5 py-0.5 text-primary font-extrabold tracking-widest uppercase font-mono scale-95 origin-left">
                      Author
                    </span>
                  )}
                  
                  <span className="text-[9px] text-muted-foreground uppercase opacity-60 font-sans font-medium">
                    {c.time}
                  </span>
                </div>
                <p className="text-muted-foreground/90 leading-relaxed break-words">{c.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="pt-2 flex gap-2 bg-transparent">
        <input 
          type="text" 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter log entry..." 
          className="flex-1 bg-background border border-border/60 p-2.5 text-xs font-mono focus:outline-none focus:border-primary transition-colors text-foreground rounded-none"
        />
        <button 
          type="submit"
          disabled={!comment.trim()}
          className="bg-primary text-primary-foreground px-4.5 py-2.5 flex items-center justify-center hover:opacity-95 transition-opacity rounded-none disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <Send size={13} className="stroke-[1.8]" />
        </button>
      </form>

    </section>
  )
}