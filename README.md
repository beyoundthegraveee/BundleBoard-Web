# BundleBoard — Frontend Web Application

This is the frontend client for the **BundleBoard** web application, built using the Next.js App Router, TypeScript, and Tailwind CSS. It communicates with the Spring Boot backend via GraphQL and integrates with Supabase for storage and authentication services.

---

## 🛠️ Features & Tech Stack

* **Framework:** Next.js (with React Compiler enabled)
* **Language:** TypeScript
* **API Client:** Apollo Client / GraphQL (with automated types via `@graphql-codegen`)
* **UI & Styles:** Tailwind CSS / shadcn/ui
* **Database & Auth Integration:** Supabase Client & NextAuth

---

## 📋 Environment Variables

Before running the application, make sure to configure your environment variables. Create a `.env.local` file in the root directory (you can use `.env.example` as a reference) and populate the following keys:

```env
# API Configuration
NEXT_PUBLIC_API_URL=                  # URL of the Spring Boot GraphQL backend

# Authentication (NextAuth)
NEXTAUTH_SECRET=                      # Secret key for signing NextAuth tokens

# Google OAuth Credentials
GOOGLE_CLIENT_ID=                     # Google Developer Console Client ID
GOOGLE_CLIENT_SECRET=                 # Google Developer Console Client Secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=             # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # Supabase anonymous public API key
NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE=   # Base URL for asset previews
SUPABASE_SERVICE_ROLE_KEY=            # Service role key (keep secret, server-only)
SUPABASE_JWT_SECRET=                  # JWT Secret from Supabase dashboard

# Security & Expiry
JWT_ACCESS_EXPIRY_MS=                 # Access token expiration time in milliseconds

# Upload & File Limits
NEXT_PUBLIC_FALLBACK_IMAGE=           # URL or path for placeholder images
NEXT_PUBLIC_MAX_FILE_SIZE_MB=         # Global max upload size limit
NEXT_PUBLIC_MAX_IMAGE_SIZE_MB=        # Specific max image size limit
```
1. Install Dependencies
Since the heavy node_modules folder is excluded from the disk archive, you need to restore the project dependencies first using the strict package-lock.json file:
```
npm install
```

2. Run the Pre-compiled Production Build (Recommended for Review)
The project comes with a pre-compiled, optimized production build located in the /.next directory. To launch this optimized version instantly without compiling the code again, run:
```
npm run start
```
Open http://localhost:3000 in your browser to view the application

3.Run the Development Server
If you want to view the source code with hot-reloading and making live edits:
```
npm run dev
```

4. GraphQL Code Generation (Optional)
If changes are made to the local .graphql documents or backend schemas, re-generate the TypeScript operations and typed document nodes using:
```
npm run generate
```
Note: This relies on the schema path configured in codegen.ts relative to the backend repository location.
