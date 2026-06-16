import React from 'react'

export const metadata = {
  title: 'Terms of Service | BundleBoard',
  description: 'Legal terms and conditions for using BundleBoard.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground py-20">
      <div className="max-w-3xl mx-auto px-6">
        
        <div className="mb-12 border-b border-border/40 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8 text-sm md:text-base text-foreground/80 leading-relaxed">
          
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wide">
              1. Introduction and Company Details
            </h2>
            <p>
              Welcome to BundleBoard ("we," "our," or "us"). These Terms of Service govern your use of our digital asset marketplace. 
              BundleBoard is registered and operates at Centralna 17/5, 02-271 Warsaw, Masovian, Poland. By accessing our platform, 
              creating an account, or downloading/uploading assets, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wide">
              2. User-Generated Content & Copyright
            </h2>
            <p>
              BundleBoard allows users to upload, share, and sell digital assets. By uploading any content, you guarantee that you 
              own all intellectual property rights to the files or have obtained the necessary commercial licenses to distribute them. 
              You are strictly prohibited from uploading copyrighted material, standalone third-party files, or assets derived from 
              products that do not permit redistribution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wide">
              3. Platform Liability & DMCA Policy
            </h2>
            <p>
              BundleBoard acts solely as a service provider and hosting platform for user-generated content. We do not claim ownership 
              of any files uploaded by our users and are not liable for copyright infringement by third parties. If you believe your 
              copyright has been violated, please contact us at <strong>bundleboard@gmail.com</strong>, and we will promptly remove the 
              infringing material in accordance with the Digital Millennium Copyright Act (DMCA).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wide">
              4. Purchases and License Grants
            </h2>
            <p>
              When you download a free or paid asset, you receive a license granted directly by the author of the asset, not by BundleBoard. 
              Unless explicitly stated otherwise by the author's attached license, you may not resell, redistribute, or share the original 
              source files under any circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wide">
              5. Privacy and Cookies
            </h2>
            <p>
              We respect your privacy. BundleBoard collects basic account information (such as email and username) necessary to provide our services. 
              Our website uses cookies and similar tracking technologies to ensure core functionality, maintain active user sessions, and analyze 
              site traffic. By using BundleBoard, you consent to our use of cookies. We will never sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wide">
              6. Account Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate any user account involved in fraudulent activity, copyright infringement, spamming, 
              or any violation of these terms without prior notice or liability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wide">
              7. Contact Information
            </h2>
            <p>
              If you have any questions regarding these Terms or need to report a violation, please contact us at <strong>bundleboard@gmail.com</strong>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}