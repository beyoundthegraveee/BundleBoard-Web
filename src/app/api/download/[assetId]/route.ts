import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { VerifyAssetPurchaseDocument } from '@/graphql/generated'
import { authOptions } from "@/lib/NextAuthOptions" 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createSupabaseClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params
    const session: any = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return new NextResponse("[SECURE_ACCESS_DENIED]: Unauthorized or missing token", { status: 401 })
    }

    const apolloClient = new ApolloClient({
      link: new HttpLink({
        uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/graphql',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }),
      cache: new InMemoryCache(),
      ssrMode: true,
    })

    const { data, error } = await apolloClient.query({
      query: VerifyAssetPurchaseDocument,
      variables: { assetId },
      fetchPolicy: 'no-cache' 
    })

    if (error || !data?.getPurchaseByAsset) {
      console.error("GraphQL Error:", error)
      return new NextResponse("[ACCESS_DENIED]: Pipeline error", { status: 403 })
    }

    const verification = data.getPurchaseByAsset

    if (verification.status !== 'succeeded') {
      return new NextResponse(`[PAYMENT_INCOMPLETE]: Purchase status is ${verification.status}`, { status: 402 })
    }

    const filePath = verification.assetPath

    if (!filePath) {
      return new NextResponse("[PIPELINE_ERROR]: Decryption path missing", { status: 404 })
    }

    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('vault') 
      .createSignedUrl(filePath, 60, {
        download: true,
      })

    if (storageError || !storageData?.signedUrl) {
      console.error("Vault Decryption Error:", storageError)
      return new NextResponse("[STORAGE_ERROR]: Failed to generate decryption protocol", { status: 500 })
    }

    return NextResponse.redirect(storageData.signedUrl)

  } catch (error) {
    console.error("Download pipeline error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}