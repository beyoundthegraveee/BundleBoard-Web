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
      title: "Buyer",
      description: "I want to browse and buy high-quality design assets.",
      icon: User,
    },
    {
      id: "author",
      title: "Author",
      description: "I want to sell my digital products and grow my brand.",
      icon: PenTool,
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {roles.map((role) => {
        const isSelected = selected === role.id;
        return (
          <div
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={cn(
              "relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-accent",
              isSelected ? "border-primary bg-primary/5" : "border-muted bg-card"
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
              isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
            )}>
              <role.icon className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold">{role.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {role.description}
            </p>
          </div>
        );
      })}

      <Button 
        className="md:col-span-2 mt-4 h-12 text-lg"
        disabled={!selected || isLoading}
        onClick={() => selected && onSelect(selected)}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Confirm Selection
      </Button>
    </div>
  );
}