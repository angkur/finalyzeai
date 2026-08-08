import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Link2 } from "lucide-react";

interface ShareResultProps {
  type: string;
  params: Record<string, number | string>;
  label?: string;
}

export const buildShareUrl = (type: string, params: Record<string, number | string>) => {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const origin = typeof window !== "undefined" ? window.location.origin : "https://finalyzeai.com";
  return `${origin}/r/${type}?${qs}`;
};

const ShareResult = ({ type, params, label = "Share this result" }: ShareResultProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = buildShareUrl(type, params);
    try {
      if (navigator.share) {
        await navigator.share({ title: "My FinalyzeAI result", url });
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={handleShare}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
      {copied ? "Link copied" : label}
    </Button>
  );
};

export default ShareResult;
