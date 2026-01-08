import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CreditCard, Download, ExternalLink, Crown, Zap, Sparkles, RefreshCw, Settings } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const TIERS: Record<string, { name: string; icon: React.ElementType; color: string }> = {
  starter: { name: "AI Predict Starter", icon: Zap, color: "text-blue-500" },
  pro: { name: "AI Predict Pro", icon: Sparkles, color: "text-purple-500" },
  enterprise: { name: "AI Predict Enterprise", icon: Crown, color: "text-amber-500" },
};

const PRODUCT_TO_TIER: Record<string, string> = {
  prod_SQNljgqGjmvAHD: "starter",
  prod_SQNmVzQwDHKlA0: "pro",
  prod_SQNmJQ3YfrEuML: "enterprise",
};

interface Invoice {
  id: string;
  number: string | null;
  amount_paid: number;
  currency: string;
  status: string | null;
  created: string;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

interface Subscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  product_id: string;
  price_id: string;
  amount: number;
  currency: string;
  interval: string;
}

const SubscriptionManagement = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchBillingData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("billing-history");
      if (error) throw error;
      
      setInvoices(data.invoices || []);
      setSubscription(data.subscription || null);
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open subscription management");
    } finally {
      setPortalLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTierFromProductId = (productId: string) => {
    return PRODUCT_TO_TIER[productId] || "starter";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const currentTier = subscription ? getTierFromProductId(subscription.product_id) : null;
  const tierInfo = currentTier ? TIERS[currentTier] : null;
  const TierIcon = tierInfo?.icon || Zap;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/pricing">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Subscription & Billing</h1>
            <p className="text-muted-foreground">Manage your subscription and view billing history</p>
          </div>
        </div>

        {/* Current Plan Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${tierInfo?.color}`}>
                      <TierIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{tierInfo?.name || "Subscription"}</h3>
                      <p className="text-muted-foreground">
                        {formatCurrency(subscription.amount, subscription.currency)}/{subscription.interval}
                      </p>
                    </div>
                  </div>
                  <Badge variant={subscription.cancel_at_period_end ? "destructive" : "default"}>
                    {subscription.cancel_at_period_end ? "Canceling" : "Active"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Period</p>
                    <p className="font-medium">
                      {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Billing Date</p>
                    <p className="font-medium">
                      {subscription.cancel_at_period_end ? "—" : formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>

                {subscription.cancel_at_period_end && (
                  <p className="text-sm text-destructive">
                    Your subscription will end on {formatDate(subscription.current_period_end)}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleManageSubscription} disabled={portalLoading}>
                    <Settings className="h-4 w-4 mr-2" />
                    {portalLoading ? "Loading..." : "Manage Subscription"}
                  </Button>
                  <Button variant="outline" onClick={fetchBillingData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don't have an active subscription</p>
                <Button asChild>
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing History Card */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number || invoice.id.slice(0, 12)}</TableCell>
                      <TableCell>{formatDate(invoice.created)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount_paid, invoice.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.hosted_invoice_url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {invoice.invoice_pdf && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No invoices yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
