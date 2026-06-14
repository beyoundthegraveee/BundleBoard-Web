"use client"

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryCollectionGrid } from '@/components/CategoryCollectionGrid';
import { useQuery } from '@apollo/client/react';
import { GetCollectionsByTagDocument } from '@/graphql/generated';

const PAGE_SIZE = 12;

export default function BundleCategoryPage() {
  const params = useParams();
  const categorySlug = (params?.category as string) || '';
  const [currentPage, setCurrentPage] = useState(0);

  const { data, loading, error } = useQuery(GetCollectionsByTagDocument, {
    variables: {
      input: {
        tagName: categorySlug,
        page: currentPage,
        size: PAGE_SIZE
      }
    },
    skip: !categorySlug,
    fetchPolicy: 'cache-first' 
  });

  const collections = data?.getCollectionsByTag?.collections || [];
  const totalPages = data?.getCollectionsByTag?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main className="relative min-h-screen text-foreground p-6 md:p-12 font-sans animate-in fade-in duration-300">
      
      {/* Фон с сеткой и темно-фиолетовым свечением */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        {/* Заменили bg-primary на bg-purple-900 и настроили opacity */}
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-purple-900 opacity-40 blur-[120px]"></div>
      </div>

      {/* Обертка контента с relative z-10 */}
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-10">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase select-none">
          <Link href="/" className="hover:text-foreground transition-colors">Core</Link>
          <span className="opacity-30">/</span>
          <span className="text-muted-foreground">Bundles</span>
          <span className="opacity-30">/</span>
          <span className="text-primary">{categorySlug}</span>
        </div>

        <header className="border-b border-border pb-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display">
            Directory // {categorySlug}
          </h1>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
            Displaying paginated index mapping matrices.
          </p>
        </header>

        {error && (
          <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive text-xs font-semibold uppercase tracking-wide rounded-none">
            [PIPELINE_ERROR]: {error.message}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-5 w-5 text-primary stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Querying database sequence...</span>
          </div>
        ) : (
          <>
            <CategoryCollectionGrid collections={collections} />
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-10 mt-10 border-t border-border select-none">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="h-9 w-9 border border-border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-foreground"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Node <span className="text-foreground">{currentPage + 1}</span> of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="h-9 w-9 border border-border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-foreground"
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