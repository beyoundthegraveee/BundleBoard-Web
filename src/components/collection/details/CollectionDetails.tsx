"use client"

import React, { useState, useEffect } from 'react'
import Image from "next/image"
import { HardDrive, Shield, Activity, Hash, Images, ShoppingCart, ExternalLink, Link as LinkIcon, X, Maximize2 } from "lucide-react"
import LikeButton from '@/components/navbar/components/LikeButton'
import { GetCollectionQuery } from '@/graphql/generated'
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import BmacBanner from '../../banner/BmacBanner'

const SUPABASE_PREVIEWS_BASE = process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE || "";
const PLACEHOLDER_IMG = "https://placehold.net/600x600.png";

const getFullImageUrl = (path: string | undefined) => {
  if (!path) return PLACEHOLDER_IMG;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_PREVIEWS_BASE}/${encodeURIComponent(path)}`;
};

const TiltCard = ({ src, alt, onClick }: { src: string, alt: string, onClick?: () => void }) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [imgSrc, setImgSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(src);
  }

  return (
    <CardContainer containerClassName="py-0 w-full" className="w-full">
      <CardBody className="relative border border-border/60 bg-muted/5 w-full h-auto overflow-hidden rounded-none shadow-xl">
        <CardItem 
          translateZ="40" 
          className="w-full h-full flex justify-center items-center relative group/zoom cursor-zoom-in"
          onClick={onClick}
        >
          <Image 
            src={imgSrc} 
            alt={alt} 
            width={1200}
            height={800}
            unoptimized
            className="w-full h-auto max-h-[60vh] md:max-h-[75vh] object-contain select-none opacity-95 transition-opacity duration-300"
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
          />
          <div className="absolute inset-0 bg-background/0 group-hover/zoom:bg-background/20 transition-colors duration-300 flex items-center justify-center">
            <Maximize2 className="text-white opacity-0 group-hover/zoom:opacity-100 transition-opacity duration-300 drop-shadow-xl" size={48} strokeWidth={1.5} />
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
};

const ThumbnailImage = ({ src, alt }: { src: string, alt: string }) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [imgSrc, setImgSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(src);
  }

  return (
    <Image 
      src={imgSrc} 
      alt={alt} 
      width={112}
      height={112}
      unoptimized
      className="w-full h-full object-cover"
      onError={() => setImgSrc(PLACEHOLDER_IMG)}
    />
  );
};

interface CollectionDetailsProps {
  collection: GetCollectionQuery['getCollectionById'];
  onAddToCart: (item: { id: string; name: string; price: number; category: string; previewImage: string; ownerId: string }) => void;
  isInCart?: boolean;
  isOwner?: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 BYTES';
  const k = 1024;
  const sizes = ['BYTES', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function CollectionDetails({ collection, onAddToCart, isInCart = false, isOwner = false }: CollectionDetailsProps) {
  const [localIsInCart, setLocalIsInCart] = useState(isInCart);
  const [localLikesCount, setLocalLikesCount] = useState(collection?.likesCount ?? 0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalIsInCart(isInCart);
    }, 0);
    return () => clearTimeout(timer);
  }, [isInCart]);

  useEffect(() => {
    if (isZoomModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isZoomModalOpen]);

  const collectionId = collection?.id;
  useEffect(() => {
    if (!collectionId) return;

    const checkCartStatus = () => {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('bundleboard_cart')
        if (savedCart) {
          const items = JSON.parse(savedCart)
          setLocalIsInCart(items.some((item: { id: string }) => item.id === collectionId))
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
  }, [collectionId])

  if (!collection) return null;

  const { name, description, price, mediaResource, externalLink, id, galleryImages, isLiked = false } = collection;
  const isOwnCollection = isOwner; 
  const isExternal = !!externalLink;

  const handleAddToCartClick = () => {
    if (localIsInCart || isOwnCollection || isExternal) return;
    onAddToCart({
      id,
      name,
      price,
      category: mediaResource?.mimeType ? String(mediaResource.mimeType).split('/')[0] : "Asset",
      previewImage: getFullImageUrl(galleryImages?.[0]?.filePath),
      ownerId: collection.author?.userId ? String(collection.author.userId) : "",
    });
    setLocalIsInCart(true);
  };

  const handleLikeToggle = (newIsLiked: boolean) => {
    setLocalLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
  };

  return (
    <>
      <div className="font-sans text-foreground space-y-10">
        <div className="border-b border-border/40 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Activity size={13} className="animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                {isExternal ? 'External Network ' : 'Active Directory '}
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
              
              {isExternal ? (
                <a 
                  href={externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-primary-foreground font-bold uppercase text-[10px] tracking-widest transition-all py-3 px-5 rounded-none h-full min-w-[120px] bg-primary hover:opacity-90"
                >
                  <ExternalLink size={12} />
                  Get Original Asset
                  <span className="md:hidden ml-auto">FREE</span>
                </a>
              ) : isOwnCollection ? (
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
            ID // {String(id).padStart(4, '0')}
          </div>
        </div>

        {galleryImages && galleryImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Images size={13} />
              Visual Payload ({galleryImages.length})
            </div>
            
            <div className="w-full flex flex-col gap-4">
              <div className="w-full">
                <TiltCard 
                  src={getFullImageUrl(galleryImages[activeImageIdx]?.filePath)} 
                  alt={`${name} - preview`} 
                  onClick={() => setIsZoomModalOpen(true)}
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                  {galleryImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIdx(index)}
                      className={`relative shrink-0 w-20 h-20 md:w-28 md:h-28 border-2 transition-all duration-300 snap-center rounded-none overflow-hidden ${
                        index === activeImageIdx 
                          ? 'border-primary opacity-100 scale-[1.02] shadow-lg' 
                          : 'border-transparent opacity-50 hover:opacity-100 hover:border-border/60'
                      }`}
                    >
                      <ThumbnailImage 
                        src={getFullImageUrl(img?.filePath)} 
                        alt={`Thumbnail ${index + 1}`} 
                      />
                    </button>
                  ))}
                </div>
              )}
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

        <BmacBanner/>

        {isExternal ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="border border-border/40 bg-card/40 p-4 flex flex-col gap-1.5 rounded-none">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Distribution Hub</div>
              <div className="text-xs font-medium text-foreground truncate">External Author</div>
            </div>
            
            <div className="border border-border/40 bg-card/40 p-4 flex flex-col gap-1.5 rounded-none">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Access Protocol</div>
              <div className="flex items-center gap-2">
                <LinkIcon size={13} className="text-muted-foreground stroke-[1.5] shrink-0" />
                <a 
                  href={externalLink || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline truncate"
                  title={externalLink || ''}
                >
                  {externalLink || "Secure Redirect Link"}
                </a>
              </div>
            </div>
          </div>
        ) : mediaResource ? (
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
        ) : null}

        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-60 pt-6 flex justify-between border-t border-border/20">
          <span>License: {isExternal ? "Author Original License" : "Single User Commercial"}</span>
          <span>Secure Connection Verified</span>
        </div>
      </div>

      {isZoomModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 cursor-zoom-out animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-card border border-border/50 text-foreground hover:text-primary transition-colors rounded-none shadow-2xl z-50"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomModalOpen(false);
            }}
          >
            <X size={24} strokeWidth={1.5} />
          </button>
          
          <Image 
            src={getFullImageUrl(galleryImages?.[activeImageIdx]?.filePath)} 
            alt="Fullscreen preview" 
            width={1920}
            height={1080}
            unoptimized
            className="max-w-full max-h-full object-contain drop-shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}