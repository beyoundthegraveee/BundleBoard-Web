"use client"

import * as React from "react"
import { useState } from "react"
import { User, PenTool, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface RoleSelectionProps {
  onSelect: (role: "client" | "author") => Promise<void>;
  isLoading?: boolean;
}

export function RoleSelection({ onSelect, isLoading }: RoleSelectionProps) {
  const [selected, setSelected] = useState<"client" | "author" | null>(null);

  const roles = [
    {
      id: "client",
      title: "Buyer_Node",
      description: "LOG_IN_TO_BROWSE_AND_ACQUIRE_HIGH_QUALITY_DESIGN_ASSETS.",
      icon: User,
    },
    {
      id: "author",
      title: "Author_Node",
      description: "LOG_IN_TO_DEPLOY_DIGITAL_PRODUCTS_AND_EXPAND_YOUR_BRAND.",
      icon: PenTool,
    },
  ] as const;

  return (
    <div className="grid gap-6 md:grid-cols-2 font-mono text-black">
      {roles.map((role) => {
        const isSelected = selected === role.id;
        return (
          <div
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={cn(
              "relative flex flex-col p-6 rounded-none border-4 border-black cursor-pointer select-none duration-150 transition-all",
              isSelected 
                ? "bg-zinc-100 translate-x-[4px] translate-y-[4px] shadow-none border-red-600" 
                : "bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 h-6 w-6 rounded-none border-2 border-black bg-red-600 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] animate-pulse">
                <Check className="h-4 w-4 text-white stroke-[4]" />
              </div>
            )}
            
            <div className={cn(
              "mb-6 flex h-14 w-14 items-center justify-center rounded-none border-4 border-black transition-colors duration-150",
              isSelected 
                ? "bg-black text-white" 
                : "bg-zinc-50 text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:bg-zinc-100"
            )}>
              <role.icon className="h-6 w-6 stroke-[2.5]" />
            </div>

            <h3 className={cn(
              "text-2xl font-black uppercase tracking-tighter leading-none transition-colors",
              isSelected ? "text-red-600" : "text-black"
            )}>
              {role.title}
            </h3>
            <p className="text-[10px] leading-relaxed font-bold text-zinc-500 uppercase mt-3 tracking-wide">
              {role.description}
            </p>
          </div>
        );
      })}

      <Button 
        className={cn(
          "md:col-span-2 mt-6 rounded-none font-black uppercase text-sm py-7 border-4 border-black transition-all duration-150 select-none",
          selected
            ? "bg-black text-white shadow-[8px_8px_0px_rgba(239,68,68,1)] hover:bg-zinc-900 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            : "bg-zinc-200 text-zinc-400 border-zinc-400 cursor-not-allowed shadow-none"
        )}
        disabled={!selected || isLoading}
        onClick={() => selected && onSelect(selected)}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-red-600 stroke-[3]" />
            <span>Initializing_Protocol...</span>
          </div>
        ) : (
          "Confirm_Identity_Protocol"
        )}
      </Button>
    </div>
  );
}