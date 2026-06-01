'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { CategoryCollectionGrid, CollectionNode } from '@/components/CategoryCollectionGrid';

const GET_COLLECTIONS_BY_TAG_QUERY = `
  query GetCollectionsByTag($input: CollectionFilterInput!) {
    getCollectionsByTag(input: $input) {
      collections {
        id
        name
        description
        price
        author {
          username
        }
        previewImage {
          filePath
        }
      }
      totalPages
      totalElements
    }
  }
`;

const PAGE_SIZE = 12;

export default function BundleCategoryPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const categorySlug = (params?.category as string) || '';

  const [collections, setCollections] = useState<CollectionNode[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...((session as any)?.accessToken && { "Authorization": `Bearer ${(session as any).accessToken}` })
        },
        body: JSON.stringify({
          query: GET_COLLECTIONS_BY_TAG_QUERY,
          variables: {
            input: {
              tagName: categorySlug, 
              page: page,
              size: PAGE_SIZE
            }
          }
        })
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message || "Query stream execution failure.");

      const data = result.data?.getCollectionsByTag;
      if (data) {
        setCollections(data.collections || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      console.error("CATEGORY_FETCH_ERROR:", err);
      setError(err.message || "Failed to stream directory data.");
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, session]);

  useEffect(() => {
    if (status === "loading") return;
    setCurrentPage(0);
    fetchCollections(0);
  }, [categorySlug, status]); 

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchCollections(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans animate-in fade-in duration-300">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase select-none">
          <Link href="/" className="hover:text-foreground transition-colors">Core</Link>
          <span className="opacity-30">/</span>
          <span className="text-muted-foreground">Bundles</span>
          <span className="opacity-30">/</span>
          <span className="text-primary">{categorySlug}</span>
        </div>

        <header className="border-b border-white/[0.06] pb-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display">
            Directory // {categorySlug}
          </h1>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
            Displaying paginated index mapping matrices.
          </p>
        </header>

        {error && (
          <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive text-xs font-semibold uppercase tracking-wide rounded-none">
            [PIPELINE_ERROR]: {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-5 w-5 text-primary stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Querying database sequence...</span>
          </div>
        ) : (
          <>
            <CategoryCollectionGrid collections={collections} />
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-10 mt-10 border-t border-white/[0.05] select-none">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="h-9 w-9 border border-white/[0.08] bg-[#0d0c0e] hover:bg-accent disabled:opacity-10 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-foreground"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Node <span className="text-foreground">{currentPage + 1}</span> of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="h-9 w-9 border border-white/[0.08] bg-[#0d0c0e] hover:bg-accent disabled:opacity-10 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-foreground"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}