"use client";

import { useEffect, useState } from "react";

export default function AnimatedCounter({
  value,
  duration = 600,
}: {
  value: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;

    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span className="tabular-nums">{count.toLocaleString()}</span>;
}
