"use client"

import React, { useState, useRef } from 'react'
import { HardDrive, Shield, Activity, Hash, ChevronLeft, ChevronRight, Images, ShoppingCart } from "lucide-react"

interface GalleryImage {
  id: string;
  fileName: string;
  filePath: string;
  width: number;
  height: number;
  fileSize: number;
}

interface CollectionDetailsProps {
  collection: {
    id: string;
    name: string;
    description: string;
    price: number;
    mediaResource: {
      fileName: string;
      fileSize: number;
      mimeType: string;
      provider: string;
    };
    galleryImages?: GalleryImage[];
  };
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
  const { name, description, price, mediaResource, id, galleryImages = [] } = collection;
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    if (galleryImages.length === 0) return;
    setCurrentSlide((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (galleryImages.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const box = cardRef.current.getBoundingClientRect();
    const x = e.clientX - box.left; 
    const centerX = box.width / 2;
    const angleY = ((x - centerX) / centerX) * 15; 
    setRotateY(angleY);
  };

  const handleMouseLeave = () => {
    setRotateY(0);
  };

  const handleAddToCartClick = () => {
    if (isInCart) return;
    onAddToCart({
      id,
      name,
      price,
      category: mediaResource.mimeType.split('/')[0] || "Asset",
      previewImage: galleryImages[0]?.filePath || "/placeholder.png"
    });
  };

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
            <div className="text-xl font-bold text-foreground">${price.toFixed(2)}</div>
          </div>
          <button 
            onClick={handleAddToCartClick}
            disabled={isInCart}
            className={`flex items-center gap-2 text-primary-foreground font-bold uppercase text-[10px] tracking-widest transition-all py-3 px-5 rounded-none h-full ${
              isInCart 
                ? 'bg-muted text-muted-foreground border border-border/40 cursor-not-allowed' 
                : 'bg-primary hover:opacity-90'
            }`}
          >
            <ShoppingCart size={12} />
            {isInCart ? "In Cart" : "Add to Cart"}
          </button>
        </div>

        <div className="absolute -top-3 right-0 opacity-20 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:block">
          ID // {id.padStart(4, '0')}
        </div>
      </div>

      {galleryImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Images size={13} />
            Visual Payload Manifest ({currentSlide + 1} of {galleryImages.length})
          </div>
          
          <div className="max-w-2xl w-full perspective-[1000px]">
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateY(${rotateY}deg)`,
                transformStyle: 'preserve-3d',
              }}
              className="relative border border-border/60 bg-card aspect-video w-full overflow-hidden rounded-none shadow-xl transition-transform duration-100 ease-out group"
            >
              <img 
                src={galleryImages[currentSlide].filePath} 
                alt={galleryImages[currentSlide].fileName} 
                className="w-full h-full object-cover select-none opacity-95 transition-opacity duration-300"
                style={{ transform: 'translateZ(20px)' }} 
              />
              <div 
                className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-md text-foreground px-3 py-1.5 text-[9px] font-medium uppercase border border-border/40 max-w-[85%] truncate rounded-none tracking-wide"
                style={{ transform: 'translateZ(40px)' }}
              >
                {galleryImages[currentSlide].fileName} • {formatBytes(galleryImages[currentSlide].fileSize)}
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button 
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm border border-border/60 p-2 text-foreground hover:bg-foreground hover:text-background transition-colors rounded-none z-10"
                    style={{ transform: 'translateZ(50px)' }}
                  >
                    <ChevronLeft size={14} strokeWidth={2} />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm border border-border/60 p-2 text-foreground hover:bg-foreground hover:text-background transition-colors rounded-none z-10"
                    style={{ transform: 'translateZ(50px)' }}
                  >
                    <ChevronRight size={14} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-1.5 justify-start pt-1">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-1.5 h-1.5 transition-all border rounded-none ${
                    idx === currentSlide 
                      ? 'bg-foreground border-foreground scale-110' 
                      : 'bg-muted/30 border-border/60 hover:bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Hash size={13} />
          Manifest Description
        </div>
        <div className="bg-muted/10 p-6 border-l-2 border-foreground rounded-none">
          <p className="text-[14px] md:text-[15px] leading-relaxed font-normal text-foreground">
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
          <div className="text-xs font-semibold text-foreground">{mediaResource.mimeType.toUpperCase()}</div>
        </div>

        <div className="border border-border/40 bg-card/40 p-4 flex flex-col gap-1.5 rounded-none">
          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Provider Protocol</div>
          <div className="flex items-center gap-2">
            <Shield size={13} className="text-muted-foreground stroke-[1.5]" />
            <div className="text-xs font-semibold text-foreground">{mediaResource.provider.toUpperCase()}</div>
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