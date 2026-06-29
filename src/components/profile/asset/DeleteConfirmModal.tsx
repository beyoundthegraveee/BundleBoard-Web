"use client"

import React from 'react'
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  collectionName: string;
  isLoading: boolean;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, collectionName, isLoading }: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-card border border-destructive/30 w-full max-w-sm p-6 relative rounded-none shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center gap-3 text-destructive border-b border-destructive/10 pb-3 mb-4">
          <AlertTriangle size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Registry Destruction</h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          You are initializing a purge sequence on asset node <span className="text-foreground font-semibold">"{collectionName}"</span>. This routine will permanently unlink files from database matrices.
        </p>

        <div className="mt-6 flex justify-end gap-3 select-none">
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-border/80 text-foreground bg-background hover:bg-accent text-[10px] font-bold uppercase tracking-wider rounded-none transition-colors disabled:opacity-50"
          >
            Abort
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-destructive text-destructive-foreground hover:opacity-90 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center gap-1.5 transition-opacity disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin h-3 w-3" /> : "Purge Core"}
          </button>
        </div>

      </div>
    </div>
  )
}