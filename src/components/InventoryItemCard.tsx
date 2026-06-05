"use client"

import React, { useState } from 'react'
import { Edit3, Trash2 } from "lucide-react"
import Link from 'next/link'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { EditAssetModal } from './EditAssetModal'

const DELETE_COLLECTION_MUTATION = `
  mutation DeleteCollection($id: ID!, $folderPath: String) {
    deleteCollection(id: $id, folderPath: $folderPath)
  }
`;

const UPDATE_COLLECTION_MUTATION = `
  mutation UpdateCollection($id: ID!, $input: UpdateCollectionInput!) {
    updateCollection(id: $id, input: $input) {
      name
      price
      description
    }
  }
`;

export interface AuthoredCollection {
  id: string;
  name: string;
  price: number;
  description: string;
  previewImage: {
    filePath: string;
  };
}

interface InventoryItemCardProps {
  collection: AuthoredCollection;
  accessToken: string;
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

export function InventoryItemCard({ collection, accessToken, onRefreshNeeded }: InventoryItemCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const processDelete = async () => {
    setIsLoading(true)
    try {
      const folderPath = extractFolderPath(collection.previewImage?.filePath);
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: DELETE_COLLECTION_MUTATION,
          variables: { 
            id: collection.id,
            folderPath: folderPath
          }
        })
      })

      const result = await response.json()
      if (result.errors) throw new Error(result.errors[0].message)

      setIsDeleteOpen(false)
      onRefreshNeeded()
    } catch (err: any) {
      console.error("COLLECTION_DELETE_FAILURE:", err)
      alert(err.message || "Failed to delete asset node.")
    } finally {
      setIsLoading(false)
    }
  }

  const processUpdate = async (name: string, price: number, description: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: UPDATE_COLLECTION_MUTATION,
          variables: {
            id: collection.id,
            input: { name, price, description }
          }
        })
      })

      const result = await response.json()
      if (result.errors) throw new Error(result.errors[0].message)

      setIsEditOpen(false)
      onRefreshNeeded()
    } catch (err: any) {
      console.error("COLLECTION_UPDATE_FAILURE:", err)
      alert(err.message || "Failed to update asset manifest.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Link 
        href={`/collection/${collection.id}`}
        className="group border border-border/40 bg-background p-5 flex flex-col justify-between rounded-none hover:border-white/[0.15] transition-all duration-300 relative min-h-[160px] shadow-sm bg-[#0d0c0e]/40"
      >
        <div className="flex gap-4 items-start w-full">
          <div className="w-16 h-16 border border-border/40 bg-muted flex-shrink-0 overflow-hidden select-none">
            {collection.previewImage?.filePath && (
              <img src={collection.previewImage.filePath} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          
          <div className="overflow-hidden flex-1 space-y-1">
            <div className="flex justify-between items-baseline gap-2">
              <h4 className="font-bold text-sm uppercase truncate text-foreground group-hover:text-primary transition-colors">{collection.name}</h4>
              <span className="text-xs font-bold text-primary font-mono shrink-0">${collection.price.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed opacity-70 font-normal">
              {collection.description || "No registry metadata parameters submitted."}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-between items-center text-[9px] uppercase tracking-wider text-muted-foreground">
          <span className="opacity-40 group-hover:opacity-100 group-hover:text-foreground transition-all">Inspect Node →</span>
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
          previewImage: collection.previewImage?.filePath
        }}
      />
    </>
  )
}