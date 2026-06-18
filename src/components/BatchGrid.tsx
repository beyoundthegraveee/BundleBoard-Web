"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function BatchGrid({ children, className }: { children: React.ReactNode, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".batch-item", { y: 100, opacity: 0 });

      ScrollTrigger.batch(".batch-item", {
        interval: 0.1,
        batchMax: 3,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, 
          y: 0, 
          stagger: { each: 0.15, grid: [1, 3] }, 
          overwrite: true
        }),
        onLeave: (batch) => gsap.set(batch, { opacity: 0, y: -100, overwrite: true }),
        onEnterBack: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, overwrite: true }),
        onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 100, overwrite: true })
      });
    }, containerRef);

    return () => ctx.revert(); // Очистка при размонтировании
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}