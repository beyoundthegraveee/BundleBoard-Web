"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TermsDialogProps {
  trigger: React.ReactNode
}

export default function TermsDialog({ trigger }: TermsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-none border-border/60 bg-background font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-tight">
            Terms of Service & License Agreement
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-wider text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-sm text-foreground/80 leading-relaxed">
          <div>
            <h4 className="font-bold text-foreground mb-1">1. User-Generated Content & Copyright</h4>
            <p>
              By uploading or sharing any digital assets on this platform, you guarantee that you own all 
              intellectual property rights to the content or have obtained the necessary licenses to distribute it. 
              You are strictly prohibited from uploading copyrighted material, standalone files, or assets derived 
              from third-party products that do not allow redistribution.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-1">2. Platform Liability (DMCA)</h4>
            <p>
              This platform acts solely as a service provider for user-generated content. We do not claim ownership 
              of any files uploaded by our users. If you believe your copyright has been infringed, please contact 
              us immediately, and we will promptly remove the infringing material in accordance with the Digital 
              Millennium Copyright Act (DMCA).
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-1">3. License Grants</h4>
            <p>
              When downloading a free or paid asset, you receive a license granted by the author. You may not resell, 
              redistribute, or share the original files under any circumstances unless explicitly allowed by the 
              author's specific license attached to the product.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-1">4. Account Termination</h4>
            <p>
              We reserve the right to suspend or terminate any account involved in fraudulent activity, copyright 
              infringement, or violation of these terms without prior notice.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}