import { useEffect } from "react";

/**
 * Loads the Google AdSense script only on content-rich, public pages.
 * Per AdSense policy, ads must NOT appear on pages without publisher content
 * (login, dashboards, app screens). Call this hook ONLY from approved pages:
 * Home, Blog list, Blog post, User Guide, Pricing, About, Privacy, Terms, Contact.
 */
const ADSENSE_CLIENT = "ca-pub-8410008511726740";
const SCRIPT_ID = "google-adsense-script";

export const useAdSense = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
  }, []);
};

export default useAdSense;
