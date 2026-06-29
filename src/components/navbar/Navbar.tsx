"use client"

import { ShoppingBagIcon, User, Search, LogOut, Sun, Moon, LogIn, Menu, Heart } from "lucide-react"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import { useAuthActions } from "@/lib/useAuthActions"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { SearchOverlay } from "../SearchOverlay"
import { CartDrawer } from "./CartDrawer"
import { cn } from "@/lib/utils"
import { useQuery } from "@apollo/client/react"
import { GetMeDocument } from "@/graphql/generated"

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
import { useState, useEffect } from "react"

const components = [
  { title: "Brushes", href: "/bundles/brushes", description: "Digital art brushes." },
  { title: "Mockups", href: "/bundles/mockups", description: "Design templates." },
  { title: "Textures", href: "/bundles/textures", description: "Surface details." },
  { title: "Fonts", href: "/bundles/fonts", description: "Selection of typefaces." },
  { title: "Gradients", href: "/bundles/gradients", description: "Color transitions." },
  { title: "Graphics", href: "/bundles/graphics", description: "Graphic elements." },
  { title: "Actions & Effects", href: "/bundles/actions-effects", description: "Professional presets." },
]

export function Navbar() {
  const { data: session, status } = useSession();
  const { terminateSession } = useAuthActions();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { data: meData } = useQuery(GetMeDocument, {
    skip: status !== "authenticated",
    fetchPolicy: 'cache-first'
  });

  const currentUsername = meData?.me?.username || session?.user?.name || "User Node";
  const currentEmail = meData?.me?.email || session?.user?.email || "";

  useEffect(() => {
    setMounted(true);
    const updateCountFromStorage = () => {
      if (typeof window !== "undefined") {
        const items = JSON.parse(localStorage.getItem("bundleboard_cart") || "[]");
        setCartCount(items.length);
      }
    };

    updateCountFromStorage();
    window.addEventListener("cartUpdate", updateCountFromStorage);
    window.addEventListener("cart_updated", updateCountFromStorage);
    return () => {
      window.removeEventListener("cartUpdate", updateCountFromStorage);
      window.removeEventListener("cart_updated", updateCountFromStorage);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 dark:bg-background/80 backdrop-blur-md font-sans transition-colors duration-200">
        <div className="max-w-[1400px] mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          
          <div className="flex w-auto lg:w-[240px] items-center justify-start shrink-0">
            <Link href="/" className="flex items-center gap-2 font-display text-xs sm:text-sm font-bold tracking-[0.25em] text-foreground uppercase transition-opacity hover:opacity-80">
              <img 
                src="/logo.png" 
                alt="BundleBoard" 
                className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-full shadow-sm shrink-0" 
              />
              <div className="flex items-center">
                <span>UNDLE</span>
                <span className="opacity-40 font-normal">BOARD</span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-grow justify-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60 data-[state=open]:bg-accent/40 rounded-none font-medium uppercase text-[11px] tracking-wider transition-colors">
                    Learn
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[320px] gap-0 border border-border/60 bg-popover p-1 rounded-none shadow-xl">
                      <ListItem href="/tutorials" title="Tutorials">Guides for platform assets and software.</ListItem>
                      <ListItem href="/hardware" title="Hardware Setup">Gear recommendations for designers.</ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className="bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60 data-[state=open]:bg-accent/40 rounded-none font-medium uppercase text-[11px] tracking-wider transition-colors cursor-pointer"
                    onClick={() => router.push('/bundles')}
                  >
                    Bundles
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[480px] grid-cols-2 border border-border/60 bg-popover p-1 rounded-none shadow-xl">
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
                        "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-none font-medium uppercase text-[11px] tracking-wider h-auto py-2 px-4 transition-colors"
                      )}
                    >
                      About
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex w-auto lg:w-[240px] items-center justify-end gap-1 sm:gap-1.5 shrink-0">
            
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 border border-border/60 rounded-none text-muted-foreground hover:text-foreground hover:bg-accent items-center justify-center transition-colors relative"
              aria-label="Toggle inversion node"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-4 w-4 stroke-[1.8]" />
                ) : (
                  <Moon className="h-4 w-4 stroke-[1.8]" />
                )
              ) : (
                <div className="h-4 w-4 bg-transparent" />
              )}
            </button>

            <button 
              className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all rounded-none"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4 stroke-[1.8]" />
            </button>
            
            {status === "authenticated" && (
              <Link 
                href="/favorites" 
                className="hidden sm:flex p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all rounded-none relative items-center justify-center"
                aria-label="View favorite collections"
              >
                <Heart className="h-4 w-4 stroke-[1.8]" />
              </Link>
            )}

            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 sm:p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all rounded-none relative"
              aria-label="Open shopping cart drawer"
            >
              <ShoppingBagIcon className="h-4 w-4 stroke-[1.8]" />
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 bg-primary text-primary-foreground text-[9px] font-bold h-3.5 min-w-3.5 px-1 flex items-center justify-center rounded-none tracking-tight">
                {cartCount}
              </span>
            </button>

            {/* Обновленное мобильное меню-бургер */}
            <div className="flex lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-all rounded-none">
                    <Menu className="h-4 w-4 stroke-[1.8]" />
                  </button>
                </DropdownMenuTrigger>
                {/* Добавлен max-h и скролл для маленьких экранов */}
                <DropdownMenuContent className="w-56 max-h-[85vh] overflow-y-auto custom-scrollbar rounded-none border border-border/60 bg-popover p-1 shadow-2xl mt-2" align="end">
                  
                  {/* Секция бандлов */}
                  <div className="px-2.5 py-1.5 text-[9px] font-bold text-primary uppercase tracking-widest mt-1">
                    Directory
                  </div>
                  <DropdownMenuItem asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-bold text-xs p-2.5 cursor-pointer uppercase tracking-wider">
                    <Link href="/bundles">All Bundles</Link>
                  </DropdownMenuItem>
                  
                  {/* Выводим категории циклом со сдвигом (pl-6) */}
                  {components.map((component) => (
                    <DropdownMenuItem key={component.title} asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-[10px] p-2.5 pl-6 cursor-pointer uppercase tracking-wider text-muted-foreground hover:text-foreground">
                      <Link href={component.href}>{component.title}</Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="bg-border/40 my-1" />
                  
                  {/* Секция Learn & About */}
                  <DropdownMenuItem asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-xs p-2.5 cursor-pointer uppercase tracking-wider">
                    <Link href="/tutorials">Tutorials</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-xs p-2.5 cursor-pointer uppercase tracking-wider">
                    <Link href="/hardware">Hardware Setup</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-xs p-2.5 cursor-pointer uppercase tracking-wider">
                    <Link href="/about">About</Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/40 my-1" />
                  
                  {/* Переключатель темы */}
                  <DropdownMenuItem 
                    className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-xs p-2.5 cursor-pointer uppercase tracking-wider flex justify-between items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                  >
                    <span>Theme</span>
                    {mounted ? (theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />) : null}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-8 w-8 sm:h-9 sm:w-9 border border-border/60 rounded-none overflow-hidden hover:bg-accent transition-colors ml-1 sm:ml-0">
                    <div className="flex h-full w-full items-center justify-center bg-background text-muted-foreground hover:text-foreground">
                      <User className="h-4 w-4 stroke-[1.8]" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-none border border-border/60 bg-popover p-1 shadow-2xl animate-in fade-in-50 duration-200 mt-2" align="end">
                  <DropdownMenuLabel className="p-3 bg-muted/50 mb-1 border-b border-border/40">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-[9px] font-bold uppercase text-primary tracking-widest">Active Session</p>
                      <p className="text-xs font-semibold text-foreground truncate uppercase">{currentUsername}</p>
                      <p className="text-[10px] text-muted-foreground truncate font-normal">{currentEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-xs p-2.5 cursor-pointer uppercase tracking-wider">
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-none focus:bg-accent focus:text-accent-foreground font-medium text-xs p-2.5 cursor-pointer uppercase tracking-wider">
                      <Link href="/favorites">Favorites Vault</Link>
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
                    <LogOut className="mr-2 h-3.5 w-3.5 stroke-[1.8]" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all ml-1 sm:ml-4 p-2 sm:p-0"
              >
                <LogIn className="h-4 w-4 stroke-[1.8]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}  
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