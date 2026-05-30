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
      <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white font-mono">
        <div className="container flex h-20 items-center px-4 md:px-8">
          
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-2xl tracking-tighter uppercase hover:bg-black hover:text-white px-2 transition-colors">
              BUNDLEBOARD
            </Link>
          </div>

          <div className="hidden lg:flex flex-grow justify-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent border-2 border-transparent hover:border-black rounded-none font-bold uppercase text-xs tracking-widest">
                    Learn
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-0 border-4 border-black bg-white p-0 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                      <ListItem href="/tutorials" title="Tutorials">Guides for Node_Access.</ListItem>
                      <ListItem href="/tutorials/video" title="Video Player">Visual data_streams.</ListItem>
                      <ListItem href="/tutorials/read" title="Read Articles">Documentation_logs.</ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent border-2 border-transparent hover:border-black rounded-none font-bold uppercase text-xs tracking-widest">
                    Bundles
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] grid-cols-2 border-4 border-black bg-white p-0 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
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
                        "bg-transparent hover:bg-black hover:text-white rounded-none font-bold uppercase text-xs tracking-widest h-auto py-2"
                      )}
                    >
                      About
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button 
              className="p-2 border-2 border-transparent hover:border-black transition-all"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-6 w-6 stroke-[2.5]" />
            </button>

            <Link href="/cart" className="p-2 border-2 border-transparent hover:border-black transition-all relative">
              <ShoppingBagIcon className="h-6 w-6 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1 font-bold">0</span>
            </Link>

            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-10 w-10 border-2 border-black overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                      <User className="h-6 w-6 stroke-[2]" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-none border-4 border-black bg-white p-0 shadow-[8px_8px_0px_rgba(0,0,0,1)]" align="end">
                  <DropdownMenuLabel className="p-4 border-b-2 border-black bg-zinc-50">
                    <div className="flex flex-col space-y-1">
                      <p className="text-[10px] font-bold uppercase text-red-600 tracking-tighter">User_Session_Active</p>
                      <p className="text-sm font-bold uppercase truncate">{session.user?.name}</p>
                      <p className="text-[9px] font-medium opacity-50 truncate uppercase">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuGroup className="p-2">
                    <DropdownMenuItem asChild className="rounded-none hover:bg-black hover:text-white focus:bg-black focus:text-white font-bold uppercase text-xs p-3 cursor-pointer">
                      <Link href="/profile">Profile_Data</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-none hover:bg-black hover:text-white focus:bg-black focus:text-white font-bold uppercase text-xs p-3 cursor-pointer">
                      <Link href="/settings">System_Config</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-black h-0.5" />
                  <DropdownMenuItem 
                    className="rounded-none p-4 text-red-600 focus:bg-red-600 focus:text-white font-bold uppercase text-xs cursor-pointer"
                    onClick={terminateSession}
                  >
                    <LogOut className="mr-2 h-4 w-4 stroke-[2.5]" />
                    Terminate_Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                href="/login" 
                className="border-2 border-black px-4 py-2 text-xs font-bold uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Access_Node
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
    <li className="border-b-2 border-black last:border-b-0">
      <NavigationMenuLink asChild>
        <Link href={href} className="block p-4 hover:bg-zinc-100 transition-colors group">
          <div className="text-xs font-bold uppercase mb-1 group-hover:text-red-600">{title}</div>
          <div className="text-[10px] font-medium leading-tight text-zinc-500 uppercase">{children}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}