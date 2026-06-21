"use client"

import React, { useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Loader2, FolderLock, Download, AlertTriangle, Clock } from 'lucide-react'
import { FALLBACK_IMAGE } from '@/lib/constants'
import { useQuery } from '@apollo/client/react'
import { GetUserProfileDocument } from '@/graphql/generated'
import { toast } from 'sonner'

export default function StashPage() {
  const { status } = useSession()
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null)
  
  const { data, loading, error } = useQuery(GetUserProfileDocument, {
    skip: status !== "authenticated",
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load core vault pipeline.")
    }
  }, [error])

  const userData = data?.getUserProfile
  const purchases = userData?.purchases || []
  const totalAssetsCount = useMemo(() => {
    return purchases.reduce((acc: any, curr: any) => acc + (curr?.items?.length || 0), 0)
  }, [purchases])

  const handleDownload = async (assetId: string, assetName: string) => {
    if (downloadingId) return;
    let toastId: string | number | undefined;

    try {
      setDownloadingId(assetId);
      toastId = toast.loading(`Decrypting ${assetName}...`);

      const response = await fetch(`/api/download/${assetId}`);
      
      if (response.redirected && response.url.includes('/login')) {
        toast.error("[ACCESS_DENIED] Session expired. Please re-authenticate.", { id: toastId });
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to retrieve the encrypted node.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${assetName.replace(/\s+/g, '_')}_asset.zip`; 
      if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
          filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Transfer complete.", { id: toastId });

    } catch (error: any) {
      console.error("Download pipeline error:", error);
      toast.error(error.message || "Critical error during file transfer.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background flex flex-col items-center justify-center p-6">
         <Loader2 className="animate-spin h-6 w-6 text-primary stroke-[1.5]" />
      </main>
    )
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background text-foreground flex flex-col items-center justify-center p-4 md:p-6 font-sans text-center">
        <div className="p-4 border border-destructive/20 text-destructive text-[10px] md:text-xs font-semibold uppercase tracking-wide bg-destructive/5 rounded-none max-w-md w-full">
          [SECURE_ACCESS_DENIED]: Authentication token required.
        </div>
        <Link href="/login" className="mt-4 border border-border/80 px-4 md:px-5 py-2.5 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors">
          Initialize Auth Sequence
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background text-foreground p-4 md:p-12 font-sans animate-in fade-in duration-300">
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-6 md:space-y-10">
        
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-bold tracking-widest text-muted-foreground uppercase select-none">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">Core</Link>
          <span className="opacity-30 shrink-0">/</span>
          <span className="text-muted-foreground shrink-0">Node Control</span>
          <span className="opacity-30 shrink-0">/</span>
          <span className="text-primary flex items-center gap-1 shrink-0">
            <FolderLock size={10} className="text-primary" /> Secure Stash
          </span>
        </div>

        <header className="border-b border-white/[0.06] pb-4 md:pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6">
          <div className="space-y-1.5 md:space-y-2">
            <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase font-display">
              Purchased Core Vault
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider max-w-sm md:max-w-none">
              Isolated directory matrix for commercial usage licenses extraction.
            </p>
          </div>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-muted text-muted-foreground border border-border/40 font-mono shrink-0">
            {totalAssetsCount} Nodes Decrypted
          </span>
        </header>
        
        {totalAssetsCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {purchases.map((purchase: any) => (
              <React.Fragment key={purchase.id}>
                {purchase.items?.map((item: any) => {
                  if (!item.asset) {
                    return (
                      <div key={item.id} className="border border-dashed border-destructive/40 bg-destructive/5 flex flex-col justify-center items-center aspect-video p-4 md:p-6 text-center">
                        <AlertTriangle size={18} className="text-destructive/60 mb-1.5 md:mb-2" />
                        <div className="text-destructive font-bold uppercase tracking-wider text-[9px] md:text-[10px] mb-0.5">Asset Offline</div>
                        <div className="text-muted-foreground text-[7px] md:text-[8px] uppercase tracking-widest">Node destroyed by author</div>
                      </div>
                    )
                  }

                  return (
                    <div key={item.id} className="group border border-border/40 bg-card rounded-none shadow-sm overflow-hidden flex flex-col justify-between relative">
                      <div className="aspect-[4/3] sm:aspect-video border-b border-border/30 overflow-hidden bg-muted relative">
                        <img 
                          src={item.asset.galleryImages?.[0]?.filePath || FALLBACK_IMAGE} 
                          alt={item.asset.name} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                        />
                      </div>
                      
                      <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                        <div className="flex justify-between items-start gap-3 md:gap-4">
                          <span className="font-bold uppercase text-[11px] md:text-xs text-foreground tracking-tight leading-snug line-clamp-2 sm:line-clamp-1">
                            {item.asset.name}
                          </span>
                          
                          <div className={`text-[7px] md:text-[8px] border px-1.5 py-0.5 font-bold uppercase tracking-wider shrink-0 font-mono
                            ${purchase.status === 'succeeded' ? 'bg-primary/10 text-primary border-primary/30' : 
                              purchase.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                              'bg-destructive/10 text-destructive border-destructive/30'}`}>
                            {purchase.status}
                          </div>
                        </div>

                        {purchase.status === 'succeeded' ? (
                          <button 
                            onClick={() => handleDownload(item.asset.id, item.asset.name)}
                            disabled={downloadingId === item.asset.id}
                            className="flex items-center justify-center gap-1.5 md:gap-2 w-full bg-foreground text-background hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-foreground disabled:hover:text-background p-2 md:p-2.5 font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-colors rounded-none"
                          >
                            {downloadingId === item.asset.id ? (
                              <Loader2 size={12} className="shrink-0 animate-spin" />
                            ) : (
                              <Download size={12} className="shrink-0" />
                            )}
                            <span className="truncate">
                              {downloadingId === item.asset.id ? 'Extracting...' : 'Download Asset'}
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 md:gap-2 w-full bg-muted text-muted-foreground p-2 md:p-2.5 font-bold text-[9px] md:text-[10px] uppercase tracking-widest border border-border/50 cursor-not-allowed">
                            <Clock size={12} className={`shrink-0 ${purchase.status === 'pending' ? "animate-pulse text-yellow-500" : ""}`} /> 
                            <span className="truncate">{purchase.status === 'pending' ? 'Awaiting Payment' : 'Payment Failed'}</span>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border/60 p-8 md:p-16 text-center bg-card/20 max-w-xl mx-auto">
            <div className="font-semibold uppercase text-muted-foreground/40 text-[10px] md:text-xs tracking-widest mb-3 md:mb-4">No decryption tokens found</div>
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[9px] md:text-[10px] uppercase border border-border/80 px-4 py-2.5 bg-background hover:bg-accent tracking-wider transition-colors rounded-none">
              Browse Active Catalog
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}