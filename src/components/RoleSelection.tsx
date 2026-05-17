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
    <div className="grid gap-6 md:grid-cols-2 font-mono">
      {roles.map((role) => {
        const isSelected = selected === role.id;
        return (
          <div
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={cn(
              "relative flex flex-col p-6 rounded-none border-4 border-black cursor-pointer select-none transition-all",
              isSelected 
                ? "bg-zinc-100 translate-x-[4px] translate-y-[4px] shadow-none" 
                : "bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 h-6 w-6 rounded-none border-2 border-black bg-black flex items-center justify-center shadow-[2px_2px_0px_rgba(239,68,68,1)]">
                <Check className="h-4 w-4 text-white stroke-[4]" />
              </div>
            )}
            
            <div className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-none border-2 border-black transition-colors",
              isSelected ? "bg-black text-white" : "bg-zinc-50 text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            )}>
              <role.icon className="h-5 w-5 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight">{role.title}</h3>
            <p className="text-[10px] leading-relaxed font-bold text-zinc-600 uppercase mt-2">
              {role.description}
            </p>
          </div>
        );
      })}

      <Button 
        className="md:col-span-2 mt-4 bg-black text-white rounded-none font-black uppercase shadow-[6px_6px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all py-6 text-sm"
        disabled={!selected || isLoading}
        onClick={() => selected && onSelect(selected)}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Confirm_Identity_Protocol"
        )}
      </Button>
    </div>
  );
}