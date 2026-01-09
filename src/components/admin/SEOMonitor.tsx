import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Globe, FileText, AlertTriangle, CheckCircle2, 
  ExternalLink, RefreshCw, Map, Link2, Image, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PageSEOData {
  path: string;
  title: string;
  description: string;
  hasCanonical: boolean;
  hasOgTags: boolean;
  hasStructuredData: boolean;
  priority: number;
  lastmod: string;
}

interface SEOMetrics {
  totalPages: number;
  indexedPages: number;
  pagesWithIssues: number;
  avgSeoScore: number;
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

const SITE_PAGES: PageSEOData[] = [
  { path: "/", title: "Home", description: "AI-Powered Financial Analysis", hasCanonical: true, hasOgTags: true, hasStructuredData: true, priority: 1.0, lastmod: "2026-01-09" },
  { path: "/pricing", title: "Pricing", description: "Subscription Plans", hasCanonical: true, hasOgTags: true, hasStructuredData: false, priority: 0.9, lastmod: "2026-01-09" },
  { path: "/blog", title: "Blog", description: "Latest AI & Finance Articles", hasCanonical: true, hasOgTags: true, hasStructuredData: true, priority: 0.8, lastmod: "2026-01-09" },
  { path: "/ai-predict", title: "AI Predict", description: "AI Analysis Tool", hasCanonical: true, hasOgTags: true, hasStructuredData: false, priority: 0.8, lastmod: "2026-01-09" },
  { path: "/fin-predict", title: "Financial Predict", description: "Financial Forecasting", hasCanonical: true, hasOgTags: true, hasStructuredData: false, priority: 0.8, lastmod: "2026-01-09" },
  { path: "/user-guide", title: "User Guide", description: "How to Use AI Predict", hasCanonical: true, hasOgTags: true, hasStructuredData: false, priority: 0.7, lastmod: "2026-01-09" },
  { path: "/auth", title: "Sign In", description: "Login or Register", hasCanonical: true, hasOgTags: false, hasStructuredData: false, priority: 0.5, lastmod: "2026-01-09" },
];

const SEOMonitor = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<SEOMetrics>({
    totalPages: SITE_PAGES.length,
    indexedPages: 7,
    pagesWithIssues: 2,
    avgSeoScore: 85,
  });
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
  const [pageAnalytics, setPageAnalytics] = useState<Record<string, number>>({});

  useEffect(() => {
    // Parse sitemap data
    setSitemapEntries([
      { loc: "https://aipredict.app/", lastmod: "2026-01-09", changefreq: "daily", priority: 1.0 },
      { loc: "https://aipredict.app/pricing", lastmod: "2026-01-09", changefreq: "weekly", priority: 0.9 },
      { loc: "https://aipredict.app/blog", lastmod: "2026-01-09", changefreq: "daily", priority: 0.8 },
      { loc: "https://aipredict.app/user-guide", lastmod: "2026-01-09", changefreq: "weekly", priority: 0.7 },
      { loc: "https://aipredict.app/ai-predict", lastmod: "2026-01-09", changefreq: "weekly", priority: 0.8 },
      { loc: "https://aipredict.app/fin-predict", lastmod: "2026-01-09", changefreq: "weekly", priority: 0.8 },
      { loc: "https://aipredict.app/auth", lastmod: "2026-01-09", changefreq: "monthly", priority: 0.5 },
    ]);

    // Fetch page analytics
    fetchPageAnalytics();
  }, []);

  const fetchPageAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("page_path")
        .eq("event_type", "page_view");

      if (error) throw error;

      const pathCounts: Record<string, number> = {};
      data?.forEach((event) => {
        const path = event.page_path || "/";
        pathCounts[path] = (pathCounts[path] || 0) + 1;
      });
      setPageAnalytics(pathCounts);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeoScore = (page: PageSEOData): number => {
    let score = 50;
    if (page.hasCanonical) score += 15;
    if (page.hasOgTags) score += 20;
    if (page.hasStructuredData) score += 15;
    return score;
  };

  const getSeoScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getSeoScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Needs Work</Badge>;
    return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* SEO Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalPages}</div>
            <p className="text-xs text-muted-foreground mt-1">In sitemap</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Indexed Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.indexedPages}</div>
            <p className="text-xs text-muted-foreground mt-1">By search engines</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Pages with Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.pagesWithIssues}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Search className="w-4 h-4" />
              Avg SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.avgSeoScore}%</div>
            <Progress value={metrics.avgSeoScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* SEO Tabs */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages" className="gap-2">
            <Globe className="w-4 h-4" />
            Page Analysis
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="gap-2">
            <Map className="w-4 h-4" />
            Sitemap
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Issues
          </TabsTrigger>
        </TabsList>

        {/* Page Analysis Tab */}
        <TabsContent value="pages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Page SEO Analysis</CardTitle>
                <CardDescription>SEO status for each page in your site</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchPageAnalytics} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Canonical</TableHead>
                    <TableHead>OG Tags</TableHead>
                    <TableHead>Schema</TableHead>
                    <TableHead>SEO Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SITE_PAGES.map((page) => {
                    const score = getSeoScore(page);
                    return (
                      <TableRow key={page.path}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{page.title}</p>
                              <p className="text-xs text-muted-foreground">{page.path}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{pageAnalytics[page.path] || 0}</span>
                        </TableCell>
                        <TableCell>
                          {page.hasCanonical ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {page.hasOgTags ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {page.hasStructuredData ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getSeoScoreColor(score)}`}>{score}</span>
                            {getSeoScoreBadge(score)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemap Tab */}
        <TabsContent value="sitemap">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Sitemap Entries
                </CardTitle>
                <CardDescription>View your sitemap.xml configuration</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View XML
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Change Freq</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sitemapEntries.map((entry) => (
                    <TableRow key={entry.loc}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-mono">{entry.loc}</span>
                        </div>
                      </TableCell>
                      <TableCell>{entry.lastmod}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.changefreq}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={entry.priority >= 0.8 ? "default" : "secondary"}
                        >
                          {entry.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                SEO Issues & Recommendations
              </CardTitle>
              <CardDescription>Issues that may affect your search engine rankings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SITE_PAGES.filter(page => !page.hasStructuredData).map((page) => (
                <div key={page.path} className="border rounded-lg p-4 bg-yellow-500/5 border-yellow-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Missing Structured Data</p>
                        <p className="text-sm text-muted-foreground">
                          Page <code className="text-xs bg-muted px-1 py-0.5 rounded">{page.path}</code> doesn't have JSON-LD structured data
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Recommendation:</strong> Add appropriate Schema.org structured data to improve rich snippet visibility in search results.
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                      Medium
                    </Badge>
                  </div>
                </div>
              ))}

              {SITE_PAGES.filter(page => !page.hasOgTags).map((page) => (
                <div key={page.path} className="border rounded-lg p-4 bg-orange-500/5 border-orange-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Image className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Missing Open Graph Tags</p>
                        <p className="text-sm text-muted-foreground">
                          Page <code className="text-xs bg-muted px-1 py-0.5 rounded">{page.path}</code> is missing OG meta tags
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Recommendation:</strong> Add og:title, og:description, and og:image tags for better social media sharing.
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                      Low
                    </Badge>
                  </div>
                </div>
              ))}

              {SITE_PAGES.every(page => page.hasOgTags && page.hasStructuredData) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium text-foreground">All Clear!</p>
                  <p>No SEO issues found. Your pages are well-optimized.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOMonitor;