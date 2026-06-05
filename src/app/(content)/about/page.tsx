"use client"

import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';
import { ExternalLink, MessageCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-20 max-w-4xl mx-auto font-sans">
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-12 font-display text-gradient">
        About Bundle Board
      </h1>
      
      <div className="space-y-8 text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-muted-foreground border-l-2 border-primary/30 pl-6 py-2">
          <span className="font-bold text-foreground">BundleBoard</span> is the realisation of one developer’s idea.
          I hope that sharing your work has become easier thanks to me.
        </p>
        
        <p className="text-muted-foreground">
          I often use Photoshop or Illustrator in my work, but as I’m not an artist in the strictest sense,
          I always rely on ready-made solutions. Searching through dozens of websites gave me the idea to create this project. 
        </p>

        <p className="font-bold text-primary tracking-widest uppercase text-sm">
          Thank you for using it and helping to develop it. La Pasion!
        </p>
      </div>

      <div className="mt-20 pt-10 border-t border-border flex flex-col gap-6">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Connect with the Developer</h2>
        <div className="flex gap-6">
          <Link href="https://github.com/beyoundthegraveee" target="_blank" className="flex items-center gap-2 hover:text-primary transition-all hover:translate-x-1 group">
            <FaGithub /> 
            <span className="font-semibold uppercase text-xs">GitHub</span>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="https://www.linkedin.com/in/kiryl-k-480630255" target="_blank" className="flex items-center gap-2 hover:text-primary transition-all hover:translate-x-1 group">
            <FaLinkedin /> 
            <span className="font-semibold uppercase text-xs">LinkedIn</span>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>
      <div className="mt-12 p-8 bg-card border border-border flex items-center justify-between group hover:border-primary/50 transition-colors">
        <div>
          <h3 className="font-bold uppercase text-sm tracking-widest">Follow our TikTok</h3>
          <p className="text-xs text-muted-foreground mt-1">Behind the scenes & Asset Showcases</p>
        </div>
        <Link 
          href="https://tiktok.com/@bundleboard" 
          target="_blank"
          className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 font-bold text-xs uppercase hover:bg-primary/90 transition-all active:scale-95"
        >
          <MessageCircle size={16} /> Visit TikTok
        </Link>
      </div>
    </main>
  );
}