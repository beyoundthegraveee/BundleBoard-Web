'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Heart, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { CategoryCollectionGrid, CollectionNode } from '@/components/CategoryCollectionGrid';

const GET_LIKED_COLLECTIONS_QUERY = `
  query GetLikedCollections {
    getLikedCollections {
      id
      name
      description
      price
      author {
        username
      }
      galleryImages {
        filePath
      }
      likesCount
      isLiked
    }
  }
`;

export default function FavoritesPage() {
  const { data: session, status } = useSession();

  const [collections, setCollections] = useState<CollectionNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!session || !(session as any).accessToken) return;

    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any).accessToken}`
        },
        body: JSON.stringify({
          query: GET_LIKED_COLLECTIONS_QUERY
        })
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message || "Query stream execution failure.");

      const data = result.data?.getLikedCollections;
      if (data) {
        // Маппим данные под формат, который ожидает CategoryCollectionGrid
        const mappedCollections = data.map((col: any) => ({
          ...col,
          previewImage: col.galleryImages && col.galleryImages.length > 0 
            ? { filePath: col.galleryImages[0].filePath } 
            : null
        }));

        setCollections(mappedCollections);
      }
    } catch (err: any) {
      console.error("FAVORITES_FETCH_ERROR:", err);
      setError(err.message || "Failed to stream directory data.");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    // Ждем, пока NextAuth проверит сессию
    if (status === "loading") return;
    
    // Если юзер не авторизован, выключаем загрузку (покажем заглушку)
    if (status === "unauthenticated") {
      setIsLoading(false);
      return;
    }

    fetchFavorites();
  }, [status, fetchFavorites]); 

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans">
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans animate-in fade-in duration-300">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase select-none">
          <Link href="/" className="hover:text-foreground transition-colors">Core</Link>
          <span className="opacity-30">/</span>
          <span className="text-muted-foreground">User</span>
          <span className="opacity-30">/</span>
          <span className="text-primary flex items-center gap-1">
            <Heart size={10} className="fill-primary" /> Preferences
          </span>
        </div>
        <header className="border-b border-white/[0.06] pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display">
              Saved Assets
            </h1>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
              Displaying user-specific liked nodes matrix.
            </p>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:block">
            {collections.length} Nodes Indexed
          </div>
        </header>

        {error && (
          <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive text-xs font-semibold uppercase tracking-wide rounded-none">
            [PIPELINE_ERROR]: {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-5 w-5 text-primary stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Querying preferences sequence...</span>
          </div>
        ) : (
          <>
            {collections.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-white/[0.05] bg-white/[0.01]">
                <Heart size={32} className="text-muted-foreground/30 mb-4 stroke-[1]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">No Saved Manifests</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-2">
                  Your preference registry is currently empty.
                </p>
              </div>
            ) : (
              <CategoryCollectionGrid collections={collections} />
            )}
          </>
        )}
      </div>
    </main>
  );
}