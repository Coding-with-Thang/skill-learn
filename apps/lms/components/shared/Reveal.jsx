"use client"

import { useEffect, useRef, useState } from 'react';

export default function Reveal({ children, className = '', rootMargin = '0px 0px -8% 0px', threshold = 0.06, once = true }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > threshold) {
          setVisible(true);
          if (once && io) io.unobserve(e.target);
        }
      });
    }, { root: null, rootMargin, threshold: [threshold] });

    io.observe(ref.current);
    return () => io.disconnect();
    // Dependencies are already included - warning is about ref.current which is intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMargin, threshold, once]);

  // default animation classes applied when visible
  const base = 'transition-all duration-700 ease-out will-change-transform';
  const hidden = 'opacity-0 translate-y-6 scale-98';
  const shown = 'opacity-100 translate-y-0 scale-100';

  return (
    <div ref={ref} className={`${base} ${visible ? shown : hidden} ${className}`}>
      {children}
    </div>
  );
}
