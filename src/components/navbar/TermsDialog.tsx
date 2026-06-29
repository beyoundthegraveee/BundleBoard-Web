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
        <div>
          <h4 className="font-bold text-foreground mb-1">1. Introduction and Company Details</h4>
          <p className="mb-4">
            {`Welcome to BundleBoard. These Terms of Service govern your use of our digital asset marketplace. 
            BundleBoard is registered and operates at Centralna 17/5, 02-271 Warsaw, Masovian, Poland. By accessing our platform, 
            creating an account, or downloading/uploading assets, you agree to be bound by these Terms.`}
          </p>

          <h4 className="font-bold text-foreground mb-1">2. User-Generated Content & Copyright</h4>
          <p className="mb-4">
            {`BundleBoard allows users to upload, share, and sell digital assets. By uploading any content, you guarantee that you 
            own all intellectual property rights to the files or have obtained the necessary commercial licenses to distribute them. 
            You are strictly prohibited from uploading copyrighted material, standalone third-party files, or assets derived from 
            products that do not permit redistribution.`}
          </p>

          <h4 className="font-bold text-foreground mb-1">3. Platform Liability & DMCA Policy</h4>
          <p className="mb-4">
            {`BundleBoard acts solely as a service provider and hosting platform for user-generated content. We do not claim ownership 
            of any files uploaded by our users and are not liable for copyright infringement by third parties. If you believe your 
            copyright has been violated, please contact us at <strong>bundleboard@gmail.com</strong>, and we will promptly remove the 
            infringing material in accordance with the Digital Millennium Copyright Act (DMCA).`}
          </p>

          <h4 className="font-bold text-foreground mb-1">4. Purchases and License Grants</h4>
          <p className="mb-4">
            {`When you download a free or paid asset, you receive a license granted directly by the author of the asset, not by BundleBoard. 
            Unless explicitly stated otherwise by the author's attached license, you may not resell, redistribute, or share the original 
            source files under any circumstances.`}
          </p>

          <h4 className="font-bold text-foreground mb-1">5. Privacy and Cookies</h4>
          <p className="mb-4">
            {`We respect your privacy. BundleBoard collects basic account information (such as email and username) necessary to provide our services. 
            Our website uses cookies and similar tracking technologies to ensure core functionality, maintain active user sessions, and analyze 
            site traffic. By using BundleBoard, you consent to our use of cookies. We will never sell your personal data to third parties.`}
          </p>

          <h4 className="font-bold text-foreground mb-1">6. Account Termination</h4>
          <p className="mb-4">
            {`We reserve the right to suspend or terminate any user account involved in fraudulent activity, copyright infringement, spamming, 
            or any violation of these terms without prior notice or liability.`}
          </p>

          <h4 className="font-bold text-foreground mb-1">7. Contact Information</h4>
          <p>
            {`If you have any questions regarding these Terms or need to report a violation, please contact us at <strong>bundleboard@gmail.com</strong>.`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}