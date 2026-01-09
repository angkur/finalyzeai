import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Shield, BookOpen, FileText, ChevronDown, CreditCard, Menu, FolderOpen } from "lucide-react";
import logoImage from "@/assets/logo.png";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { href: "/#services", label: "Services", isExternal: true },
    { href: "/ai-predict", label: "AI Predict", isExternal: false },
    { href: "/fin-predict", label: "Fin Predict", isExternal: false },
    { href: "/#process", label: "Process", isExternal: true },
    { href: "/#tech", label: "Technology", isExternal: true },
    { href: "/pricing", label: "Pricing", isExternal: false },
    { href: "/#contact", label: "Contact", isExternal: true },
  ];

  const resourceLinks = [
    { href: "/blog", label: "Blog", icon: FileText },
    { href: "/user-guide", label: "User Guide", icon: BookOpen },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 md:py-6">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <img src={logoImage} alt="FinalyzeAI Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
            <span className="font-display font-bold text-base md:text-lg text-foreground">FinalyzeAI</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.slice(0, 5).map((link) => (
              link.isExternal ? (
                <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              )
            ))}
            
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
                Resources
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-40">
                {resourceLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild className="cursor-pointer">
                    <Link to={link.href} className="flex items-center gap-2">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <a href="/#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* Right Side: Theme Toggle, Auth & Mobile Menu */}
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:block">
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
                      <DropdownMenuItem onClick={() => navigate("/documents")} className="cursor-pointer">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        My Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/subscription")} className="cursor-pointer">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Subscription
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

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logoImage} alt="FinalyzeAI Logo" className="w-8 h-8 rounded-xl" />
                    <span className="font-display font-bold">FinalyzeAI</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col py-4">
                  {/* Navigation Links */}
                  <div className="px-4 pb-4 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Navigation</p>
                    <div className="flex flex-col gap-1">
                      {navLinks.map((link) => (
                        link.isExternal ? (
                          <SheetClose asChild key={link.href}>
                            <a 
                              href={link.href} 
                              className="py-2.5 px-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                              onClick={closeMobileMenu}
                            >
                              {link.label}
                            </a>
                          </SheetClose>
                        ) : (
                          <SheetClose asChild key={link.href}>
                            <Link 
                              to={link.href} 
                              className="py-2.5 px-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                              onClick={closeMobileMenu}
                            >
                              {link.label}
                            </Link>
                          </SheetClose>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="px-4 py-4 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Resources</p>
                    <div className="flex flex-col gap-1">
                      {resourceLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                          <Link 
                            to={link.href} 
                            className="py-2.5 px-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors flex items-center gap-2"
                            onClick={closeMobileMenu}
                          >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>

                  {/* Auth Section */}
                  <div className="px-4 pt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Account</p>
                    {!isLoading && (
                      user ? (
                        <div className="flex flex-col gap-1">
                          <SheetClose asChild>
                            <Link 
                              to="/profile" 
                              className="py-2.5 px-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors flex items-center gap-2"
                              onClick={closeMobileMenu}
                            >
                              <User className="w-4 h-4" />
                              Profile
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link 
                              to="/documents" 
                              className="py-2.5 px-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors flex items-center gap-2"
                              onClick={closeMobileMenu}
                            >
                              <FolderOpen className="w-4 h-4" />
                              My Documents
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link 
                              to="/subscription" 
                              className="py-2.5 px-3 text-sm text-foreground hover:bg-accent rounded-lg transition-colors flex items-center gap-2"
                              onClick={closeMobileMenu}
                            >
                              <CreditCard className="w-4 h-4" />
                              Subscription
                            </Link>
                          </SheetClose>
                          {hasAdminAccess && (
                            <SheetClose asChild>
                              <Link 
                                to="/admin" 
                                className="py-2.5 px-3 text-sm text-primary hover:bg-accent rounded-lg transition-colors flex items-center gap-2"
                                onClick={closeMobileMenu}
                              >
                                <Shield className="w-4 h-4" />
                                Admin Panel
                              </Link>
                            </SheetClose>
                          )}
                          <button 
                            onClick={handleSignOut}
                            className="py-2.5 px-3 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2 text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <SheetClose asChild>
                          <Button 
                            variant="hero" 
                            className="w-full" 
                            onClick={() => {
                              navigate("/auth");
                              closeMobileMenu();
                            }}
                          >
                            Get Started
                          </Button>
                        </SheetClose>
                      )
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
