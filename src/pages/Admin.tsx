import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Shield, Users, BarChart3, FileText, Brain, 
  ArrowLeft, Settings, Activity, Ban, Check,
  Eye, Loader2, MessageSquare, Trash2, Mail, CheckCheck, Search, Database
} from "lucide-react";
import SEOMonitor from "@/components/admin/SEOMonitor";
import DataCleanupPanel from "@/components/admin/DataCleanupPanel";

interface AdminStats {
  totalUsers: number;
  totalInteractions: number;
  totalDocuments: number;
  todayInteractions: number;
  analysisTypeBreakdown: Record<string, number>;
}

interface UserData {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  role: string;
  interactionCount: number;
  dailyLimit: number;
  monthlyLimit: number;
  isBlocked: boolean;
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

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [hasAccess, setHasAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userInteractions, setUserInteractions] = useState<Interaction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  // Check admin access
  useEffect(() => {
    if (authLoading) return;
    if (!user || !session) {
      navigate("/auth");
      return;
    }

    const checkAccess = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('admin', {
          body: { action: 'check-access' }
        });

        if (error) throw error;
        
        setHasAccess(data.hasAccess);
        setIsAdmin(data.isAdmin);

        if (!data.hasAccess) {
          toast.error("Access denied. Admin privileges required.");
          navigate("/");
        }
      } catch (error: any) {
        console.error('Access check error:', error);
        toast.error("Failed to verify admin access");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, session, authLoading, navigate]);

  // Fetch stats and users
  useEffect(() => {
    if (!hasAccess) return;

    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          supabase.functions.invoke('admin', { body: { action: 'get-stats' } }),
          supabase.functions.invoke('admin', { body: { action: 'get-users' } })
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (usersRes.data) setUsers(usersRes.data.users || []);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error("Failed to load admin data");
      }
    };

    fetchData();
  }, [hasAccess]);

  const fetchUserInteractions = async (userId: string) => {
    setLoadingInteractions(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        body: { action: 'get-user-interactions', targetUserId: userId }
      });

      if (error) throw error;
      setUserInteractions(data.interactions || []);
    } catch (error) {
      toast.error("Failed to load user interactions");
    } finally {
      setLoadingInteractions(false);
    }
  };

  const handleSetRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin', {
        body: { action: 'set-role', targetUserId: userId, role }
      });

      if (error) throw error;
      
      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, role } : u
      ));
      toast.success(`Role updated to ${role}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleSetLimits = async (userId: string, dailyLimit: number, monthlyLimit: number, isBlocked: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('admin', {
        body: { 
          action: 'set-limits', 
          targetUserId: userId,
          dailyLimit,
          monthlyLimit,
          isBlocked
        }
      });

      if (error) throw error;
      
      setUsers(prev => prev.map(u => 
        u.user_id === userId ? { ...u, dailyLimit, monthlyLimit, isBlocked } : u
      ));
      toast.success("Limits updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update limits");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Admin" : "Moderator"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              AI Usage
            </TabsTrigger>
            <TabsTrigger value="cleanup" className="gap-2">
              <Database className="w-4 h-4" />
              Cleanup
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="w-4 h-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Total AI Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalInteractions || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalDocuments || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Today's Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.todayInteractions || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Analysis Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {stats?.analysisTypeBreakdown && Object.entries(stats.analysisTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="bg-muted/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">{type.replace('-', ' ')}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>AI Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.full_name || 'Unnamed'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.email}
                          </TableCell>
                          <TableCell>
                            {isAdmin ? (
                              <Select
                                value={u.role}
                                onValueChange={(value) => handleSetRole(u.user_id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={u.role === 'admin' ? 'default' : u.role === 'moderator' ? 'secondary' : 'outline'}>
                                {u.role}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-primary font-medium">{u.interactionCount}</span>
                            <span className="text-muted-foreground"> / {u.dailyLimit} daily</span>
                          </TableCell>
                          <TableCell>
                            {u.isBlocked ? (
                              <Badge variant="destructive" className="gap-1">
                                <Ban className="w-3 h-3" />
                                Blocked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-green-500 border-green-500/50">
                                <Check className="w-3 h-3" />
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setSelectedUser(u);
                                      fetchUserInteractions(u.user_id);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      AI Usage - {selectedUser?.full_name || selectedUser?.email}
                                    </DialogTitle>
                                  </DialogHeader>
                                  {loadingInteractions ? (
                                    <div className="flex justify-center py-8">
                                      <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {userInteractions.map((interaction) => (
                                        <div key={interaction.id} className="border rounded-lg p-4 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Badge variant="outline">{interaction.analysis_type}</Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(interaction.created_at).toLocaleString()}
                                            </span>
                                          </div>
                                          <p className="text-sm font-medium">Q: {interaction.query.substring(0, 200)}...</p>
                                          <p className="text-sm text-muted-foreground">A: {interaction.response.substring(0, 300)}...</p>
                                          {interaction.rating && (
                                            <Badge variant="secondary">Rating: {interaction.rating}/5</Badge>
                                          )}
                                        </div>
                                      ))}
                                      {userInteractions.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">No interactions found</p>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setSelectedUser(u)}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Usage Limits - {selectedUser?.full_name || selectedUser?.email}
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedUser && (
                                    <LimitsForm 
                                      user={selectedUser} 
                                      onSave={handleSetLimits}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Contact Messages (Real-time)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactMessagesList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent AI Activity (All Users)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivityList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cleanup Tab */}
          <TabsContent value="cleanup">
            <DataCleanupPanel />
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <SEOMonitor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Limits Form Component
const LimitsForm = ({ user, onSave }: { user: UserData; onSave: (userId: string, daily: number, monthly: number, blocked: boolean) => void }) => {
  const [dailyLimit, setDailyLimit] = useState(user.dailyLimit);
  const [monthlyLimit, setMonthlyLimit] = useState(user.monthlyLimit);
  const [isBlocked, setIsBlocked] = useState(user.isBlocked);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(user.user_id, dailyLimit, monthlyLimit, isBlocked);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Daily AI Analysis Limit</Label>
        <Input 
          type="number" 
          value={dailyLimit} 
          onChange={(e) => setDailyLimit(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-2">
        <Label>Monthly AI Analysis Limit</Label>
        <Input 
          type="number" 
          value={monthlyLimit} 
          onChange={(e) => setMonthlyLimit(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Block User from AI</Label>
        <Switch checked={isBlocked} onCheckedChange={setIsBlocked} />
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Changes
      </Button>
    </div>
  );
};

// Contact Messages Component with Real-time updates
const ContactMessagesList = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel("contact_messages_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_messages"
        },
        (payload) => {
          const newMessage = payload.new as ContactMessage;
          setMessages((prev) => [newMessage, ...prev]);
          toast.info(`New message from ${newMessage.name}`, {
            description: newMessage.message.substring(0, 50) + "..."
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "contact_messages"
        },
        (payload) => {
          const updatedMessage = payload.new as ContactMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "contact_messages"
        },
        (payload) => {
          const deletedId = payload.old.id;
          setMessages((prev) => prev.filter((m) => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: !isRead })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      toast.error("Failed to update message status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Badge variant="default">{unreadCount}</Badge>
          <span>unread messages</span>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`border rounded-lg p-4 space-y-3 transition-colors ${
            !msg.is_read
              ? "bg-primary/5 border-primary/30"
              : "bg-muted/30 border-border/50"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{msg.name}</span>
                {!msg.is_read && (
                  <Badge variant="default" className="text-xs">New</Badge>
                )}
              </div>
              <a
                href={`mailto:${msg.email}`}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                {msg.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMarkAsRead(msg.id, msg.is_read)}
                title={msg.is_read ? "Mark as unread" : "Mark as read"}
              >
                {msg.is_read ? (
                  <CheckCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(msg.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(msg.created_at).toLocaleString()}
          </p>
        </div>
      ))}

      {messages.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No contact messages yet
        </p>
      )}
    </div>
  );
};

// Recent Activity Component
const RecentActivityList = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await supabase.functions.invoke('admin', {
          body: { action: 'get-users' }
        });

        // Flatten interactions from all users for recent activity view
        const allUsers = data?.users || [];
        const activityPromises = allUsers.slice(0, 10).map(async (user: UserData) => {
          const { data: interactionData } = await supabase.functions.invoke('admin', {
            body: { action: 'get-user-interactions', targetUserId: user.user_id }
          });
          return (interactionData?.interactions || []).map((i: any) => ({
            ...i,
            userName: user.full_name || user.email
          }));
        });

        const results = await Promise.all(activityPromises);
        const allActivities = results.flat().sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 50);

        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{activity.analysis_type}</Badge>
              <span className="text-sm font-medium">{activity.userName}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(activity.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {activity.query.substring(0, 150)}...
          </p>
        </div>
      ))}
      {activities.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No recent activity</p>
      )}
    </div>
  );
};

export default Admin;