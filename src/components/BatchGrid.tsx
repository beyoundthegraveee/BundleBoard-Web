"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function BatchGrid({ children, className }: { children: React.ReactNode, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = gsap.utils.selector(containerRef);
    const mm = gsap.matchMedia(containerRef);

    mm.add({
      isDesktop: "(min-width: 1280px)",
      isMobile: "(max-width: 1279px)"
    }, (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean; isMobile: boolean };
      const columns = isDesktop ? 3 : 2;

      const items = q(".batch-item");

      if (items.length === 0) return;

      gsap.set(items, { y: 100, opacity: 0 });

      ScrollTrigger.batch(items, {
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
  }, [children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}