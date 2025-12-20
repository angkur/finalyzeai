import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  FileText, 
  Activity, 
  Upload, 
  Calendar, 
  ArrowLeft, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  BarChart3,
  Database
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalysisDetailDialog from "@/components/AnalysisDetailDialog";

interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
}

interface Interaction {
  id: string;
  query: string;
  response: string;
  analysis_type: string;
  rating: number | null;
  created_at: string;
}

interface Stats {
  totalDocuments: number;
  completedDocuments: number;
  totalInteractions: number;
  averageRating: number | null;
}

const ITEMS_PER_PAGE = 10;

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    completedDocuments: 0,
    totalInteractions: 0,
    averageRating: null,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Interaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreInteractions, setHasMoreInteractions] = useState(true);
  const [hasMoreDocuments, setHasMoreDocuments] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    setIsLoadingData(true);

    try {
      // Fetch documents
      const { data: docs, error: docsError } = await supabase
        .from("documents")
        .select("id, name, file_type, file_size, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(ITEMS_PER_PAGE);

      if (!docsError && docs) {
        setDocuments(docs);
        setHasMoreDocuments(docs.length === ITEMS_PER_PAGE);
      }

      // Fetch interactions with full response
      const { data: ints, error: intsError } = await supabase
        .from("interactions")
        .select("id, query, response, analysis_type, rating, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(ITEMS_PER_PAGE);

      if (!intsError && ints) {
        setInteractions(ints);
        setHasMoreInteractions(ints.length === ITEMS_PER_PAGE);
      }

      // Calculate stats
      const { count: totalDocs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: completedDocs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed");

      const { count: totalInts } = await supabase
        .from("interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { data: ratingData } = await supabase
        .from("interactions")
        .select("rating")
        .eq("user_id", user.id)
        .not("rating", "is", null);

      let avgRating = null;
      if (ratingData && ratingData.length > 0) {
        const sum = ratingData.reduce((acc, r) => acc + (r.rating || 0), 0);
        avgRating = Math.round((sum / ratingData.length) * 10) / 10;
      }

      setStats({
        totalDocuments: totalDocs || 0,
        completedDocuments: completedDocs || 0,
        totalInteractions: totalInts || 0,
        averageRating: avgRating,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadMoreInteractions = async () => {
    if (!user || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const { data: ints, error } = await supabase
        .from("interactions")
        .select("id, query, response, analysis_type, rating, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(interactions.length, interactions.length + ITEMS_PER_PAGE - 1);

      if (!error && ints) {
        setInteractions((prev) => [...prev, ...ints]);
        setHasMoreInteractions(ints.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error("Error loading more interactions:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMoreDocuments = async () => {
    if (!user || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const { data: docs, error } = await supabase
        .from("documents")
        .select("id, name, file_type, file_size, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(documents.length, documents.length + ITEMS_PER_PAGE - 1);

      if (!error && docs) {
        setDocuments((prev) => [...prev, ...docs]);
        setHasMoreDocuments(docs.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error("Error loading more documents:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({ full_name: fullName });
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "data-visualization":
        return <BarChart3 className="w-4 h-4 text-primary" />;
      case "rag-query":
        return <Database className="w-4 h-4 text-accent" />;
      default:
        return <Brain className="w-4 h-4 text-primary" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 container px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {profile?.full_name || "User Profile"}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Member since {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Documents</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {stats.totalDocuments}
              </p>
            </div>
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Processed</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {stats.completedDocuments}
              </p>
            </div>
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Analyses</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {stats.totalInteractions}
              </p>
            </div>
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">⭐</span>
                <span className="text-xs text-muted-foreground">Avg Rating</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {stats.averageRating !== null ? stats.averageRating : "-"}
              </p>
            </div>
          </div>

          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <div className="bg-gradient-card rounded-2xl border border-border/50 p-6">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Analyses
                  {stats.totalInteractions > 0 && (
                    <span className="text-xs text-muted-foreground font-normal ml-2">
                      ({interactions.length} of {stats.totalInteractions})
                    </span>
                  )}
                </h3>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : interactions.length > 0 ? (
                  <div className="space-y-3">
                    {interactions.map((interaction) => (
                      <div
                        key={interaction.id}
                        onClick={() => {
                          setSelectedAnalysis(interaction);
                          setIsDialogOpen(true);
                        }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30 cursor-pointer hover:bg-secondary/50 hover:border-primary/30 transition-colors"
                      >
                        {getAnalysisIcon(interaction.analysis_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {interaction.query.substring(0, 80)}
                            {interaction.query.length > 80 ? "..." : ""}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {interaction.analysis_type}
                            </span>
                            {interaction.rating && (
                              <span className="text-xs text-muted-foreground">
                                ⭐ {interaction.rating}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(interaction.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {hasMoreInteractions && (
                      <div className="pt-4 flex justify-center">
                        <Button
                          variant="outline"
                          onClick={loadMoreInteractions}
                          disabled={isLoadingMore}
                          className="gap-2"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Load More"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No analyses yet. Try the AI Demo to get started!
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="bg-gradient-card rounded-2xl border border-border/50 p-6">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Your Documents
                  {stats.totalDocuments > 0 && (
                    <span className="text-xs text-muted-foreground font-normal ml-2">
                      ({documents.length} of {stats.totalDocuments})
                    </span>
                  )}
                </h3>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(doc.file_size)} • {doc.file_type} •{" "}
                              {formatDate(doc.created_at)}
                            </p>
                          </div>
                        </div>
                        {getStatusIcon(doc.status)}
                      </div>
                    ))}
                    
                    {hasMoreDocuments && (
                      <div className="pt-4 flex justify-center">
                        <Button
                          variant="outline"
                          onClick={loadMoreDocuments}
                          disabled={isLoadingMore}
                          className="gap-2"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Load More"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No documents uploaded yet. Use the Knowledge Base feature to upload documents.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="bg-gradient-card rounded-2xl border border-border/50 p-6">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Profile Settings
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <Button
                    variant="hero"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AnalysisDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        analysis={selectedAnalysis}
      />
    </div>
  );
};

export default Profile;
