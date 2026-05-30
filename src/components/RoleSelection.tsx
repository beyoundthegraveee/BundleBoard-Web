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
      title: "Buyer Node",
      description: "Access the curation platform to browse and acquire production-grade assets.",
      icon: User,
    },
    {
      id: "author",
      title: "Author Node",
      description: "Deploy digital products, license vector streams, and manage your brand pipeline.",
      icon: PenTool,
    },
  ] as const;

  return (
    <div className="grid gap-6 md:grid-cols-2 font-sans text-foreground">
      {roles.map((role) => {
        const isSelected = selected === role.id;
        return (
          <div
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={cn(
              "relative flex flex-col p-6 rounded-none border border-border/60 bg-card cursor-pointer select-none transition-all duration-200 shadow-md",
              isSelected 
                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                : "hover:border-foreground/40 hover:bg-muted/10"
            )}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 h-5 w-5 rounded-none border border-primary bg-primary flex items-center justify-center text-primary-foreground">
                <Check className="h-3 w-3 stroke-[2.5]" />
              </div>
            )}

            <div className={cn(
              "mb-6 flex h-12 w-12 items-center justify-center rounded-none border border-border/60 transition-colors duration-200",
              isSelected 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-background text-muted-foreground"
            )}>
              <role.icon className="h-5 w-5 stroke-[1.5]" />
            </div>

            <h3 className={cn(
              "text-xl font-bold uppercase tracking-wider transition-colors",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {role.title}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground font-normal mt-2.5">
              {role.description}
            </p>
          </div>
        );
      })}

      <Button 
        className={cn(
          "md:col-span-2 mt-4 rounded-none font-semibold uppercase text-xs tracking-widest py-6 border transition-all duration-200 select-none shadow-sm",
          selected
            ? "bg-primary text-primary-foreground border-primary hover:opacity-90 cursor-pointer"
            : "bg-muted/30 text-muted-foreground/40 border-border/40 cursor-not-allowed"
        )}
        disabled={!selected || isLoading}
        onClick={() => selected && onSelect(selected)}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
            <span>Initializing Protocol</span>
          </div>
        ) : (
          "Confirm Platform Role"
        )}
      </Button>
    </div>
  );
}