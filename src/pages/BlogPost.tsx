import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts } from "./Blog";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Play, Video } from "lucide-react";
import { useAdSense } from "@/hooks/useAdSense";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import AdSlot from "@/components/AdSlot";

// Video embed component for tutorials - supports YouTube and placeholder videos
const VideoEmbed = ({ id, title, description, duration }: { id: string; title: string; description: string; duration: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  
  // Check if it's a YouTube video ID (11 characters, alphanumeric with - and _)
  const isYouTubeId = /^[a-zA-Z0-9_-]{11}$/.test(id);
  
  // Fallback gradient colors for placeholders
  const thumbnailColors: Record<string, string> = {
    'getting-started': 'from-blue-500 to-cyan-500',
    'ai-predict-deep-dive': 'from-purple-500 to-pink-500',
    'document-management': 'from-green-500 to-emerald-500',
    'fin-predict-visualizations': 'from-orange-500 to-amber-500',
    'advanced-features': 'from-red-500 to-rose-500',
    'mobile-pwa': 'from-indigo-500 to-violet-500',
  };

  const gradientClass = thumbnailColors[id] || 'from-primary to-primary/70';
  const youTubeThumbnail = isYouTubeId ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border bg-card">
      {isPlaying && isYouTubeId ? (
        // YouTube iframe embed
        <div className="relative aspect-video bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <div 
          className={`relative aspect-video cursor-pointer group ${
            isYouTubeId && !thumbnailError 
              ? 'bg-black' 
              : `bg-gradient-to-br ${gradientClass}`
          }`}
          onClick={() => setIsPlaying(true)}
        >
          {/* YouTube thumbnail */}
          {isYouTubeId && !thumbnailError && youTubeThumbnail && (
            <img 
              src={youTubeThumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setThumbnailError(true)}
            />
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </div>
          
          {/* Video info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2 text-white/90">
              <Video className="w-5 h-5" />
              <span className="font-medium">{title}</span>
              <Badge variant="secondary" className="ml-auto bg-black/50 text-white border-0">
                {duration}
              </Badge>
            </div>
          </div>
          
          {/* Placeholder message for non-YouTube videos */}
          {!isYouTubeId && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                Coming Soon
              </Badge>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        {isYouTubeId && isPlaying && (
          <Button 
            variant="ghost" 
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={() => setIsPlaying(false)}
          >
            Close Video
          </Button>
        )}
      </div>
    </div>
  );
};

const BlogPost = () => {
  useAdSense();
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container px-6 text-center">
            <h1 className="text-4xl font-display font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/blog")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Get related posts (same category, different post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Parse markdown-like content to JSX
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={elements.length} className="mb-4 text-muted-foreground leading-relaxed">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line) => {
      // Handle video embeds: [VIDEO:id:title:description:duration]
      const videoMatch = line.match(/^\[VIDEO:([^:]+):([^:]+):([^:]+):([^\]]+)\]$/);
      if (videoMatch) {
        flushParagraph();
        elements.push(
          <VideoEmbed
            key={elements.length}
            id={videoMatch[1]}
            title={videoMatch[2]}
            description={videoMatch[3]}
            duration={videoMatch[4]}
          />
        );
      } else if (line.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={elements.length} className="text-2xl font-display font-bold mt-8 mb-4 text-foreground">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        flushParagraph();
        elements.push(
          <p key={elements.length} className="font-semibold text-foreground mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      } else if (line.startsWith('- ')) {
        flushParagraph();
        elements.push(
          <li key={elements.length} className="ml-6 mb-2 text-muted-foreground list-disc">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim() === '') {
        flushParagraph();
      } else {
        // Handle inline bold text
        const processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        currentParagraph.push(processedLine);
      }
    });

    flushParagraph();
    return elements;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/blog")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          {/* Article Header */}
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {post.icon}
                </div>
                <Badge variant="secondary">{post.category}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {post.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {post.excerpt}
              </p>

              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground border-b border-border pb-6">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
                <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Ad slot - top of article (replace slot ID with your real AdSense unit) */}
            <AdSlot slot="3345503198" format="auto" />

            {/* Article Content */}
            <article className="prose prose-lg max-w-none">
              {renderContent(post.content)}
            </article>

            {/* Ad slot - bottom of article */}
            <AdSlot slot="3345503198" format="auto" />

            {/* Tags */}
            <div className="flex items-center gap-2 mt-8 pt-8 border-t border-border">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline">{post.category}</Badge>
              <Badge variant="outline">FinanceAI</Badge>
              <Badge variant="outline">Financial Analysis</Badge>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16">
                <h3 className="text-2xl font-display font-bold mb-6">Related Articles</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <Card
                      key={relatedPost.id}
                      className="cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    >
                      <CardContent className="p-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                          {relatedPost.icon}
                        </div>
                        <h4 className="font-medium line-clamp-2 mb-2">{relatedPost.title}</h4>
                        <span className="text-xs text-muted-foreground">{relatedPost.readTime}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <Card className="mt-16 bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-display font-bold mb-2">Ready to Try FinanceAI?</h3>
                <p className="text-muted-foreground mb-4">
                  Experience AI-powered financial analysis for yourself.
                </p>
                <Button onClick={() => navigate("/#demo")}>
                  Try AI Predict
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
