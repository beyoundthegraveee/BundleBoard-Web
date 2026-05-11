"use client"

import React from 'react'
import { HardDrive, FileDigit, Shield, Activity, Hash } from "lucide-react"

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
  }
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0_BYTES';
  const k = 1024;
  const sizes = ['BYTES', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + '_' + sizes[i];
};

export default function CollectionDetails({ collection }: CollectionDetailsProps) {
  const { name, description, price, mediaResource, id } = collection;

  return (
    <div className="font-mono text-black space-y-8">
      {/* HEADER_BLOCK */}
      <div className="border-b-4 border-black pb-6 relative">
        <div className="flex items-center gap-2 mb-2 text-red-600">
          <Activity size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Active_Directory_Node</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none break-words">
          {name}
        </h1>
        <div className="absolute top-0 right-0 opacity-10 text-4xl font-black">
          #{id.padStart(4, '0')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-black border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <div className="md:col-span-4 bg-white p-6 flex flex-col justify-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Asset_Value</span>
          <div className="text-5xl font-black italic tracking-tighter">${price}</div>
        </div>
        <div className="md:col-span-8 bg-black p-1 flex">
          <button className="w-full bg-red-600 hover:bg-white hover:text-black text-white font-black uppercase text-2xl transition-all duration-300 py-6 md:py-0">
            [ INITIALIZE_TRANSFER ]
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <Hash size={12} className="text-red-600" />
          Manifest_Description
        </div>
        <div className="bg-zinc-100 p-8 border-l-8 border-black">
          <p className="text-xl md:text-2xl font-bold uppercase leading-tight italic">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div className="border-2 border-black p-4 flex flex-col gap-2">
          <div className="text-[9px] font-black opacity-40 uppercase">Filename</div>
          <div className="text-xs font-black truncate">{mediaResource.fileName}</div>
        </div>
        
        <div className="border-2 border-black p-4 flex flex-col gap-2">
          <div className="text-[9px] font-black opacity-40 uppercase">Payload_Size</div>
          <div className="flex items-center gap-2">
            <HardDrive size={14} className="text-red-600" />
            <div className="text-sm font-black italic">{formatBytes(mediaResource.fileSize)}</div>
          </div>
        </div>

        <div className="border-2 border-black p-4 flex flex-col gap-2">
          <div className="text-[9px] font-black opacity-40 uppercase">Mime_Type</div>
          <div className="text-sm font-black">{mediaResource.mimeType.toUpperCase()}</div>
        </div>

        <div className="border-2 border-black p-4 flex flex-col gap-2">
          <div className="text-[9px] font-black opacity-40 uppercase">Provider_Protocol</div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-green-600" />
            <div className="text-sm font-black italic">{mediaResource.provider.toUpperCase()}</div>
          </div>
        </div>
      </div>
      <div className="text-[10px] font-black uppercase opacity-20 pt-10 flex justify-between">
        <span>License: Single_User_Commercial</span>
        <span>Secure_Connection_Verified</span>
      </div>
    </div>
  )
}