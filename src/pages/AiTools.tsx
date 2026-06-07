import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Sparkles } from "lucide-react";

type Tool = {
  name: string;
  url: string;
  category: string;
  description: string;
  bestFor: string;
  pricing: "Free" | "Freemium" | "Paid";
};

const TOOLS: Tool[] = [
  // Chat / Reasoning
  { name: "ChatGPT", url: "https://chat.openai.com", category: "Chat & Reasoning", description: "OpenAI's flagship conversational AI for writing, coding, brainstorming, and research.", bestFor: "General-purpose chat & GPT-5 reasoning", pricing: "Freemium" },
  { name: "Claude", url: "https://claude.ai", category: "Chat & Reasoning", description: "Anthropic's AI assistant known for long context, nuanced writing, and safe reasoning.", bestFor: "Long documents, coding, thoughtful writing", pricing: "Freemium" },
  { name: "Google Gemini", url: "https://gemini.google.com", category: "Chat & Reasoning", description: "Google's multimodal AI integrated with Search, Docs, and Gmail.", bestFor: "Multimodal tasks + Google Workspace", pricing: "Freemium" },
  { name: "Perplexity", url: "https://perplexity.ai", category: "Chat & Reasoning", description: "AI search engine that cites live web sources for every answer.", bestFor: "Research with citations", pricing: "Freemium" },
  { name: "Grok", url: "https://grok.x.ai", category: "Chat & Reasoning", description: "xAI's assistant with real-time X (Twitter) data access.", bestFor: "Real-time news & trends", pricing: "Paid" },
  { name: "DeepSeek", url: "https://chat.deepseek.com", category: "Chat & Reasoning", description: "Open-source reasoning model strong at math and code.", bestFor: "Free advanced reasoning", pricing: "Free" },

  // Presentations
  { name: "Gamma", url: "https://gamma.app", category: "Presentations", description: "Generate beautiful presentations, docs, and webpages from a single prompt.", bestFor: "AI-generated slide decks", pricing: "Freemium" },
  { name: "Tome", url: "https://tome.app", category: "Presentations", description: "AI storytelling format for pitch decks and narrative presentations.", bestFor: "Pitch decks & storytelling", pricing: "Freemium" },
  { name: "Beautiful.ai", url: "https://www.beautiful.ai", category: "Presentations", description: "Smart templates that auto-adjust slide design as you edit.", bestFor: "Polished business slides", pricing: "Paid" },
  { name: "Decktopus", url: "https://www.decktopus.com", category: "Presentations", description: "One-click AI presentation builder with speaker notes.", bestFor: "Quick presentations", pricing: "Freemium" },
  { name: "SlidesAI", url: "https://www.slidesai.io", category: "Presentations", description: "Turns text into Google Slides automatically.", bestFor: "Google Slides users", pricing: "Freemium" },

  // Writing
  { name: "Jasper", url: "https://jasper.ai", category: "Writing", description: "Marketing-focused AI writer for blogs, ads, and campaigns.", bestFor: "Marketing copy", pricing: "Paid" },
  { name: "Copy.ai", url: "https://copy.ai", category: "Writing", description: "AI content generator for emails, social, and product copy.", bestFor: "Short-form copy", pricing: "Freemium" },
  { name: "Grammarly", url: "https://grammarly.com", category: "Writing", description: "AI grammar, tone, and clarity assistant across the web.", bestFor: "Editing & proofreading", pricing: "Freemium" },
  { name: "Notion AI", url: "https://notion.so/product/ai", category: "Writing", description: "AI built into Notion for summaries, writing, and Q&A on your docs.", bestFor: "Notes & knowledge bases", pricing: "Paid" },
  { name: "QuillBot", url: "https://quillbot.com", category: "Writing", description: "Paraphrasing, summarizing, and citation tools.", bestFor: "Rewriting & summaries", pricing: "Freemium" },

  // Image
  { name: "Midjourney", url: "https://midjourney.com", category: "Image Generation", description: "Highest-quality artistic image generation, runs via Discord and web.", bestFor: "Artistic visuals", pricing: "Paid" },
  { name: "DALL·E 3", url: "https://openai.com/dall-e-3", category: "Image Generation", description: "OpenAI's image model integrated into ChatGPT.", bestFor: "Prompt-accurate images", pricing: "Freemium" },
  { name: "Stable Diffusion", url: "https://stability.ai", category: "Image Generation", description: "Open-source image generation you can self-host.", bestFor: "Open-source / custom workflows", pricing: "Free" },
  { name: "Leonardo.ai", url: "https://leonardo.ai", category: "Image Generation", description: "Game-asset and concept-art focused image generation.", bestFor: "Game art & concepts", pricing: "Freemium" },
  { name: "Ideogram", url: "https://ideogram.ai", category: "Image Generation", description: "Best-in-class text rendering inside generated images.", bestFor: "Images with readable text", pricing: "Freemium" },

  // Video
  { name: "Sora", url: "https://sora.com", category: "Video", description: "OpenAI's text-to-video model for cinematic clips.", bestFor: "Realistic short videos", pricing: "Paid" },
  { name: "Runway", url: "https://runwayml.com", category: "Video", description: "Pro-grade AI video generation and editing (Gen-3).", bestFor: "Creative video production", pricing: "Freemium" },
  { name: "Pika", url: "https://pika.art", category: "Video", description: "Fast text/image-to-video generator with fun effects.", bestFor: "Short social videos", pricing: "Freemium" },
  { name: "HeyGen", url: "https://heygen.com", category: "Video", description: "AI avatars and talking-head videos in 40+ languages.", bestFor: "AI avatar videos", pricing: "Freemium" },
  { name: "Synthesia", url: "https://synthesia.io", category: "Video", description: "Enterprise AI avatar videos for training & marketing.", bestFor: "Corporate training videos", pricing: "Paid" },

  // Audio
  { name: "ElevenLabs", url: "https://elevenlabs.io", category: "Audio & Voice", description: "Hyper-realistic voice cloning and text-to-speech.", bestFor: "Voiceovers & cloning", pricing: "Freemium" },
  { name: "Suno", url: "https://suno.com", category: "Audio & Voice", description: "Generate full songs with vocals from a text prompt.", bestFor: "AI music generation", pricing: "Freemium" },
  { name: "Udio", url: "https://udio.com", category: "Audio & Voice", description: "High-fidelity AI music generation rivaling Suno.", bestFor: "AI music production", pricing: "Freemium" },
  { name: "Murf", url: "https://murf.ai", category: "Audio & Voice", description: "Studio-quality AI voiceovers for videos and podcasts.", bestFor: "Professional voiceovers", pricing: "Paid" },

  // Coding
  { name: "Lovable", url: "https://lovable.dev", category: "Coding & Dev", description: "Build full-stack web apps by chatting with AI.", bestFor: "No-code AI app building", pricing: "Freemium" },
  { name: "Cursor", url: "https://cursor.com", category: "Coding & Dev", description: "AI-first code editor (fork of VS Code) with deep Claude/GPT integration.", bestFor: "AI pair programming", pricing: "Freemium" },
  { name: "GitHub Copilot", url: "https://github.com/features/copilot", category: "Coding & Dev", description: "AI autocomplete and chat inside your IDE.", bestFor: "In-IDE code completion", pricing: "Paid" },
  { name: "v0", url: "https://v0.dev", category: "Coding & Dev", description: "Vercel's AI UI generator for React + Tailwind components.", bestFor: "Generating UI components", pricing: "Freemium" },
  { name: "Bolt.new", url: "https://bolt.new", category: "Coding & Dev", description: "Prompt-to-app builder running fullstack in browser.", bestFor: "Quick prototypes", pricing: "Freemium" },

  // Productivity
  { name: "Otter.ai", url: "https://otter.ai", category: "Productivity", description: "AI meeting notes, transcripts, and summaries.", bestFor: "Meeting transcription", pricing: "Freemium" },
  { name: "Fireflies", url: "https://fireflies.ai", category: "Productivity", description: "AI notetaker that joins your meetings automatically.", bestFor: "Meeting automation", pricing: "Freemium" },
  { name: "Zapier AI", url: "https://zapier.com/ai", category: "Productivity", description: "Build AI-powered automations across 6,000+ apps.", bestFor: "Workflow automation", pricing: "Freemium" },

  // Research / Data
  { name: "Consensus", url: "https://consensus.app", category: "Research & Data", description: "AI search across 200M+ scientific papers.", bestFor: "Academic research", pricing: "Freemium" },
  { name: "Elicit", url: "https://elicit.com", category: "Research & Data", description: "AI research assistant for systematic literature review.", bestFor: "Literature reviews", pricing: "Freemium" },
  { name: "NotebookLM", url: "https://notebooklm.google", category: "Research & Data", description: "Google's source-grounded notebook — upload docs and chat with them.", bestFor: "Studying your own sources", pricing: "Free" },
  { name: "FinalyzeAI", url: "https://finalyzeai.com", category: "Research & Data", description: "AI-powered financial document analysis, forecasting, and fraud detection.", bestFor: "Financial analysis", pricing: "Freemium" },

  // ===== Hidden Gems / Lesser-Known AI Tools =====
  { name: "Phind", url: "https://phind.com", category: "Coding & Dev", description: "AI search engine built specifically for developers — answers with code + sources.", bestFor: "Developer-focused AI search", pricing: "Freemium" },
  { name: "Cody by Sourcegraph", url: "https://sourcegraph.com/cody", category: "Coding & Dev", description: "AI coding assistant that understands your entire codebase context.", bestFor: "Large codebase navigation", pricing: "Freemium" },
  { name: "Continue.dev", url: "https://continue.dev", category: "Coding & Dev", description: "Open-source autopilot for VS Code & JetBrains — bring any LLM.", bestFor: "Customizable open-source Copilot", pricing: "Free" },
  { name: "Aider", url: "https://aider.chat", category: "Coding & Dev", description: "Terminal-based AI pair programmer that edits files & commits to git.", bestFor: "CLI-first AI coding", pricing: "Free" },

  { name: "Krisp", url: "https://krisp.ai", category: "Audio & Voice", description: "AI noise & echo cancellation that works on any call app.", bestFor: "Clean call audio anywhere", pricing: "Freemium" },
  { name: "Adobe Podcast (Enhance)", url: "https://podcast.adobe.com", category: "Audio & Voice", description: "Free AI speech enhancer that makes any recording sound studio-quality.", bestFor: "Cleaning podcast/voice audio", pricing: "Free" },
  { name: "Whisper Web", url: "https://huggingface.co/spaces/Xenova/whisper-web", category: "Audio & Voice", description: "Browser-based OpenAI Whisper transcription — no upload, runs locally.", bestFor: "Private transcription", pricing: "Free" },
  { name: "PlayHT", url: "https://play.ht", category: "Audio & Voice", description: "Realistic AI voices and voice cloning for podcasts & IVR.", bestFor: "Long-form voice generation", pricing: "Freemium" },

  { name: "Recraft", url: "https://recraft.ai", category: "Image Generation", description: "Vector + raster AI image gen with brand-style consistency.", bestFor: "Brand-consistent vectors & icons", pricing: "Freemium" },
  { name: "Flux (BFK)", url: "https://blackforestlabs.ai", category: "Image Generation", description: "State-of-the-art open-weights image model from Black Forest Labs.", bestFor: "Open-source photorealism", pricing: "Free" },
  { name: "Magnific", url: "https://magnific.ai", category: "Image Generation", description: "Insane AI image upscaler & enhancer with hallucinated detail.", bestFor: "Upscaling & detail enhancement", pricing: "Paid" },
  { name: "Krea", url: "https://krea.ai", category: "Image Generation", description: "Real-time AI image & video generation with live canvas.", bestFor: "Real-time generative canvas", pricing: "Freemium" },
  { name: "Clipdrop", url: "https://clipdrop.co", category: "Image Generation", description: "Suite of AI image utilities: remove bg, relight, uncrop, replace.", bestFor: "Quick photo edits", pricing: "Freemium" },

  { name: "Kling AI", url: "https://klingai.com", category: "Video", description: "Chinese-built text/image-to-video model rivaling Sora in realism.", bestFor: "Cinematic AI video (free tier)", pricing: "Freemium" },
  { name: "Hailuo (MiniMax)", url: "https://hailuoai.video", category: "Video", description: "Free high-quality text-to-video from MiniMax.", bestFor: "Free realistic short clips", pricing: "Free" },
  { name: "LTX Studio", url: "https://ltx.studio", category: "Video", description: "AI-driven storyboarding & video production from a script.", bestFor: "Full storyboard-to-video workflow", pricing: "Freemium" },
  { name: "Captions", url: "https://captions.ai", category: "Video", description: "AI video editor with eye contact, dubbing, and auto captions.", bestFor: "Talking-head creator videos", pricing: "Freemium" },

  { name: "Granola", url: "https://granola.ai", category: "Productivity", description: "AI notepad that listens to your meetings and enhances your notes (no bot joins).", bestFor: "Private meeting notes", pricing: "Freemium" },
  { name: "Mem", url: "https://mem.ai", category: "Productivity", description: "Self-organizing AI notes app that connects ideas automatically.", bestFor: "Second brain / smart notes", pricing: "Freemium" },
  { name: "Reclaim.ai", url: "https://reclaim.ai", category: "Productivity", description: "AI calendar that auto-schedules tasks, habits, and meetings.", bestFor: "Smart calendar scheduling", pricing: "Freemium" },
  { name: "Magical", url: "https://getmagical.com", category: "Productivity", description: "AI text-expander & autofill that automates repetitive typing across apps.", bestFor: "Eliminating repetitive typing", pricing: "Freemium" },
  { name: "Bardeen", url: "https://bardeen.ai", category: "Productivity", description: "AI browser automation — scrape, fill, and move data without code.", bestFor: "No-code browser automation", pricing: "Freemium" },

  { name: "Scite.ai", url: "https://scite.ai", category: "Research & Data", description: "Smart citations showing how papers support or contrast claims.", bestFor: "Citation-aware research", pricing: "Freemium" },
  { name: "ResearchRabbit", url: "https://researchrabbitapp.com", category: "Research & Data", description: "Visual paper discovery — Spotify for academic literature.", bestFor: "Discovering related papers", pricing: "Free" },
  { name: "SciSpace", url: "https://typeset.io", category: "Research & Data", description: "Chat with PDFs of research papers and decode jargon.", bestFor: "Understanding research papers", pricing: "Freemium" },
  { name: "Julius AI", url: "https://julius.ai", category: "Research & Data", description: "Upload spreadsheets and analyze/visualize them via natural language.", bestFor: "AI data analysis on CSVs", pricing: "Freemium" },

  { name: "Rytr", url: "https://rytr.me", category: "Writing", description: "Affordable AI writer for 40+ use cases & 30+ languages.", bestFor: "Budget AI writing", pricing: "Freemium" },
  { name: "Lex", url: "https://lex.page", category: "Writing", description: "Writer-first doc editor with built-in AI for long-form prose.", bestFor: "Long-form writing flow", pricing: "Freemium" },
  { name: "Sudowrite", url: "https://sudowrite.com", category: "Writing", description: "AI specifically tuned for fiction writers — brainstorm, expand, rewrite.", bestFor: "Fiction & novel writing", pricing: "Paid" },

  { name: "Poe", url: "https://poe.com", category: "Chat & Reasoning", description: "Quora's hub for chatting with GPT, Claude, Gemini, Llama in one place.", bestFor: "Multi-model chat under one sub", pricing: "Freemium" },
  { name: "You.com", url: "https://you.com", category: "Chat & Reasoning", description: "AI search + multi-model chat with custom agents.", bestFor: "AI search alternative", pricing: "Freemium" },
  { name: "Kagi Assistant", url: "https://kagi.com/assistant", category: "Chat & Reasoning", description: "Privacy-first multi-LLM assistant from the Kagi search team.", bestFor: "Private multi-LLM chat", pricing: "Paid" },
];

const CATEGORIES = ["All", ...Array.from(new Set(TOOLS.map((t) => t.category)))];

const pricingVariant = (p: Tool["pricing"]) =>
  p === "Free" ? "default" : p === "Freemium" ? "secondary" : "outline";

const AiTools = () => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TOOLS.filter((t) => {
      const inCat = active === "All" || t.category === active;
      const inQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.bestFor.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [query, active]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="container px-4 md:px-6 pt-32 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="w-3 h-3" /> Curated AI Directory
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Useful AI Tools & Websites
          </h1>
          <p className="text-muted-foreground text-lg">
            A hand-picked directory of the best AI tools for presentations, writing, coding,
            video, audio, research, and more — with what each one is best for.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tools (e.g. presentation, video, coding)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={active === c ? "default" : "outline"}
              onClick={() => setActive(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <Card key={tool.name} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{tool.name}</CardTitle>
                  <Badge variant={pricingVariant(tool.pricing)}>{tool.pricing}</Badge>
                </div>
                <Badge variant="outline" className="w-fit text-xs">{tool.category}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                <p className="text-sm text-muted-foreground flex-1">{tool.description}</p>
                <p className="text-xs">
                  <span className="text-muted-foreground">Best for: </span>
                  <span className="font-medium text-foreground">{tool.bestFor}</span>
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">
            No tools match your search.
          </p>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default AiTools;
