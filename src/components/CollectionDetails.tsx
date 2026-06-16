"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { HardDrive, Shield, Activity, Hash, Images, ShoppingCart } from "lucide-react"
import LikeButton from '@/components/LikeButton'
import { GetCollectionQuery } from '@/graphql/generated'
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";
const PLACEHOLDER_IMG = "https://placehold.net/600x600.png";

const getFullImageUrl = (path: string | undefined) => {
  if (!path) return PLACEHOLDER_IMG;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(path)}`;
};

const TiltCard = ({ src, alt }: { src: string, alt: string }) => {
  return (
    <CardContainer 
      containerClassName="py-0 w-full" 
      className="w-full"
    >
      <CardBody className="relative border border-border/60 bg-card aspect-video w-full h-auto overflow-hidden rounded-none shadow-xl group/card">
        <CardItem 
          translateZ="40" 
          className="w-full h-full"
        >
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover select-none opacity-95 transition-opacity duration-300"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
          />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
};

interface CollectionDetailsProps {
  collection: GetCollectionQuery['getCollectionById'];
  onAddToCart: (item: { id: string; name: string; price: number; category: string; previewImage: string }) => void;
  isInCart?: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 BYTES';
  const k = 1024;
  const sizes = ['BYTES', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function CollectionDetails({ collection, onAddToCart, isInCart = false }: CollectionDetailsProps) {
  const { data: session } = useSession();

  if (!collection) return null;
  const { name, description, price, mediaResource, id, galleryImages, likesCount = 0, isLiked = false, author } = collection;
  
  const [localIsInCart, setLocalIsInCart] = useState(isInCart);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);
  
  const isOwnCollection = session?.user?.name === author.username;

  useEffect(() => {
    setLocalIsInCart(isInCart);
  }, [isInCart]);

  const handleAddToCartClick = () => {
    if (localIsInCart || isOwnCollection) return;
    onAddToCart({
      id,
      name,
      price,
      category: String(mediaResource.mimeType).split('/')[0] || "Asset",
      previewImage: getFullImageUrl(galleryImages?.[0]?.filePath)
    });
    setLocalIsInCart(true);
  };

  const handleLikeToggle = (newIsLiked: boolean) => {
    setLocalLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
  };

  useEffect(() => {
    const checkCartStatus = () => {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('bundleboard_cart')
        if (savedCart) {
          const items = JSON.parse(savedCart)
          setLocalIsInCart(items.some((item: any) => item.id === id))
        } else {
          setLocalIsInCart(false)
        }
      }
    }

    checkCartStatus()
    window.addEventListener('cartUpdate', checkCartStatus)
    return () => {
      window.removeEventListener('cartUpdate', checkCartStatus)
    }
  }, [id])

  return (
    <div className="font-sans text-foreground space-y-10">
      
      <div className="border-b border-border/40 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Activity size={13} className="animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Active Directory Node
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight max-w-2xl">
            {name}
          </h1>
        </div>

        <div className="flex items-center gap-4 border border-border/60 p-2 bg-card/50 rounded-none shrink-0 w-full md:w-auto justify-between md:justify-start">
          <div className="px-3">
            <span className="block text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Asset Value</span>
            <div className="text-xl font-bold text-foreground">
              {price === 0 ? "FREE" : `$${price.toFixed(2)}`}
            </div>
          </div>
          <div className="flex items-center gap-2 h-full w-full md:w-auto">
            <div className="flex items-center h-full">
              <LikeButton 
                collectionId={id} 
                initialLiked={isLiked} 
                onToggle={handleLikeToggle} 
              />
              <div className="flex items-center justify-center h-11 px-3 border border-l-0 border-border/60 bg-muted/5 text-xs font-bold text-foreground min-w-[3rem]">
                {localLikesCount}
              </div>
            </div>
            
            {isOwnCollection ? (
              <button 
                disabled
                className="flex items-center justify-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest transition-all py-3 px-5 rounded-none h-full bg-muted border border-border/40 cursor-not-allowed min-w-[120px]"
              >
                <Shield size={12} />
                Your Asset
              </button>
            ) : (
              <button 
                onClick={handleAddToCartClick}
                disabled={localIsInCart}
                className={`flex items-center justify-center gap-2 text-primary-foreground font-bold uppercase text-[10px] tracking-widest transition-all py-3 px-5 rounded-none h-full min-w-[120px] ${
                  localIsInCart
                    ? 'bg-muted text-muted-foreground border border-border/40 cursor-not-allowed' 
                    : 'bg-primary hover:opacity-90'
                }`}
              >
                <ShoppingCart size={12} />
                {localIsInCart ? "In Cart" : "Add to Cart"}
                <span className="md:hidden ml-auto">
                  {price === 0 ? "FREE" : `$${price.toFixed(2)}`}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute -top-3 right-0 opacity-20 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:block">
          ID // {id.padStart(4, '0')}
        </div>
      </div>

      {galleryImages && galleryImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Images size={13} />
            Visual Payload ({galleryImages.length})
          </div>
          
          <div className="w-full">
            <div className={`grid gap-6 ${galleryImages.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>
              {galleryImages.map((img, index) => (
                <TiltCard 
                  key={index} 
                  src={getFullImageUrl(img?.filePath)} 
                  alt={`${name} - preview ${index + 1}`} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Hash size={13} />
          Manifest Description
        </div>
        <div className="bg-muted/10 p-6 border-l-2 border-foreground rounded-none">
          <p className="text-[14px] md:text-[15px] leading-relaxed font-normal text-foreground whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="border border-border/40 bg-card/40 p-4 flex flex-col gap-1.5 rounded-none">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Filename</div>
          <div className="text-xs font-medium text-foreground truncate">{mediaResource.fileName}</div>
        </div>
        
        <div className="border border-border/40 bg-card/40 p-4 flex flex-col gap-1.5 rounded-none">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Payload Size</div>
          <div className="flex items-center gap-2">
            <HardDrive size={13} className="text-muted-foreground stroke-[1.5]" />
            <div className="text-xs font-semibold text-foreground">{formatBytes(mediaResource.fileSize)}</div>
          </div>
        </div>

        <div className="border border-border/40 bg-card/40 p-4 flex flex-col gap-1.5 rounded-none">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Mime Type</div>
          <div className="text-xs font-semibold text-foreground">{String(mediaResource.mimeType).toUpperCase()}</div>
        </div>

        <div className="border border-border/40 bg-card/40 p-4 flex flex-col gap-1.5 rounded-none">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Provider Protocol</div>
          <div className="flex items-center gap-2">
            <Shield size={13} className="text-muted-foreground stroke-[1.5]" />
            <div className="text-xs font-semibold text-foreground">{String(mediaResource.provider).toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-60 pt-6 flex justify-between border-t border-border/20">
        <span>License: Single User Commercial</span>
        <span>Secure Connection Verified</span>
      </div>
    </div>
  )
}