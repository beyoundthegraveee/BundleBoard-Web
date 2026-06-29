"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useMutation, useQuery } from '@apollo/client/react'
import { Loader2, ArrowLeft, User, Mail, Lock, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { 
  UpdateMeDocument, 
  RequestEmailChangeDocument,
  RequestPasswordChangeDocument,
  ConfirmPasswordChangeDocument,
  GetMeDocument
} from '@/graphql/generated'

interface GraphQLSystemError {
  graphQLErrors?: Array<{ message: string }>;
  message?: string;
}

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  
  const isGoogleAccount = 
    (session as Session & { provider?: string })?.provider === "google" || 
    session?.user?.image !== undefined;
  
  const [username, setUsername] = useState("")
  const [newEmail, setNewEmail] = useState("")
  
  const [passwordStep, setPasswordStep] = useState<'input' | 'verify'>('input')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [verificationCode, setVerificationCode] = useState("")

  const { data: meData, loading: isMeLoading } = useQuery(GetMeDocument, {
    skip: status !== "authenticated",
    fetchPolicy: 'cache-and-network'
  });

  const [updateMe, { loading: isUsernameLoading }] = useMutation(UpdateMeDocument)
  const [requestEmailChange, { loading: isEmailLoading }] = useMutation(RequestEmailChangeDocument)
  const [requestPasswordChange, { loading: isPasswordRequestLoading }] = useMutation(RequestPasswordChangeDocument)
  const [confirmPasswordChange, { loading: isPasswordConfirmLoading }] = useMutation(ConfirmPasswordChangeDocument)

  useEffect(() => {
    const fetchedUsername = meData?.me?.username;
    const sessionName = session?.user?.name;

    if (fetchedUsername) {
      setUsername((prev) => prev === fetchedUsername ? prev : fetchedUsername);
    } else if (sessionName) {
      setUsername((prev) => prev ? prev : sessionName);
    }
  }, [meData?.me?.username, session?.user?.name]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const userId = (session as Session & { user?: { id?: string } })?.user?.id || meData?.me?.id;
    if (!username.trim() || username === meData?.me?.username || !userId) return

    try {
      const { data } = await updateMe({ 
        variables: { 
          input: { 
            id: String(userId),
            username: username.trim() 
          }
        } 
      })

      if (data?.updateMe?.username) {
        toast.success("Identity index and access tokens rotated successfully.")

        await updateSession({ 
          ...session, 
          user: { 
            ...session?.user, 
            name: data.updateMe.username 
          },
          accessToken: data.updateMe.accessToken,
          refreshToken: data.updateMe.refreshToken
        })
      }
    } catch (err: unknown) {
      const error = err as GraphQLSystemError;
      const backendMessage = error.graphQLErrors?.[0]?.message || error.message || "Pipeline failure.";
      toast.error(backendMessage)
    }
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim() || isGoogleAccount) return

    try {
      const { data } = await requestEmailChange({ variables: { newEmail: newEmail.trim() } })
      const result = data?.requestEmailChange

      if (result?.success) {
        toast.success(`[TRANSMISSION_SUCCESS]: ${result.message}`)
        setNewEmail("")
      } else {
        toast.error(result?.message || "Rejected.")
      }
    } catch (err: unknown) {
      const error = err as GraphQLSystemError;
      const backendMessage = error.graphQLErrors?.[0]?.message || error.message || "Transmission interrupted.";
      toast.error(backendMessage)
    }
  }

  const handleRequestPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isGoogleAccount) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Validation failed: new ciphers do not match.")
      return
    }

    try {
      const { data } = await requestPasswordChange({
        variables: {
          input: {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
            confirmPassword: passwordForm.confirmPassword
          }
        }
      })

      const result = data?.requestPasswordChange
      if (result?.success) {
        toast.success("[SECURITY]: 6-digit confirmation key deployed to your email.")
        setPasswordStep('verify')
      } else {
        toast.error(result?.message || "Verification request rejected.")
      }
    } catch (err: unknown) {
      const error = err as GraphQLSystemError;
      toast.error(error.message || "Secure sequence failed.")
    }
  }

  const handleConfirmPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode.trim() || isGoogleAccount) return

    try {
      const { data } = await confirmPasswordChange({
        variables: { code: verificationCode.trim() }
      })

      const result = data?.confirmPasswordChange
      if (result?.success) {
        toast.success("Cryptographic key patch applied successfully.")
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setVerificationCode("")
        setPasswordStep('input')
      } else {
        toast.error(`${result?.message || "Invalid code."} ${result?.attemptsLeft ? `(Attempts left: ${result.attemptsLeft})` : ''}`)
      }
    } catch (err: unknown) {
      const error = err as GraphQLSystemError;
      toast.error(error.message || "Confirmation sequence broken.")
    }
  }

  if (status === "loading" || isMeLoading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin h-5 w-5 text-primary stroke-[1.5]" />
      </main>
    )
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background flex flex-col items-center justify-center p-4 font-sans text-center">
        <ShieldAlert size={48} className="text-destructive/50 mb-4" />
        <h1 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-2">Access Denied</h1>
        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-6 max-w-sm">
          System requires valid authentication token to access node configuration.
        </p>
        <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
          Initialize Auth Sequence
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background text-foreground p-4 md:p-10 lg:p-12 font-sans relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`, 
          backgroundSize: '24px 24px' 
        }} 
      />

      <div className="max-w-3xl mx-auto space-y-6 md:space-y-10 relative z-10">
        <nav className="flex justify-between items-center pb-4 md:pb-6 border-b border-white/[0.06]">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 md:gap-2 font-semibold uppercase text-[9px] md:text-[10px] tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-px transition-transform" /> 
            <span className="hidden sm:inline">Back to station</span>
            <span className="sm:hidden">Back</span>
          </button>
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
            Configuration Matrix
          </span>
        </nav>

        <header>
          <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase font-display">
            Configuration
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1.5 md:mt-2 uppercase tracking-wider">
            Modify core preferences, communication channels, and encryption keys.
          </p>
        </header>

        <div className="space-y-6 md:space-y-8">
          
          <section className="border border-border/60 bg-card p-4 md:p-6 rounded-none shadow-md space-y-4">
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">
              <User size={14} className="text-primary" /> Identity Parameters
            </div>
            
            <form onSubmit={handleUpdateUsername} className="grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4 items-end">
              <div className="grid gap-1 sm:col-span-3 w-full">
                <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Public Username</label>
                <input 
                  type="text" 
                  required
                  disabled={isUsernameLoading}
                  className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none font-sans rounded-none focus:border-primary transition-colors disabled:opacity-50"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={isUsernameLoading || username === meData?.me?.username}
                className="w-full h-10 px-5 bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-colors sm:col-span-1"
              >
                {isUsernameLoading && <Loader2 className="animate-spin h-3 w-3" />}
                Commit Name
              </button>
            </form>
          </section>

          <section className="border border-border/60 bg-card p-4 md:p-6 rounded-none shadow-md space-y-4">
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">
              <Mail size={14} className="text-primary" /> Communication Channel
            </div>
            
            <div className="text-[9px] md:text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2 bg-muted/20 p-2.5 md:p-2 border border-border/20 font-mono">
              <span className="shrink-0">Current Route:</span>
              <span className="text-foreground break-all">{meData?.me?.email || session?.user?.email}</span>
            </div>
            
            {isGoogleAccount ? (
              <div className="border border-dashed border-primary/30 bg-primary/[0.02] p-4 md:p-5 text-center space-y-2 animate-in fade-in duration-300">
                <AlertTriangle size={18} className="text-primary/70 mx-auto" />
                <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-foreground">
                  Email Routing Anchored
                </div>
                <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wide max-w-md mx-auto leading-relaxed">
                  Your primary communication link is managed by <span className="text-primary font-bold">Google Auth</span>. Email migration is restricted to preserve secure platform Handshake pipelines.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestEmailChange} className="grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4 items-end">
                <div className="grid gap-1 sm:col-span-3 w-full">
                  <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">New Email Destination</label>
                  <input 
                    type="email" 
                    required
                    disabled={isEmailLoading}
                    placeholder="enter new email..."
                    className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none font-mono rounded-none focus:border-primary transition-colors placeholder:opacity-30 disabled:opacity-50"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isEmailLoading || !newEmail.trim()}
                  className="w-full h-10 px-5 bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-colors sm:col-span-1"
                >
                  {isEmailLoading && <Loader2 className="animate-spin h-3 w-3" />}
                  Request Migration
                </button>
              </form>
            )}
          </section>

          <section className="border border-border/60 bg-card p-4 md:p-6 rounded-none shadow-md space-y-4">
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">
              <Lock size={14} className="text-primary" /> Cryptographic Keys
            </div>

            {isGoogleAccount ? (
              <div className="border border-dashed border-primary/30 bg-primary/[0.02] p-4 md:p-5 text-center space-y-2 animate-in fade-in duration-300">
                <AlertTriangle size={18} className="text-primary/70 mx-auto" />
                <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-foreground">
                  OAuth Provider Active
                </div>
                <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wide max-w-md mx-auto leading-relaxed">
                  Your profile is bound to the <span className="text-primary font-bold">Google Identity Protocol</span>. Cryptographic password alterations are disabled since management is handled entirely via Google Ecosystem.
                </p>
              </div>
            ) : passwordStep === 'input' ? (
              <form onSubmit={handleRequestPasswordChange} className="space-y-4 animate-in fade-in duration-200">
                <div className="grid gap-3 md:gap-4">
                  <div className="grid gap-1">
                    <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Current Password</label>
                    <input 
                      type="password" 
                      required
                      disabled={isPasswordRequestLoading}
                      className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none rounded-none focus:border-primary transition-colors disabled:opacity-50"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="grid gap-1">
                      <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">New Secure Cipher</label>
                      <input 
                        type="password" 
                        required
                        disabled={isPasswordRequestLoading}
                        className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none rounded-none focus:border-primary transition-colors disabled:opacity-50"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Confirm New Cipher</label>
                      <input 
                        type="password" 
                        required
                        disabled={isPasswordRequestLoading}
                        className="w-full bg-background border border-border/60 p-2.5 text-xs text-foreground outline-none rounded-none focus:border-primary transition-colors disabled:opacity-50"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={isPasswordRequestLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="w-full sm:w-auto h-10 px-5 bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isPasswordRequestLoading && <Loader2 className="animate-spin h-3 w-3" />}
                    Generate Verification Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmPasswordChange} className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="bg-muted/10 border border-border/40 p-3 md:p-4 text-[10px] md:text-[11px] leading-relaxed text-muted-foreground uppercase tracking-wide">
                  The system is waiting for the transactional authorization factor. Enter the <span className="text-foreground font-bold font-mono">6-digit transmission code</span> sent to your email to commit the new cryptographic standard.
                </div>
                <div className="grid gap-1 max-w-xs mx-auto text-center">
                  <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Secure Code Entry</label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    disabled={isPasswordConfirmLoading}
                    placeholder="000000"
                    className="w-full bg-background border border-border/60 p-3 text-center text-lg font-mono tracking-[0.5em] font-bold text-foreground outline-none rounded-none focus:border-primary transition-colors placeholder:opacity-20 disabled:opacity-50"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isPasswordConfirmLoading}
                    onClick={() => setPasswordStep('input')}
                    className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 py-2 sm:py-0"
                  >
                    ← Back to input
                  </button>
                  <button 
                    type="submit"
                    disabled={isPasswordConfirmLoading || verificationCode.length !== 6}
                    className="w-full sm:w-auto h-10 px-6 bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    {isPasswordConfirmLoading && <Loader2 className="animate-spin h-3 w-3" />}
                    Verify & Apply Patch
                  </button>
                </div>
              </form>
            )}
          </section>

        </div>
        
        <div className="text-[8px] md:text-[9px] font-medium uppercase tracking-wider text-muted-foreground opacity-50 flex items-center gap-1.5 justify-center pt-2 md:pt-4">
          <ShieldCheck size={11} /> End-to-End Account Integrity Stream Active
        </div>

      </div>
    </main>
  )
}