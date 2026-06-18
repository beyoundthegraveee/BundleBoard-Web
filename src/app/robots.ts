import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/$",
        "/about",
        "/bundles", 
        "/terms"
      ],
      disallow: [
        "/login",
        "/register",
        "/forgot-password",
        "/password/",
        "/mail/",
        "/select-role",
        "/settings",
        "/profile",
        "/favorites",
        "/stash",
        "/api/"
      ],
    },
    sitemap: "https://bundleboard.com/sitemap.xml",
  };
}