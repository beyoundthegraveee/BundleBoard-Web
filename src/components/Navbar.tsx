"use client"

import { ShoppingBagIcon, User, Search, Heart } from "lucide-react"
import { Button } from "./ui/button"
import * as React from "react"
import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Brushes",
    href: "/bundles/brushes",
    description:
      "A set of brushes for drawing and painting in digital art applications.",
  },
  {
    title: "Mockups",
    href: "/bundles/mockups",
    description:
      "Pre-designed templates for various design elements.",
  },
  {
    title: "Textures",
    href: "/bundles/textures",
    description:
      "A collection of surface details for adding texture to digital art.",
  },
  {
    title: "Fonts",
    href: "/bundles/fonts",
    description: "A selection of typefaces for various design projects.",
  },
  {
    title: "Illustrations",
    href: "/bundles/illustrations",
    description:
      "A library of pre-made illustrations for use in design projects.",
  },
  {
    title: "Graphics",
    href: "/bundles/graphics",
    description:
      "A collection of graphic elements for use in design projects.",
  },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        
        <div className="flex items-center  gap-2 ml-4">
          <Link href="/" className="font-bold text-xl tracking-tighter">
            BUNDLEBOARD
          </Link>
        </div>
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-5">
              <NavigationMenuItem>
                <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-2">
                    <ListItem href="/tutorials" title="Tutorials">
                        Step-by-step guides to help you get started with BundleBoard.
                    </ListItem>
                    <ListItem href="/tutorials/video" title="Video Player">
                        A video player for watching tutorials and other video content related to BundleBoard.
                    </ListItem>
                    <ListItem href="/tutorials/read" title="Read Articles">
                        A collection of articles and documentation to help you learn more about BundleBoard and its features.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Bundles</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-7 w-7" />
          </Button>
          <Button variant="ghost" size="icon" className="relative text-muted-foreground" asChild>
            <Link href="/cart">
              <ShoppingBagIcon className="h-5 w-5" />

            </Link>
          </Button>

          <Button variant="default" size="sm" className="hidden sm:flex ml-2">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>

      </div>
    </header>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="flex flex-col gap-1 text-sm">
            <div className="leading-none font-medium">{title}</div>
            <div className="line-clamp-2 text-muted-foreground">{children}</div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
