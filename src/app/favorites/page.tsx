"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Loader2, Heart, ShieldAlert } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { CategoryCollectionGrid } from '@/components/CategoryCollectionGrid'
import { useQuery } from '@apollo/client/react'
import { GetLikedCollectionsDocument } from '@/graphql/generated'
import WaveBackground from '@/components/WaveBackground'
import { toast } from 'sonner'

export default function FavoritesPage() {
  const { status } = useSession();
  const { data, loading, error } = useQuery(GetLikedCollectionsDocument, {
    skip: status !== "authenticated",
    fetchPolicy: 'cache-and-network' 
  });

  useEffect(() => {
    if (error) {
      toast.error(`[PIPELINE_ERROR]: ${error.message || "Failed to load preferences sequence"}`);
    }
  }, [error]);

  const likedCollections = data?.getLikedCollections || [];

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
         <Loader2 className="animate-spin h-5 w-5 text-primary stroke-[1.5]" />
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
        <WaveBackground distortion={0.08} speed={0.5} />
        
        <div className="relative z-10 flex flex-col items-center">
          <ShieldAlert size={48} className="text-destructive/50 mb-4" />
          <h1 className="text-xl font-bold uppercase tracking-widest mb-2">Access Denied</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6">
            System requires valid authentication token to access user preferences.
          </p>
          <Link 
            href="/login" 
            className="px-6 py-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Initialize Auth Sequence
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-foreground p-6 md:p-12 font-sans animate-in fade-in duration-300">
      
      <WaveBackground xScale={1.5} yScale={0.4} distortion={0.06} speed={0.8} />

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-10">
        
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase select-none">
          <Link href="/" className="hover:text-foreground transition-colors">Core</Link>
          <span className="opacity-30">/</span>
          <span className="text-muted-foreground">User</span>
          <span className="opacity-30">/</span>
          <span className="text-primary flex items-center gap-1">
            <Heart size={10} className="fill-primary" /> Preferences
          </span>
        </div>
        
        <header className="border-b border-border pb-6 flex justify-between items-end backdrop-blur-sm bg-background/30 p-4 rounded-lg">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display">
              Saved Assets
            </h1>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
              Displaying user-specific liked nodes matrix.
            </p>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:block">
            {likedCollections.length} Nodes Indexed
          </div>
        </header>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-5 w-5 text-primary stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Querying preferences sequence...</span>
          </div>
        ) : (
          <>
            {likedCollections.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-border bg-background/50 backdrop-blur-sm">
                <Heart size={32} className="text-muted-foreground/30 mb-4 stroke-[1]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">No Saved Manifests</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-2">
                  Your preference registry is currently empty.
                </p>
              </div>
            ) : (
              <div className="bg-background/40 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                <CategoryCollectionGrid collections={likedCollections} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}