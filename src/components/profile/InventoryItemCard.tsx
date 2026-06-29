"use client"

import React, { useState } from 'react'
import { Edit3, Trash2 } from "lucide-react"
import Link from 'next/link'
import { DeleteConfirmModal } from './asset/DeleteConfirmModal'
import { EditAssetModal } from './asset/EditAssetModal'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { 
  DeleteCollectionDocument, 
  UpdateCollectionDocument 
} from '@/graphql/generated'

export interface GalleryImage {
  filePath: string;
}

export interface AuthoredCollection {
  id: string;
  name: string;
  price: number;
  description: string;
  galleryImages?: GalleryImage[];
  [key: string]: unknown;
}

interface InventoryItemCardProps {
  collection: AuthoredCollection;
  onRefreshNeeded: () => void;
}

const extractFolderPath = (fileUrl: string | undefined): string | null => {
  if (!fileUrl) return null;
  try {
    const url = new URL(fileUrl);
    const pathAfterBucket = url.pathname.split('previews/')[1];
    if (!pathAfterBucket) return null;
    const parts = pathAfterBucket.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function InventoryItemCard({ collection, onRefreshNeeded }: InventoryItemCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  const [executeDelete, { loading: isDeleting }] = useMutation(DeleteCollectionDocument)
  const [executeUpdate, { loading: isUpdating }] = useMutation(UpdateCollectionDocument)

  const isLoading = isDeleting || isUpdating;

  const processDelete = async () => {
    try {
      const folderPath = extractFolderPath(collection.galleryImages?.[0]?.filePath);
      
      await executeDelete({
        variables: { 
          id: collection.id,
          folderPath: folderPath
        }
      })

      setIsDeleteOpen(false)
      onRefreshNeeded()
      toast.success("Asset node successfully destroyed.")
    } catch (err: unknown) {
      console.error("COLLECTION_DELETE_FAILURE:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete asset node."
      toast.error(errorMessage)
    }
  }

  const processUpdate = async (name: string, price: number, description: string, galleryImages: GalleryImage[]) => {
    try {
      await executeUpdate({
        variables: {
          id: collection.id,
          input: { name, price, description, galleryImages }
        }
      })

      setIsEditOpen(false)
      onRefreshNeeded()
      toast.success("Asset manifest updated successfully.")
    } catch (err: unknown) {
      console.error("COLLECTION_UPDATE_FAILURE:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update asset manifest."
      toast.error(errorMessage)
    }
  }

  const cardThumbnail = collection.galleryImages?.[0]?.filePath || "";

  return (
    <>
      <Link 
        href={`/collection/${collection.id}`}
        className="group border border-border/40 bg-background p-5 flex flex-col justify-between rounded-none hover:border-white/[0.15] transition-all duration-300 relative min-h-[160px] shadow-sm bg-[#0d0c0e]/40"
      >
        <div className="flex gap-4 items-start w-full">
          <div className="w-16 h-16 border border-border/40 bg-muted flex-shrink-0 overflow-hidden select-none relative">
            {cardThumbnail && (
              <img 
                src={cardThumbnail} 
                alt={`${collection.name} thumbnail`}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
              />
            )}
          </div>
          
          <div className="overflow-hidden flex-1 space-y-1">
            <div className="flex justify-between items-baseline gap-2">
              <h4 className="font-bold text-sm uppercase truncate text-foreground group-hover:text-primary transition-colors">
                {collection.name}
              </h4>
              <span className="text-xs font-bold text-primary font-mono shrink-0">
                ${collection.price.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed opacity-70 font-normal">
              {collection.description || "No registry metadata parameters submitted."}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-between items-center text-[9px] uppercase tracking-wider text-muted-foreground">
          <span className="opacity-40 group-hover:opacity-100 group-hover:text-foreground transition-all">
            Inspect Node →
          </span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditOpen(true)
                }
              }
              className="p-2 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-all rounded-none"
              title="Edit Node Parameters"
            >
              <Edit3 size={12} />
            </button>
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteOpen(true);
                }}
                className="p-2 border border-destructive/20 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all rounded-none"
                title="Destroy Node"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </Link>

      <DeleteConfirmModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={processDelete}
        collectionName={collection.name}
        isLoading={isLoading}
      />

      <EditAssetModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={processUpdate}
        isLoading={isLoading}
        initialData={{
          id: collection.id,
          name: collection.name,
          price: collection.price,
          description: collection.description,
          galleryImages: collection.galleryImages || []
        }}
      />
    </>
  )
}