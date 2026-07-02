import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { VerifyAssetPurchaseDocument, VerifyAssetPurchaseQuery, VerifyAssetPurchaseQueryVariables } from '@/graphql/generated'
import { authOptions } from "@/lib/NextAuthOptions" 
import { print, GraphQLError } from 'graphql'
import { Session } from 'next-auth'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createSupabaseClient(
  supabaseUrl,
  supabaseServiceKey,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params
    const session = (await getServerSession(authOptions)) as (Session & { accessToken?: string }) | null;
    
    if (!session?.accessToken) {
      return new NextResponse("[SECURE_ACCESS_DENIED]: Unauthorized or missing token", { status: 401 })
    }

    const graphqlResponse = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        query: print(VerifyAssetPurchaseDocument),
        variables: { assetId } satisfies VerifyAssetPurchaseQueryVariables
      }),
      cache: 'no-store'
    });

    const { data, errors } = (await graphqlResponse.json()) as {
      data?: VerifyAssetPurchaseQuery;
      errors?: GraphQLError[];
    };

    if (errors || !data?.getPurchaseByAsset) {
      console.error("GraphQL Error:", errors);
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
      .createSignedUrl(filePath, 300, { 
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