import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://finalyzeai.com";

const publicContentRoutes = [
  "/",
  "/blog",
  "/user-guide",
  "/about",
  "/pricing",
  "/privacy",
  "/terms",
  "/contact",
  "/ai-tools",
  "/calculators",
  "/glossary",
  "/faq",
  "/editorial-policy",
];

const isPublicContentRoute = (pathname: string) =>
  publicContentRoutes.includes(pathname) || pathname.startsWith("/blog/");

const pageCopy = (pathname: string) => {
  if (pathname.startsWith("/blog/")) {
    return {
      title: "Financial Analysis Guide - FinalyzeAI Blog",
      description: "Read practical FinalyzeAI guides on AI Predict, financial statements, forecasting, fraud detection, benchmarking, and cash-flow analysis.",
    };
  }

  switch (pathname) {
    case "/blog":
      return {
        title: "Finance Guides & AI Predict Articles - FinalyzeAI",
        description: "Explore original articles on financial analysis, AI Predict workflows, cash-flow forecasting, fraud detection, and business metrics.",
      };
    case "/user-guide":
      return {
        title: "FinalyzeAI User Guide - AI Predict Help",
        description: "Learn how to use FinalyzeAI for document uploads, AI Predict analysis, financial forecasting, visualizations, and secure workflows.",
      };
    case "/about":
      return {
        title: "About FinalyzeAI - AI Financial Analysis",
        description: "FinalyzeAI helps analysts, founders, and investors turn financial documents into clear AI-powered insights, forecasts, and risk analysis.",
      };
    case "/pricing":
      return {
        title: "FinalyzeAI Pricing - AI Predict Plans",
        description: "Compare FinalyzeAI plans for AI Predict, document uploads, financial analysis limits, forecasting, and reporting workflows.",
      };
    case "/privacy":
      return {
        title: "Privacy Policy - FinalyzeAI",
        description: "Read how FinalyzeAI handles account data, financial documents, AI processing, cookies, advertising, privacy rights, and security.",
      };
    case "/terms":
      return {
        title: "Terms of Service - FinalyzeAI",
        description: "Review the terms for using FinalyzeAI's AI Predict tools, financial analysis features, subscriptions, and document workflows.",
      };
    case "/contact":
      return {
        title: "Contact FinalyzeAI - Support, Sales, Press",
        description: "Reach the FinalyzeAI team for support, partnerships, billing, press inquiries, and feedback. Email, phone, and LinkedIn contact details.",
      };
    case "/ai-tools":
      return {
        title: "AI Tools Directory - 70+ Best AI Tools - FinalyzeAI",
        description: "Curated directory of 70+ AI tools across chat, presentations, writing, coding, image, video, audio, productivity, and research.",
      };
    case "/calculators":
      return {
        title: "Free Financial Calculators - DCF, ROI, Loan, Runway - FinalyzeAI",
        description: "Six free professional financial calculators: DCF valuation, ROI/CAGR, loan amortization, break-even, burn rate runway, and ratio analysis.",
      };
    default:
      return {
        title: "FinalyzeAI - AI Financial Analysis Platform",
        description: "Analyze financial documents, cash flow, ratios, forecasts, and fraud risks with FinalyzeAI's AI Predict tools and finance guides.",
      };
  }
};

const upsertMeta = (selector: string, create: () => HTMLMetaElement, value: string) => {
  const tag = document.head.querySelector<HTMLMetaElement>(selector) ?? create();
  tag.setAttribute("content", value);
};

const RouteMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const indexed = isPublicContentRoute(pathname);
    const canonicalPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const { title, description } = pageCopy(pathname);

    document.title = title;
    upsertMeta('meta[name="description"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
      return meta;
    }, description);
    upsertMeta('meta[name="robots"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
      return meta;
    }, indexed ? "index, follow" : "noindex, nofollow");

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", canonicalUrl);
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, [pathname]);

  return null;
};

export default RouteMeta;