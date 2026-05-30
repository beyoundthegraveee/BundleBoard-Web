"use client"

import { ShoppingBagIcon, User, Search, LogOut } from "lucide-react"
import * as React from "react"
import Link from "next/link"
import { useAuthActions } from "@/lib/useAuthActions"
import { useSession } from "next-auth/react"
import { SearchOverlay } from "./SearchOverlay"
import { cn } from "@/lib/utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useState } from "react"

const components = [
  { title: "Brushes", href: "/bundles/brushes", description: "Digital art brushes." },
  { title: "Mockups", href: "/bundles/mockups", description: "Design templates." },
  { title: "Textures", href: "/bundles/textures", description: "Surface details." },
  { title: "Fonts", href: "/bundles/fonts", description: "Selection of typefaces." },
  { title: "Gradients", href: "/bundles/gradients", description: "Color transitions." },
  { title: "Graphics", href: "/bundles/graphics", description: "Graphic elements." },
]

export function Navbar() {
  const { data: session, status } = useSession();
  const { terminateSession } = useAuthActions();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md font-sans">
        <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6 md:px-8">
          
          {/* LOGO */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-display text-sm font-bold tracking-[0.25em] text-foreground uppercase transition-opacity hover:opacity-80">
              BUNDLE<span className="opacity-40 font-normal">BOARD</span>
            </Link>
          </div>

          {/* NAVIGATION MENU */}
          <div className="hidden lg:flex flex-grow justify-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent/50 rounded-none font-medium uppercase text-[11px] tracking-wider transition-colors">
                    Learn
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[320px] gap-0 border border-border/60 bg-card p-1 rounded-none shadow-xl">
                      <ListItem href="/tutorials" title="Tutorials">Guides for platform tools.</ListItem>
                      <ListItem href="/tutorials/video" title="Video Streams">Visual asset walk-throughs.</ListItem>
                      <ListItem href="/tutorials/read" title="Documentation">Core integration logs.</ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent/50 rounded-none font-medium uppercase text-[11px] tracking-wider transition-colors">
                    Bundles
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[480px] grid-cols-2 border border-border/60 bg-card p-1 rounded-none shadow-xl">
                      {components.map((component) => (
                        <ListItem key={component.title} title={component.title} href={component.href}>
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link 
                      href="/about" 
                      className={cn(
                        navigationMenuTriggerStyle(), 
                        "bg-transparent hover:bg-accent hover:text-accent-foreground rounded-none font-medium uppercase text-[11px] tracking-wider h-auto py-2 px-4 transition-colors"
                      )}
                    >
                      About
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            
            {/* SEARCH */}
            <button 
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all rounded-none"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* CART */}
            <Link href="/cart" className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all rounded-none relative">
              <ShoppingBagIcon className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] font-bold h-3.5 min-w-3.5 px-1 flex items-center justify-center rounded-none tracking-tight">
                0
              </span>
            </Link>

            {/* USER CONTROLS */}
            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-9 w-9 border border-border/60 rounded-none overflow-hidden hover:bg-accent transition-colors">
                    <div className="flex h-full w-full items-center justify-center bg-card text-muted-foreground hover:text-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-none border border-border/60 bg-card p-1 shadow-2xl" align="end">
                  <DropdownMenuLabel className="p-3 bg-muted/40 mb-1 border-b border-border/40">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-[9px] font-bold uppercase text-primary tracking-widest">Active Session</p>
                      <p className="text-xs font-semibold text-foreground truncate uppercase">{session.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-normal">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-xs p-2.5 cursor-pointer uppercase tracking-wider">
                      <Link href="/profile">Account Node</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-xs p-2.5 cursor-pointer uppercase tracking-wider">
                      <Link href="/settings">Configuration</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-border/40 my-1" />
                  <DropdownMenuItem 
                    className="rounded-none p-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive font-semibold text-xs cursor-pointer uppercase tracking-wider"
                    onClick={terminateSession}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Terminate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                href="/login" 
                className="border border-border/80 hover:border-foreground bg-background text-foreground px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors rounded-none"
              >
                Access Account
              </Link>
            )}
          </div>
        </div>
      </header>
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  )
}

function ListItem({ title, children, href }: { title: string; children: React.ReactNode; href: string }) {
  return (
    <li className="w-full">
      <NavigationMenuLink asChild>
        <Link href={href} className="block p-3 hover:bg-accent text-foreground transition-colors group rounded-none">
          <div className="text-[12px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">{title}</div>
          <div className="text-[11px] text-muted-foreground font-normal leading-tight mt-0.5">{children}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}