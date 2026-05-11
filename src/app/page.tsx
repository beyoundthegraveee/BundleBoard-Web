"use client"

import { CollectionGrid } from "@/components/CollectionGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f4f4] text-black selection:bg-red-600 selection:text-white font-mono overflow-x-hidden">
      
      {/* Blueprint Grid Overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }} />

      {/* Ticker Bar */}
      <div className="w-full bg-black text-white py-1 overflow-hidden whitespace-nowrap border-b border-red-600 relative z-10">
        <div className="animate-marquee inline-block font-black text-[10px] uppercase tracking-[0.5em]">
          SYSTEM_STATUS: ACTIVE // DATA_STREAM: ENCRYPTED // ASSET_LOAD: 100% // NO_COMPROMISE_DIGITAL_GOODS // 
          SYSTEM_STATUS: ACTIVE // DATA_STREAM: ENCRYPTED // ASSET_LOAD: 100% // NO_COMPROMISE_DIGITAL_GOODS //
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative border-b-2 border-black pt-20 pb-10 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 relative">
          
          <div className="absolute top-0 left-4 text-[10px] font-bold text-red-600 uppercase [writing-mode:vertical-rl] rotate-180 hidden lg:block">
            Establish_Protocol_v.2026
          </div>

          <div className="flex flex-col lg:flex-row gap-0">
            <div className="lg:w-3/4 border-r-0 lg:border-r-2 border-black pr-0 lg:pr-10 pb-10">
              <span className="text-red-600 font-black text-xs block mb-4 tracking-[0.3em]">/ SOURCE_BUNDLE_BOARD /</span>
              <h1 className="text-6xl md:text-[11rem] font-black uppercase tracking-[-0.05em] leading-[0.75] italic break-all">
                BUNDLE<br/>
                <span className="bg-black text-white px-4">BOARD</span>
              </h1>
            </div>

            <div className="lg:w-1/4 flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-black pb-2">
                  <span className="text-[10px] font-bold uppercase">Uptime</span>
                  <span className="text-[10px] font-black italic text-red-600">99.99%</span>
                </div>
                <div className="flex justify-between border-b border-black pb-2">
                  <span className="text-[10px] font-bold uppercase">Region</span>
                  <span className="text-[10px] font-black italic">EU_CLUSTER</span>
                </div>
                <div className="pt-4">
                  <button className="w-full h-12 bg-red-600 flex items-center justify-center font-black italic text-white -rotate-1 hover:rotate-0 transition-transform cursor-crosshair uppercase text-sm tracking-tighter">
                    GET_ACCESS_NOW
                  </button>
                </div>
              </div>
              
              <div className="mt-10 lg:mt-0 border-l-2 border-red-600 pl-4">
                <p className="text-[9px] leading-tight font-bold uppercase opacity-60">
                  Warning: High-end assets require significant GPU processing power. 
                  Unauthorized redistribution is prohibited by digital protocol.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="relative py-20 px-4 container mx-auto z-10">
        <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-black" />
        <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-black" />
        
        <div className="mb-10 flex items-center gap-4">
          <div className="h-4 w-4 bg-red-600 animate-pulse" />
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Live_Inventory_Data</h2>
          <div className="flex-grow h-[2px] bg-black opacity-20" />
          <span className="text-[10px] font-bold">VOL_001</span>
        </div>

        <CollectionGrid />
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-20 pb-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="text-5xl font-black italic uppercase mb-6 text-red-600 leading-none">BB_STATION</div>
              <p className="text-zinc-500 text-[10px] max-w-sm font-bold leading-relaxed uppercase tracking-widest">
                Developing the next generation of visual interaction. 
                Our assets are used by lead designers at top-tier studios.
              </p>
            </div>
            {['Products', 'Social'].map(title => (
              <div key={title} className="flex flex-col gap-3">
                <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">_{title}</span>
                <a className="text-[10px] font-bold uppercase hover:text-red-600 transition-colors">Data_Link_01</a>
                <a className="text-[10px] font-bold uppercase hover:text-red-600 transition-colors">Data_Link_02</a>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end border-t border-white/10 pt-8 gap-4">
            <span className="text-[10px] font-black text-zinc-700 tracking-widest">COORD: 52.2297° N, 21.0122° E</span>
            <div className="flex gap-10">
                <span className="text-[10px] font-black italic text-red-600 underline cursor-help">ENCRYPTED_AUTH</span>
                <span className="text-[10px] font-black text-zinc-600">© 2026 BUNDLEBOARD</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}