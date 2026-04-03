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
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <NavigationMenuLink href="/">Home</NavigationMenuLink>
                    </NavigationMenuContent>
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
                        <NavigationMenuLink href="/tutorials">Tutorials</NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>About</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <NavigationMenuLink href="/about">About</NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Contact</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
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