"use client"
import React, { useState } from 'react'
import { Terminal, Send, User } from "lucide-react"

export default function CommentsSection({ targetId }: { targetId: string }) {
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([
    { id: 1, author: "System", text: "Node initialized. Awaiting transmissions.", time: "System Log" }
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
    <section className="border border-border/40 bg-card rounded-none shadow-sm flex flex-col">
      <div className="flex items-center gap-2 border-b border-border/40 p-4 bg-muted/20">
        <Terminal size={14} className="text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Comments</h3>
      </div>
      
      <div className="p-4 space-y-4 max-h-64 overflow-y-auto font-mono text-[11px]">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 border-l-2 border-border/40 pl-3">
            <div className="text-muted-foreground shrink-0 mt-0.5"><User size={12} /></div>
            <div>
              <div className="flex gap-2 items-baseline mb-1">
                <span className="font-bold text-foreground">{c.author}</span>
                <span className="text-[9px] text-muted-foreground uppercase opacity-60">{c.time}</span>
              </div>
              <p className="text-muted-foreground/90">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border/40 p-3 flex gap-2 bg-background">
        <input 
          type="text" 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter log entry..." 
          className="flex-1 bg-transparent border border-border/60 p-2 text-xs font-mono focus:outline-none focus:border-primary transition-colors"
        />
        <button 
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Send size={14} />
        </button>
      </form>
    </section>
  )
}