"use client"

import React from 'react'
import { MessageSquare, Link as LinkIcon } from "lucide-react"
import { useQuery } from '@apollo/client/react'
import { GetCommentsByUserIdDocument } from '@/graphql/generated' 
import Link from 'next/link'

interface UserCommentsLogProps {
  userId: string;
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function UserCommentsLog({ userId }: UserCommentsLogProps) {
  const { data, loading, error } = useQuery(GetCommentsByUserIdDocument, {
    variables: { userId },
    fetchPolicy: "cache-and-network" 
  });

  const commentsList = data?.getCommentsByUserId || [];

  return (
    <section className="border border-border/60 bg-card p-4 md:p-6 rounded-none shadow-md flex flex-col w-full space-y-4 md:space-y-6 text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-3 md:pb-4">
        <div className="flex items-center gap-2 md:gap-2.5">
          <MessageSquare size={16} className="text-primary stroke-[1.8] md:w-[18px] md:h-[18px]" />
          <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider font-display text-foreground">
            Activity Log
          </h3>
        </div>
      </div>
      
      <div className="space-y-3 md:space-y-4 max-h-[300px] md:max-h-[400px] overflow-y-auto font-mono text-[10px] md:text-[11px] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/60 hover:[&::-webkit-scrollbar-thumb]:bg-border/80 [&::-webkit-scrollbar-thumb]:transition-colors">
        {loading && <div className="text-muted-foreground opacity-70">Loading communication logs...</div>}
        
        {error && <div className="text-destructive opacity-90">Error retrieving logs.</div>}
        
        {!loading && !error && commentsList.length === 0 && (
          <div className="text-muted-foreground opacity-70">No communication logs found for this user.</div>
        )}

        {commentsList.map((c) => (
          <div key={c.id} className="flex gap-2 md:gap-3 border-l-2 border-border/40 pl-2.5 md:pl-3 py-0.5">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex gap-1.5 md:gap-2 items-center flex-wrap">
                <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase opacity-60 font-sans font-medium">
                  {formatTime(c.createdAt)}
                </span>
                
                <span className="text-muted-foreground">on</span>
                
                <Link 
                  href={`/collection/${c.collection.id}`} 
                  className="font-bold text-primary hover:underline flex items-center gap-1 transition-all min-w-0"
                >
                  <LinkIcon size={10} className="shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-xs">{c.collection.name}</span>
                </Link>
              </div>
              
              <p className="text-foreground/90 leading-relaxed break-words bg-background/50 p-2.5 border border-border/30 rounded-none">
                {c.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}