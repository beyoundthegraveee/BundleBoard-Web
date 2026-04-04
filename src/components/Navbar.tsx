import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import  Link from "next/link"
import * as React from "react"
import { Button } from "./ui/button"
import { Search, User, ShoppingBag } from "lucide-react"

const components : {title: string, href: string; description: string}[] = [
    {
        title: "Textures",
        href: "/bundles/textures",
        description: "A collection of high-quality textures for your projects."
    },
    {
        title: "Mockups",
        href: "/bundles/mockups",
        description: "A collection of high-quality mockups for your projects."
    },
    {
        title: "Icons",
        href: "/bundles/icons",
        description: "A collection of high-quality icons for your projects."
    },
    {
        title: "Fonts",
        href: "/bundles/fonts",
        description: "A collection of high-quality fonts for your projects."
    },
    {
        title: "Brushes",
        href: "/bundles/brushes",
        description: "A collection of high-quality brushes for your projects."
    },
    {
        title: "Effects",
        href: "/bundles/effects",
        description: "A collection of high-quality effects for your projects."
    }
]

export const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-black/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="container mx-auto flex h-24 items-center justify-between px-6">
                <div className="mr-12 flex items-center">
                    <Link href="/" className="flex items-center gap-3">
                    <img src="/logo.png"
                    alt="BundleBoard Logo"
                    className="h-24 w-24 object-contain"
                    />
                    </Link>
                </div>
                    <div className="flex-1">
                                <NavigationMenu>
                                    <NavigationMenuList>
                                        <NavigationMenuItem>
                                            <NavigationMenuLink>Home</NavigationMenuLink>
                                        </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Bundles</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className = "grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
                                <NavigationMenuTrigger>Tutorials</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className = "w-96 ">
                                        <ListItem href="/watch" title="Videos">
                                            A collection if video tutorials for your projects.
                                        </ListItem>
                                        <ListItem href="/read" title="Articles">
                                            A collection of written tutorials for your projects.
                                        </ListItem>
                                        </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink href="/about">About</NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                 <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex items-center justify-end space-x-4">
                    <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
                        Login
                    </Link>

                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Search className="h-5 w-5" />
                    </Button>

                    <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                        <ShoppingBag className="h-5 w-5"/>
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-black text-[10px] text-white flex items-center justify-center">
                            0
                        </span>
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
}: React.ComponentPropsWithoutRef<"li"> & {href: string}) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="flex flex-col gap-1 test-sm">
                        <div className="leading-none font-medium">{title}</div>
                        <div className="line-clamp-2 test-muted-foreground">{children}</div>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
)}