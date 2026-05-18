"use client"

import React, { useEffect, useState } from 'react'
import { useSession, signOut } from "next-auth/react"
import { 
  Loader2, User, Settings, LogOut, 
  Terminal, ExternalLink, Download, ShieldCheck, Upload
} from "lucide-react"
import Link from 'next/link'
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GET_USER_PROFILE = `
  query GetUserProfile {
    getUserProfile {
      id
      username
      email
      avatarUrl
      status
      purchases {
        id
        amount
        currency
        status
        snapshotPrice
        createdAt
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

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  snapshotPrice: number;
  createdAt: string;
  asset: {
    id: string;
    name: string;
    previewImage: { 
      filePath: string;
      fileName: string;
    };
  };
}

interface UserData {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  status: string;
  purchases: Purchase[];
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

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

      if (result.errors) {
        console.error("GraphQL вернул ошибку при загрузке профиля:", result.errors)
      } else {
        console.log("Данные профиля успешно получены:", result.data?.getUserProfile)
        setUserData(result.data?.getUserProfile)
      }
    } catch (err) {
      console.error("PROFILE_CRITICAL_ERROR:", err)
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
          canvas.width = 300
          canvas.height = 300
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Canvas failure"))

          const size = Math.min(img.width, img.height)
          const xIdx = (img.width - size) / 2
          const yIdx = (img.height - size) / 2

          ctx.drawImage(img, xIdx, yIdx, size, size, 0, 0, 300, 300)

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

    console.log("Файл выбран успешно!", event.target.files?.[0]);
    console.log("Текущее состояние userData:", userData);
    
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    if(!userData) {
      console.error("Критическая ошибка: у userData отсутствует ID!")
      setIsUploading(false)
      return
    }

    try {
      const processedBlob = await resizeAndConvertToWebP(file)
      const fileName = `avatars/${userData.id}_${Date.now()}.webp`

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
      
      if (mutationResult.errors) {
        throw new Error(mutationResult.errors[0].message)
      }
      
      // Локально переключаем аватарку на экране, чтобы юзер сразу видел изменения
      setUserData(prev => prev ? { ...prev, avatarUrl: publicUrl } : null)
      await updateSession()
    } catch (err) {
      console.error("AVATAR_UPDATE_PROTOCOL_FAILED:", err)
    } finally {
      setIsUploading(false)
    }
  }

  if (loading || status === "loading") return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-mono">
      <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
      <span className="font-black uppercase tracking-[0.3em] text-[10px]">Authorizing_Access...</span>
    </div>
  )

  const totalSpent = userData?.purchases?.reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2) || "0.00"

  return (
    <main className="min-h-screen bg-white text-black font-mono p-4 md:p-10 lg:p-16">
      <nav className="mb-16 border-b-8 border-black pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-4 w-4 bg-red-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">User_Access_Level: {userData?.status || 'Unknown'}</span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">Node_Control</h1>
        </div>
        <div className="border-2 border-black p-3 bg-zinc-100 text-[11px] font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          Last_Sync: {new Date().toLocaleDateString()}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        <div className="lg:col-span-4 space-y-10">
          <section className="border-4 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)] relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 p-2 bg-black text-white text-[8px] font-black uppercase">ID_{userData?.id}</div>
            
            {/* Карточка аватарки */}
            <div className="relative aspect-square border-4 border-black mb-6 overflow-hidden bg-zinc-200 shadow-[8px_8px_0px_rgba(239,68,68,1)] group/avatar">
              {userData?.avatarUrl ? (
                <img src={userData.avatarUrl} alt="avatar" className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                  <User size={80} strokeWidth={1} />
                </div>
              )}

              {/* Спиннер загрузки поверх аватарки */}
              {isUploading && (
                <div className="absolute inset-0 bg-white/90 border-black flex flex-col items-center justify-center z-10">
                  <Loader2 className="animate-spin text-black mb-2" size={24} />
                  <span className="text-[8px] font-black uppercase tracking-wider">Flashing_Node...</span>
                </div>
              )}
            </div>

            {/* Брутальная кнопка загрузки нового изображения */}
            <div className="mb-8">
              <label className="flex items-center justify-center gap-2 w-full border-2 border-black bg-zinc-50 p-3 hover:bg-black hover:text-white transition-all font-black text-[11px] uppercase cursor-pointer select-none shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                <Upload size={14} className="stroke-[3]" /> 
                {isUploading ? "Syncing_Data..." : "Upload_Identity_Image"}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange} 
                  disabled={isUploading} 
                />
              </label>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase break-all leading-none">{userData?.username || "Guest_Node"}</h2>
              <div className="h-1 w-full bg-black" />
              <p className="text-[11px] font-bold leading-relaxed uppercase opacity-60 italic">
                Email: {userData?.email}
              </p>
            </div>

            <div className="mt-10 space-y-3">
              <Link href="/settings" className="flex items-center justify-between w-full border-2 border-black p-4 hover:bg-black hover:text-white transition-all font-black text-[12px] uppercase group">
                Settings <Settings size={18} className="group-hover:rotate-90 transition-transform" />
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center justify-between w-full border-2 border-red-600 text-red-600 p-4 hover:bg-red-600 hover:text-white transition-all font-black text-[12px] uppercase"
              >
                Terminate <LogOut size={18} />
              </button>
            </div>
          </section>

          <div className="border-2 border-black bg-zinc-950 text-green-500 p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase mb-4 text-green-400 border-b border-green-900 pb-2">
              <Terminal size={14} /> System_Logs:
            </div>
            <div className="text-[9px] font-mono space-y-2 leading-none uppercase">
              <div className="flex justify-between"><span>Status:</span> <span className="text-white">{userData?.status}</span></div>
              <div className="flex justify-between"><span>Connection:</span> <span className="text-white">Secure</span></div>
              <div className="pt-2 text-green-800 italic">...access_granted...</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PURCHASES */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="flex items-end gap-4 mb-10">
              <h3 className="text-4xl font-black uppercase tracking-tighter italic">Archive_v.1</h3>
              <div className="flex-1 border-b-4 border-black mb-1"></div>
              <span className="text-xs font-black uppercase px-2 bg-black text-white">
                {userData?.purchases?.length || 0} Assets
              </span>
            </div>

            {userData?.purchases && userData.purchases.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {userData.purchases.map((purchase) => (
                  <div key={purchase.id} className="group border-4 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-video border-b-4 border-black overflow-hidden">
                      <img 
                        src={purchase.asset.previewImage.filePath} 
                        alt={purchase.asset.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105" 
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-black uppercase text-sm leading-tight">{purchase.asset.name}</span>
                        <div className="text-[9px] bg-zinc-100 border border-black px-2 py-0.5 font-black uppercase">
                          {purchase.status}
                        </div>
                      </div>
                      <Link 
                        href={`/assets/${purchase.asset.id}`}
                        className="flex items-center justify-center gap-2 w-full bg-black text-white p-3 font-black text-[10px] uppercase hover:bg-red-600 transition-colors"
                      >
                        <Download size={14} /> Access_Data
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-4 border-black border-dashed p-24 text-center">
                <div className="font-black uppercase text-zinc-300 text-2xl tracking-[0.3em] mb-4">Storage_Empty</div>
                <Link href="/" className="inline-flex items-center gap-2 font-black text-[12px] uppercase border-2 border-black p-4 hover:bg-black hover:text-white transition-all">
                  Browse_Assets <ExternalLink size={16} />
                </Link>
              </div>
            )}
          </section>

          <section className="mt-20">
            <div className="flex items-center gap-4 mb-8 opacity-40">
              <h3 className="text-xl font-black uppercase italic">Billing_Ledger</h3>
              <div className="flex-1 border-b-2 border-black border-dotted"></div>
            </div>
            
            <div className="bg-zinc-50 border-2 border-black p-8 font-mono shadow-[12px_12px_0px_rgba(0,0,0,0.05)] relative">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b-2 border-black uppercase font-black">
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-center">Asset_ID</th>
                    <th className="pb-2 text-right">Sum</th>
                  </tr>
                </thead>
                <tbody className="font-bold opacity-80 uppercase leading-relaxed">
                  {userData?.purchases?.map((p) => (
                    <tr key={p.id} className="border-b border-black/10">
                      <td className="py-4 font-black">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-center font-mono opacity-50">#{p.asset.id}</td>
                      <td className="py-4 text-right">{p.amount} {p.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-8 flex justify-between items-center border-t-4 border-black pt-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                  <ShieldCheck size={16} className="text-red-600" /> Secure_Transaction_Node
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-black opacity-40">Net_Network_Value</span>
                  <span className="text-2xl font-black">{totalSpent} {userData?.purchases?.[0]?.currency || "USD"}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}