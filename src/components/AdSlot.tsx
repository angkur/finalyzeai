import { useEffect, useRef } from "react";

interface AdSlotProps {
  /** AdSense ad unit slot ID (from your AdSense dashboard). */
  slot: string;
  /** Ad format. Defaults to "auto" responsive. */
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  /** Whether the ad is full-width responsive. */
  fullWidthResponsive?: boolean;
  /** Optional layout key for in-feed/in-article. */
  layout?: string;
  /** Optional layout key. */
  layoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ADSENSE_CLIENT = "ca-pub-8410008511726740";

/**
 * Renders a Google AdSense ad slot. The AdSense script must already be loaded
 * (use the useAdSense hook on the parent page).
 *
 * IMPORTANT: This will only render real ads after AdSense has approved your site
 * AND you have created an actual ad unit in your AdSense dashboard whose slot ID
 * is passed via the `slot` prop.
 */
export const AdSlot = ({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  layout,
  layoutKey,
  className = "",
  style,
}: AdSlotProps) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    if (typeof window === "undefined") return;
    try {
      // @ts-expect-error - adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      // Script may not be loaded yet (e.g., dev environment); silently ignore.
      console.debug("AdSense push skipped:", e);
    }
  }, []);

  return (
    <div className={`my-8 flex flex-col items-center w-full ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">
        Advertisement
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: 100, width: "100%", ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </div>
  );
};

export default AdSlot;
