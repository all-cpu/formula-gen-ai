"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type AdSlotProps = {
  className?: string;
  adClient?: string;
  adSlot?: string;
};

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export default function AdSlot({
  className = "",
  adClient = "",
  adSlot = "",
}: AdSlotProps) {
  const { language } = useLanguage();
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    setIsLocal(LOCAL_HOSTNAMES.has(window.location.hostname));
  }, []);

  const label = language === "zh" ? "广告" : "Advertisement";
  const containerClass = [
    "min-h-[96px] w-full max-w-full overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-100 text-slate-400",
    className,
  ].filter(Boolean).join(" ");

  if (isLocal) {
    return (
      <div className={containerClass} role="region" aria-label={label}>
        <span className="block px-3 pt-2 text-[10px] font-semibold uppercase tracking-widest">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={containerClass}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      role="region"
      aria-label={label}
    >
      <span className="block px-3 pt-2 text-[10px] font-semibold uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
