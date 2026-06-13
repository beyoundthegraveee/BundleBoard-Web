"use client"

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import { FALLBACK_IMAGE } from '@/lib/constants';
import { useQuery } from '@apollo/client/react';
import { GetTopLikedCollectionsDocument } from '@/graphql/generated';

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";

interface CollectionResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  likesCount: number;
  isLiked: boolean;
  author: {
    username: string;
  };
  galleryImages: {
    filePath: string;
  }[];
}

export function HighestRatedCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const { data, loading, error } = useQuery(GetTopLikedCollectionsDocument, {
    variables: { limit: 5 },
    fetchPolicy: 'cache-first'
  });

  const fetchedCollections = (data?.getTopLikedCollections || []) as CollectionResponse[];

  const carouselItems = fetchedCollections.length > 0 
    ? [...fetchedCollections, ...fetchedCollections, ...fetchedCollections] 
    : [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container || carouselItems.length === 0) return;

    let animationFrameId: number;

    const scroll = () => {
      if (!isHovered && !isDragging) {
        container.scrollLeft += 1;
        const singleSetWidth = container.scrollWidth / 3;
    
        if (container.scrollLeft >= singleSetWidth) {
          container.scrollLeft -= singleSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging, carouselItems.length]);


  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragDistance(0);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; 
    
    setDragDistance(Math.abs(walk)); 
    
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (dragDistance > 10) {
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-muted-foreground font-sans">
        <Loader2 className="animate-spin h-5 w-5 mb-3 text-primary stroke-[1.5]" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Compiling trending nodes...</span>
      </div>
    );
  }

  if (error || fetchedCollections.length === 0) {
    return (
      <div className="w-full text-center py-12 text-[10px] font-bold uppercase tracking-widest text-destructive font-sans">
        [ERROR]: Failed to compile data stream or no nodes available.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div 
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseUpOrLeave();
        }}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        className={`flex overflow-x-auto pb-8 pt-4 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          ::-webkit-scrollbar { display: none; }
        `}} />

        {carouselItems.map((item, index) => {
          const fileName = item.galleryImages?.[0]?.filePath || "";
          const imageUrl = fileName.startsWith('http') 
            ? fileName 
            : fileName ? `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(fileName)}` : "";

          return (
            <Link 
              href={`/collection/${item.id}`} 
              key={`${item.id}-${index}`} 
              onClick={handleLinkClick} 
              draggable={false} 
              className="mr-10 group flex flex-col bg-transparent overflow-hidden text-foreground flex-shrink-0 w-[280px] md:w-[360px]"
            >
              <div className="aspect-[4/3] relative overflow-hidden border border-white/[0.04] bg-[#111013] pointer-events-none">
                <img 
                  src={imageUrl || FALLBACK_IMAGE}
                  alt={item.name}
                  draggable={false}
                  className="object-cover w-full h-full opacity-75 group-hover:opacity-100 transition-all duration-500 block"
                />
                
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2 py-1 border border-white/[0.08] z-10 rounded-none flex items-center gap-1.5 shadow-xl">
                  <Heart size={10} className={item.isLiked ? 'fill-primary text-primary' : 'fill-none text-primary'} />
                  <span className="text-[10px] font-bold tracking-wider">{item.likesCount || 0}</span>
                </div>
                
                {item.price === 0 && (
                  <div className="absolute top-3 left-3 bg-primary/20 backdrop-blur-md px-2 py-1 border border-primary/50 z-10 rounded-none">
                    <span className="text-primary text-[9px] font-bold uppercase tracking-widest">Free</span>
                  </div>
                )}
              </div>

              <div className="pt-5 flex-grow flex flex-col justify-between pointer-events-none">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-baseline gap-4">
                    <h3 className="font-bold text-[17px] md:text-[19px] leading-tight tracking-tight uppercase text-foreground transition-colors group-hover:text-zinc-400 truncate">
                      {item.name}
                    </h3>
                    <span className="font-bold text-[16px] md:text-[18px] text-foreground tracking-tight">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[13px] md:text-[14px] leading-relaxed line-clamp-2 font-normal opacity-80">
                    {item.description || "No description data submitted."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.03] flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider">
                  <div>
                    <span>Author: </span>
                    <span className="font-medium text-foreground">@{item.author?.username || "system"}</span>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 group-hover:text-primary transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 font-semibold text-[12px]">
                    Extract Node →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}