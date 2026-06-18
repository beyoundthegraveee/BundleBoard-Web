"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const imgDataURI = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M40 20 Q 60 10 70 30 T 60 60 T 30 70 T 20 40 T 40 20'/%3E%3Cpath d='M25 50 C 25 30 45 15 65 25 C 85 35 80 60 60 75 C 40 90 15 70 25 50'/%3E%3Cpath d='M35 35 C 50 20 75 40 65 65 C 55 90 30 75 20 55 C 10 35 30 25 45 40'/%3E%3Cpath d='M50 10 C 80 15 90 45 75 70 C 60 95 25 85 15 60 C 5 35 35 5 50 25'/%3E%3Cpath d='M30 60 Q 40 80 60 70 T 80 40 T 50 20 T 30 60' stroke-width='1.5'/%3E%3Cpath d='M15 30 L 25 35'/%3E%3Cpath d='M75 25 L 85 20'/%3E%3Cpath d='M80 65 L 90 75'/%3E%3Cpath d='M25 80 L 15 85'/%3E%3C/svg%3E";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border border-border/60 bg-card rounded-none shadow-2xl font-sans text-center">
        
        <CardHeader className="space-y-1.5 border-b border-border/40 pb-8 pt-8">
          
          <div className="flex justify-center mb-6 relative">
            <div className="relative block text-center h-[120px] w-[160px] border-b-2 border-border/40 overflow-hidden shrink-0 mx-auto">
              
              <div 
                className="absolute bottom-0 left-1/2 w-12 h-12 -ml-6 mb-2 bg-contain bg-center bg-no-repeat animate-bounce-spin"
                style={{ backgroundImage: `url("${imgDataURI}")` }}
              />
              
              <div className="absolute bottom-[0px] bg-foreground/80 w-[10px] h-[10px] rounded-[20px_20px_0_0] animate-pebbles [animation-delay:0s]" style={{ right: '-20%' }} />
              <div className="absolute bottom-[0px] bg-foreground/80 w-[5px] h-[5px] rounded-[10px_10px_0_0] animate-pebbles [animation-delay:1s]" style={{ right: '-20%' }} />
              <div className="absolute bottom-[0px] bg-foreground/80 w-[3px] h-[3px] rounded-[20px_20px_0_0] animate-pebbles [animation-delay:2s]" style={{ right: '-20%' }} />
            </div>
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-foreground font-display">
            0 results found
          </CardTitle>
          <CardDescription className="font-medium uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground mt-2">
            Error: 404
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-6 p-8">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Sorry! We couldn't find any results. The requested resource is currently unreachable.
          </p>

          <Button 
            asChild 
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold uppercase text-xs tracking-widest rounded-none py-6 transition-opacity"
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to primary node
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}