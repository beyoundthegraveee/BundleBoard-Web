"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useMutation } from '@apollo/client/react'
import { Loader2, ArrowLeft, User, Mail, Lock, ShieldCheck, ShieldAlert } from 'lucide-react'
import { 
  UpdateMeDocument,
  RequestEmailChangeDocument,
  RequestPasswordChangeDocument,
  ConfirmPasswordChangeDocument
} from '@/graphql/generated'

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState(session?.user?.name || "")
  const [newEmail, setNewEmail] = useState("")
  
  const [passwordStep, setPasswordStep] = useState<'input' | 'verify'>('input')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [verificationCode, setVerificationCode] = useState("")

  const [usernameStatus, setUsernameStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [updateMe, { loading: isUsernameLoading }] = useMutation(UpdateMeDocument)
  const [requestEmailChange, { loading: isEmailLoading }] = useMutation(RequestEmailChangeDocument)
  const [requestPasswordChange, { loading: isPasswordRequestLoading }] = useMutation(RequestPasswordChangeDocument)
  const [confirmPasswordChange, { loading: isPasswordConfirmLoading }] = useMutation(ConfirmPasswordChangeDocument)

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameStatus(null)
    
    const userId = (session as any)?.user?.id;
    if (!username.trim() || username === session?.user?.name || !userId) return

    try {
      const { data } = await updateMe({ 
        variables: { 
          input: {
            id: userId,
            username: username.trim()
          }
        } 
      })

      if (data?.updateMe?.username) {
        setUsernameStatus({ type: 'success', text: "Identity index updated successfully." })
        await updateSession({ ...session, user: { ...session?.user, name: data.updateMe.username } })
      } else {
        setUsernameStatus({ type: 'error', text: "Execution error: Failed to update username node." })
      }
    } catch (err: any) {
      setUsernameStatus({ type: 'error', text: err.message || "Pipeline failure." })
    }
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailStatus(null)
    if (!newEmail.trim()) return

    try {
      const { data } = await requestEmailChange({ variables: { newEmail: newEmail.trim() } })
      const result = data?.requestEmailChange

      if (result?.success) {
        setEmailStatus({ type: 'success', text: `[TRANSMISSION_SUCCESS]: ${result.message}` })
        setNewEmail("")
      } else {
        setEmailStatus({ type: 'error', text: `${result?.message} (Attempts left: ${result?.attemptsLeft ?? 'N/A'})` })
      }
    } catch (err: any) {
      setEmailStatus({ type: 'error', text: err.message || "Transmission interrupted." })
    }
  }

  const handleRequestPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', text: "Validation failed: new ciphers do not match." })
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
        setPasswordStatus({ type: 'success', text: "[SECURITY]: 6-digit confirmation key deployed to your email." })
        setPasswordStep('verify')
      } else {
        setPasswordStatus({ type: 'error', text: result?.message || "Verification request rejected." })
      }
    } catch (err: any) {
      setPasswordStatus({ type: 'error', text: err.message || "Secure sequence failed." })
    }
  }

  const handleConfirmPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)
    if (!verificationCode.trim()) return

    try {
      const { data } = await confirmPasswordChange({
        variables: { code: verificationCode.trim() }
      })

      const result = data?.confirmPasswordChange
      if (result?.success) {
        setPasswordStatus({ type: 'success', text: "Cryptographic key patch applied successfully. New password active." })
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setVerificationCode("")
        setPasswordStep('input')
      } else {
        setPasswordStatus({ 
          type: 'error', 
          text: `${result?.message || "Invalid code."} ${result?.attemptsLeft ? `(Attempts left: ${result.attemptsLeft})` : ''}` 
        })
      }
    } catch (err: any) {
      setPasswordStatus({ type: 'error', text: err.message || "Confirmation sequence broken." })
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin h-5 w-5 text-primary stroke-[1.5]" />
      </main>
    )
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans text-center">
        <ShieldAlert size={48} className="text-destructive/50 mb-4" />
        <h1 className="text-xl font-bold uppercase tracking-widest mb-2">Access Denied</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6">
          System requires valid authentication token to access node configuration.
        </p>
        <Link href="/login" className="px-6 py-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
          Initialize Auth Sequence
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans animate-in fade-in duration-300">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <nav className="flex justify-between items-center pb-6 border-b border-white/[0.06]">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 font-semibold uppercase text-[10px] tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-px transition-transform" /> Back to station
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
            System Configuration Matrix
          </span>
        </nav>

        <header>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display">
            Node Configuration
          </h1>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
            Modify core preferences, communication channels, and encryption keys.
          </p>
        </header>

        <div className="space-y-8">
          
          <section className="border border-border/60 bg-card p-6 rounded-none shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">
              <User size={14} className="text-primary" /> Identity Parameters
            </div>
            {usernameStatus && (
              <div className={`p-3 text-[10px] font-semibold uppercase tracking-wide border rounded-none ${
                usernameStatus.type === 'success' ? 'bg-primary/5 border-primary/20 text-primary' : 'border-destructive/20 bg-destructive/5 text-destructive'
              }`}>
                {usernameStatus.text}
              </div>
            )}
            <form onSubmit={handleUpdateUsername} className="flex gap-3 flex-col sm:flex-row items-end sm:items-center">
              <div className="grid gap-1 flex-1 w-full">
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
                disabled={isUsernameLoading || username === session?.user?.name}
                className="w-full sm:w-auto h-10 px-5 bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                {isUsernameLoading && <Loader2 className="animate-spin h-3 w-3" />}
                Commit Name
              </button>
            </form>
          </section>

          <section className="border border-border/60 bg-card p-6 rounded-none shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">
              <Mail size={14} className="text-primary" /> Communication Channel
            </div>
            {emailStatus && (
              <div className={`p-3 text-[10px] font-semibold uppercase tracking-wide border rounded-none ${
                emailStatus.type === 'success' ? 'bg-primary/5 border-primary/20 text-primary' : 'border-destructive/20 bg-destructive/5 text-destructive'
              }`}>
                {emailStatus.text}
              </div>
            )}
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex justify-between bg-muted/20 p-2 border border-border/20 font-mono">
              <span>Current Route:</span>
              <span className="text-foreground">{session?.user?.email}</span>
            </div>
            <form onSubmit={handleRequestEmailChange} className="flex gap-3 flex-col sm:flex-row items-end sm:items-center">
              <div className="grid gap-1 flex-1 w-full">
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
                className="w-full sm:w-auto h-10 px-5 bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                {isEmailLoading && <Loader2 className="animate-spin h-3 w-3" />}
                Request Migration
              </button>
            </form>
          </section>

          <section className="border border-border/60 bg-card p-6 rounded-none shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">
              <Lock size={14} className="text-primary" /> Cryptographic Keys
            </div>
            {passwordStatus && (
              <div className={`p-3 text-[10px] font-semibold uppercase tracking-wide border rounded-none ${
                passwordStatus.type === 'success' ? 'bg-primary/5 border-primary/20 text-primary' : 'border-destructive/20 bg-destructive/5 text-destructive'
              }`}>
                {passwordStatus.text}
              </div>
            )}

            {passwordStep === 'input' ? (
              <form onSubmit={handleRequestPasswordChange} className="space-y-4 animate-in fade-in duration-200">
                <div className="grid gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex justify-end">
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
                <div className="bg-muted/10 border border-border/40 p-4 text-[11px] leading-relaxed text-muted-foreground uppercase tracking-wide">
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
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    disabled={isPasswordConfirmLoading}
                    onClick={() => { setPasswordStep('input'); setPasswordStatus(null); }}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                  >
                    ← Back to input
                  </button>
                  <button 
                    type="submit"
                    disabled={isPasswordConfirmLoading || verificationCode.length !== 6}
                    className="h-10 px-6 bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 text-[10px] font-bold uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    {isPasswordConfirmLoading && <Loader2 className="animate-spin h-3 w-3" />}
                    Verify & Apply Patch
                  </button>
                </div>
              </form>
            )}
          </section>

        </div>
        
        <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground opacity-50 flex items-center gap-1.5 justify-center pt-4">
          <ShieldCheck size={11} /> End-to-End Account Integrity Stream Active
        </div>

      </div>
    </main>
  )
}