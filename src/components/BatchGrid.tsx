"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function BatchGrid({ children, className }: { children: React.ReactNode, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(containerRef);

    mm.add({
      isDesktop: "(min-width: 1280px)",
      isMobile: "(max-width: 1279px)"
    }, (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean; isMobile: boolean };
      
      const columns = isDesktop ? 3 : 2;

      gsap.set(".batch-item", { y: 100, opacity: 0 });

      ScrollTrigger.batch(".batch-item", {
        interval: 0.1,
        batchMax: columns,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, 
          y: 0, 
          stagger: { each: 0.15, grid: [1, columns] },
          overwrite: true
        }),
        onLeave: (batch) => gsap.to(batch, { opacity: 0, y: -100, duration: 0.5, overwrite: true }),
        onEnterBack: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, overwrite: true }),
        onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, y: 100, duration: 0.5, overwrite: true })
      });
    });

    return () => mm.revert(); 
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}