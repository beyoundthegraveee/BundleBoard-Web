"use client"

import React, { useState } from 'react'
import { HardDrive, Shield, Activity, Hash, ChevronLeft, ChevronRight, Images } from "lucide-react"

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
  }
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 BYTES';
  const k = 1024;
  const sizes = ['BYTES', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function CollectionDetails({ collection }: CollectionDetailsProps) {
  const { name, description, price, mediaResource, id, galleryImages = [] } = collection;
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (galleryImages.length === 0) return;
    setCurrentSlide((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (galleryImages.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  return (
    <div className="font-sans text-foreground space-y-10">
      
      <div className="border-b border-border/40 pb-6 relative">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <Activity size={13} className="animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Active Directory Node
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight max-w-4xl">
          {name}
        </h1>
        <div className="absolute top-0 right-0 opacity-20 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          ID // {id.padStart(4, '0')}
        </div>
      </div>

      {galleryImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Images size={13} />
            Visual Payload Manifest ({currentSlide + 1} of {galleryImages.length})
          </div>
          
          <div className="relative border border-border/40 bg-card aspect-video w-full overflow-hidden rounded-none group">
            <img 
              src={galleryImages[currentSlide].filePath} 
              alt={galleryImages[currentSlide].fileName} 
              className="w-full h-full object-cover select-none opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />

            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-md text-foreground px-3 py-2 text-[10px] font-medium uppercase border border-border/40 max-w-[85%] truncate rounded-none tracking-wide">
              {galleryImages[currentSlide].fileName} • {galleryImages[currentSlide].width}×{galleryImages[currentSlide].height} • {formatBytes(galleryImages[currentSlide].fileSize)}
            </div>

            {galleryImages.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border/60 p-2.5 text-foreground hover:bg-foreground hover:text-background transition-colors rounded-none"
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border/60 p-2.5 text-foreground hover:bg-foreground hover:text-background transition-colors rounded-none"
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-2 justify-start pt-1">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 transition-all border rounded-none ${
                    idx === currentSlide 
                      ? 'bg-foreground border-foreground scale-105' 
                      : 'bg-muted/30 border-border/60 hover:bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 border border-border/40 rounded-none overflow-hidden bg-card shadow-md">
        <div className="md:col-span-4 p-6 flex flex-col justify-center bg-muted/10 border-b md:border-b-0 md:border-r border-border/40">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Asset Value</span>
          <div className="text-4xl font-bold tracking-tight text-foreground">${price.toFixed(2)}</div>
        </div>
        <div className="md:col-span-8 flex">
          <button className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase text-sm tracking-widest transition-opacity py-5 rounded-none">
            Purchase Collection Asset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Hash size={13} />
          Manifest Description
        </div>
        <div className="bg-muted/10 p-6 border-l-2 border-foreground rounded-none">
          <p className="text-[15px] md:text-[16px] leading-relaxed font-normal text-foreground">
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