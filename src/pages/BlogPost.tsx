import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts } from "./Blog";
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const BlogPost = () => {
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
      if (line.startsWith('## ')) {
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

            {/* Article Content */}
            <article className="prose prose-lg max-w-none">
              {renderContent(post.content)}
            </article>

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
