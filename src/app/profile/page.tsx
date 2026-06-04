"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { 
  Loader2, User, Settings, LogOut, 
  Terminal, Download, ShieldCheck, Upload, Plus, BarChart3
} from "lucide-react"
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuthActions } from '@/lib/useAuthActions'
import { DeployAssetModal } from '@/components/DeployAssetModal'
import { InventoryItemCard, AuthoredCollection } from '@/components/InventoryItemCard'

const GET_USER_PROFILE = `
  query GetUserProfile {
    getUserProfile {
      id
      username
      email
      avatarUrl
      status
      roles
      authoredCollections {
        id
        name
        price
        description
        previewImage { 
          filePath
        }
      }
      purchases {
        id
        amount
        currency
        status
        createdAt
        items {
          id
          snapshotPrice
          asset {
            id
            name
            previewImage { 
              filePath
              fileName
            }
          }
        }
      }
    }
  }
`;

const UPDATE_AVATAR_MUTATION = `
  mutation UpdateAvatar($input: UpdateAvatarRequest!) {
    updateAvatar(input: $input) {
      id
      avatarUrl
      updatedAt
    }
  }
`;

interface PurchaseItem {
  id: string;
  snapshotPrice: number;
  asset: {
    id: string;
    name: string;
    previewImage: { 
      filePath: string;
      fileName: string;
    };
  };
}

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  items: PurchaseItem[];
}

interface UserData {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  status: string;
  roles: string[];
  authoredCollections?: AuthoredCollection[];
  purchases: Purchase[];
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { terminateSession } = useAuthActions()

  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any)?.accessToken}` 
        },
        body: JSON.stringify({
          query: GET_USER_PROFILE
        }),
      })
      const result = await response.json()

      if (!result.errors) {
        setUserData(result.data?.getUserProfile)
      }
    } catch (err) {
      console.error("PROFILE_FETCH_FAILURE:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") fetchUser()
  }, [session, status])

  const resizeAndConvertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = 200
          canvas.height = 200
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Canvas failure"))

          const size = Math.min(img.width, img.height)
          const xIdx = (img.width - size) / 2
          const yIdx = (img.height - size) / 2

          ctx.drawImage(img, xIdx, yIdx, size, size, 0, 0, 200, 200)

          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error("Serialization error")),
            "image/webp",
            0.85
          )
        }
      }
      reader.onerror = (err) => reject(err)
    })
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    if(!userData) {
      setIsUploading(false)
      return
    }

    try {
      const processedBlob = await resizeAndConvertToWebP(file)
      const fileName = `avatars/${userData.id}-${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from("previews")
        .upload(fileName, processedBlob, {
          contentType: "image/webp",
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("previews")
        .getPublicUrl(fileName)

      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify({
          query: UPDATE_AVATAR_MUTATION,
          variables: {
            input: {
              id: userData.id,
              avatarUrl: publicUrl
            }
          }
        })
      })

      const mutationResult = await response.json()
      if (mutationResult.errors) throw new Error(mutationResult.errors[0].message)
      
      setUserData(prev => prev ? { ...prev, avatarUrl: publicUrl } : null)
      await updateSession()
    } catch (err) {
      console.error("AVATAR_UPLOAD_FAILURE:", err)
    } finally {
      setIsUploading(false)
    }
  }

  if (loading || status === "loading") return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-background font-sans">
      <Loader2 className="animate-spin text-primary mb-4 stroke-[1.5]" size={36} />
      <span className="font-medium uppercase tracking-[0.2em] text-[11px] text-muted-foreground">Verifying access rights...</span>
    </div>
  )

  const isAuthor = userData?.roles?.includes("author")
  const totalSpent = userData?.purchases?.reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2) || "0.00"
  
  const totalAssetsCount = userData?.purchases?.reduce((acc, curr) => acc + (curr.items?.length || 0), 0) || 0

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-6 md:p-10 lg:p-12 relative">

      <nav className="mb-12 border-b border-border/40 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-primary">
            <span className="h-2 w-2 bg-primary rounded-none" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Access Scope: {isAuthor ? "Partner Privileges Enabled" : "Standard Client Account"}
            </span>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">Node Control</h1>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-4 space-y-6">
          <section className="border border-border/60 bg-card p-6 rounded-none shadow-md relative">
            
            <div className="flex items-center gap-5 mb-6 pt-2">
              <div className="relative h-16 w-16 border border-border/80 rounded-none bg-muted shrink-0 overflow-hidden">
                {userData?.avatarUrl ? (
                  <img src={userData.avatarUrl} alt="avatar" className="w-full h-full object-cover opacity-90" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                    <User size={24} strokeWidth={1.5} />
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center z-10">
                    <Loader2 className="animate-spin text-primary" size={16} />
                  </div>
                )}
              </div>

              <div className="space-y-1 overflow-hidden">
                <h2 className="text-lg font-bold uppercase tracking-tight text-foreground truncate">{userData?.username || "Guest Node"}</h2>
                <p className="text-[11px] font-normal text-muted-foreground truncate lowercase">
                  {userData?.email}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center justify-center gap-2 w-full border border-border/80 bg-background text-foreground p-2.5 hover:bg-accent font-semibold text-[10px] uppercase tracking-wider cursor-pointer transition-colors rounded-none">
                <Upload size={12} className="stroke-[1.8]" /> 
                {isUploading ? "Syncing..." : "Update Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
              </label>
            </div>

            <div className="space-y-2 border-t border-border/30 pt-4">
              <Link href="/settings" className="flex items-center justify-between w-full border border-border/60 bg-background text-foreground p-3 hover:bg-accent text-xs font-semibold uppercase tracking-wider transition-colors rounded-none group">
                Settings Configuration <Settings size={14} className="text-muted-foreground group-hover:rotate-45 transition-transform" />
              </Link>
              <button 
                onClick={() => terminateSession()}
                className="flex items-center justify-between w-full border border-destructive/40 text-destructive bg-background p-3 hover:bg-destructive/5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-none"
              >
                Sign Out Account <LogOut size={14} />
              </button>
            </div>
          </section>

          <div className="border border-border/40 bg-muted/20 p-4 rounded-none text-[11px] tracking-wide text-muted-foreground uppercase">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground border-b border-border/30 pb-2 mb-2">
              <Terminal size={12} /> System Registry
            </div>
            <div className="space-y-1.5 font-medium">
              <div className="flex justify-between"><span>Status:</span> <span className="text-foreground">{userData?.status}</span></div>
              <div className="flex justify-between"><span>Authority:</span> <span className="text-foreground">{isAuthor ? "Platform Partner" : "Standard Client"}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          
          {isAuthor && (
            <section className="border border-border/60 p-6 bg-card rounded-none shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-border/40 pb-4">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">Author Station</h3>
                  <p className="text-[10px] font-medium uppercase text-muted-foreground mt-0.5">Deploy and monitor studio assets</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 font-semibold text-xs uppercase hover:opacity-90 transition-opacity rounded-none tracking-wider"
                >
                  <Plus size={14} /> Deploy Asset
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-border/40 p-4 bg-background">
                  <div className="text-[9px] font-semibold uppercase text-muted-foreground flex items-center gap-1"><BarChart3 size={11}/> Total Sales</div>
                  <div className="text-xl font-bold mt-1 text-foreground">0 Units</div>
                </div>
                <div className="border border-border/40 p-4 bg-background">
                  <div className="text-[9px] font-semibold uppercase text-muted-foreground">Net Profit</div>
                  <div className="text-xl font-bold mt-1 text-primary">$0.00</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Active Product Inventory</span>
                {userData?.authoredCollections && userData.authoredCollections.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userData.authoredCollections.map((col) => (
                      <InventoryItemCard 
                        key={col.id} 
                        collection={col}
                        accessToken={(session as any)?.accessToken || ""}
                        onRefreshNeeded={fetchUser} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-border/40 bg-background text-[10px] font-semibold uppercase text-muted-foreground/50 tracking-wider">
                    No product nodes submitted by this station.
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">Purchased Core Vault</h3>
              <div className="flex-1" />
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-muted text-muted-foreground border border-border/40">
                {totalAssetsCount} Assets
              </span>
            </div>

            {totalAssetsCount > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {userData?.purchases?.map((purchase) => (
                  <React.Fragment key={purchase.id}>
                    {purchase.items?.map((item) => (
                      <div key={item.id} className="group border border-border/40 bg-card rounded-none shadow-sm overflow-hidden flex flex-col justify-between">
                        <div className="aspect-video border-b border-border/30 overflow-hidden bg-muted">
                          <img 
                            src={item.asset?.previewImage?.filePath} 
                            alt={item.asset?.name}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                          />
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <span className="font-bold uppercase text-xs text-foreground tracking-tight leading-snug line-clamp-1">{item.asset?.name}</span>
                            <div className="text-[9px] bg-muted border border-border/60 px-1.5 py-0.5 font-semibold uppercase text-muted-foreground tracking-wider shrink-0">
                              {purchase.status}
                            </div>
                          </div>
                          <Link 
                            href={`/assets/${item.asset?.id}`}
                            className="flex items-center justify-center gap-2 w-full bg-foreground text-background hover:bg-primary hover:text-white p-2.5 font-bold text-[10px] uppercase tracking-widest transition-colors rounded-none"
                          >
                            <Download size={12} /> Download Package
                          </Link>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border/60 p-16 text-center bg-card/20">
                <div className="font-semibold uppercase text-muted-foreground/40 text-sm tracking-widest mb-4">Storage Directory Empty</div>
                <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[11px] uppercase border border-border/80 px-4 py-2 bg-background hover:bg-accent tracking-wider transition-colors rounded-none">
                  Browse Active Catalog
                </Link>
              </div>
            )}
          </section>

          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-4 opacity-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Billing History Ledger</h3>
              <div className="flex-1 border-b border-border/40 border-dashed" />
            </div>
            
            <div className="bg-card border border-border/40 p-5 rounded-none shadow-sm">
              <table className="w-full text-left text-[11px] font-sans">
                <thead>
                  <tr className="border-b border-border/40 uppercase font-semibold text-muted-foreground tracking-wider">
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-center">Reference ID</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-foreground uppercase tracking-wide">
                  {userData?.purchases?.map((p) => (
                    <tr key={p.id} className="border-b border-border/20 last:border-0 text-xs">
                      <td className="py-3.5 font-semibold">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 text-center text-[11px] text-muted-foreground opacity-60">#{p.id.slice(0, 8)}</td>
                      <td className="py-3.5 text-right font-bold text-foreground">{p.amount.toFixed(2)} {p.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck size={14} className="text-primary" /> Gateway Verified
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider">Total Value Processed</span>
                  <span className="text-xl font-bold tracking-tight text-foreground">{totalSpent} {userData?.purchases?.[0]?.currency || "USD"}</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {isAuthor && (
        <DeployAssetModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userData?.id || ""}
          accessToken={(session as any)?.accessToken || ""}
          onSuccess={fetchUser} 
        />
      )}
    </main>
  )
}