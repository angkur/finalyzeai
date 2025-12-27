import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, User, LogOut, Shield, BookOpen, FileText, ChevronDown, CreditCard } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasAdminAccess(false);
      return;
    }

    const checkAdminAccess = async () => {
      try {
        const { data } = await supabase.functions.invoke('admin', {
          body: { action: 'check-access' }
        });
        setHasAdminAccess(data?.hasAccess || false);
      } catch {
        setHasAdminAccess(false);
      }
    };

    checkAdminAccess();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6">
      <div className="container px-6">
        <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">FinanceAI</span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <Link to="/ai-predict" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              AI Predict
            </Link>
            <a href="/#process" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Process
            </a>
            <a href="/#tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Technology
            </a>
            
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
                Resources
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-40">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/blog" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Blog
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/user-guide" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    User Guide
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <a href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* Theme Toggle & Auth Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    {hasAdminAccess && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer text-primary">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
