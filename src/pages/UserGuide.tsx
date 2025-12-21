import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  FileText, 
  Upload, 
  Brain, 
  BarChart3, 
  MessageSquare, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UserGuide = () => {
  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Zap className="w-6 h-6" />,
      content: [
        {
          title: "Create Your Account",
          description: "Sign up for a free account to access all features. Click 'Get Started' in the navigation bar and complete the registration process with your email."
        },
        {
          title: "Verify Your Email",
          description: "After registration, you'll receive a verification email. Click the link to activate your account and start using FinanceAI."
        },
        {
          title: "Complete Your Profile",
          description: "Navigate to your profile page to add your information and customize your experience."
        }
      ]
    },
    {
      id: "document-upload",
      title: "Document Upload",
      icon: <Upload className="w-6 h-6" />,
      content: [
        {
          title: "Supported Formats",
          description: "Upload financial documents in PDF, CSV, Excel, or text formats. Our system processes various document types including balance sheets, income statements, and financial reports."
        },
        {
          title: "Upload Process",
          description: "Drag and drop your files into the upload area or click to browse. Files are securely processed and stored with encryption."
        },
        {
          title: "Processing Time",
          description: "Documents are typically processed within seconds. Complex or large documents may take up to a few minutes."
        }
      ]
    },
    {
      id: "ai-analysis",
      title: "AI-Powered Analysis",
      icon: <Brain className="w-6 h-6" />,
      content: [
        {
          title: "Data Analysis",
          description: "Our AI examines your financial data to identify trends, patterns, and key insights. Get comprehensive analysis of revenue, expenses, and profitability."
        },
        {
          title: "Report Generation",
          description: "Generate professional financial reports automatically. Choose from various templates including executive summaries, detailed breakdowns, and custom formats."
        },
        {
          title: "Forecasting",
          description: "Leverage predictive analytics to forecast future financial performance based on historical data and market trends."
        },
        {
          title: "Risk Assessment",
          description: "Identify potential financial risks and receive recommendations for mitigation strategies."
        }
      ]
    },
    {
      id: "visualizations",
      title: "Data Visualizations",
      icon: <BarChart3 className="w-6 h-6" />,
      content: [
        {
          title: "Interactive Charts",
          description: "View your financial data through interactive charts including line graphs, bar charts, pie charts, and more."
        },
        {
          title: "Custom Dashboards",
          description: "Create personalized dashboards with the metrics that matter most to your business."
        },
        {
          title: "Export Options",
          description: "Export visualizations as images or include them in generated reports for presentations."
        }
      ]
    },
    {
      id: "natural-language",
      title: "Natural Language Queries",
      icon: <MessageSquare className="w-6 h-6" />,
      content: [
        {
          title: "Ask Questions",
          description: "Simply type your financial questions in plain English. For example: 'What was our revenue growth last quarter?' or 'Show me expense trends.'"
        },
        {
          title: "Context-Aware Responses",
          description: "Our AI understands context and provides relevant answers based on your uploaded documents and previous queries."
        },
        {
          title: "Follow-Up Questions",
          description: "Ask follow-up questions to dive deeper into specific areas of your financial data."
        }
      ]
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: <Shield className="w-6 h-6" />,
      content: [
        {
          title: "Data Encryption",
          description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption."
        },
        {
          title: "Access Control",
          description: "Your data is only accessible to you. We never share your financial information with third parties."
        },
        {
          title: "Compliance",
          description: "Our platform follows best practices for data security and privacy compliance."
        }
      ]
    }
  ];

  const faqs = [
    {
      question: "How accurate is the AI analysis?",
      answer: "Our AI models are trained on extensive financial datasets and provide highly accurate analysis. However, we recommend using the insights as a supplement to professional financial advice."
    },
    {
      question: "Can I delete my uploaded documents?",
      answer: "Yes, you have full control over your data. You can delete any uploaded documents from your profile at any time."
    },
    {
      question: "Is there a limit to how many documents I can upload?",
      answer: "Free accounts have a reasonable usage limit. For higher volume needs, please contact us for enterprise solutions."
    },
    {
      question: "What types of analysis can I request?",
      answer: "You can request data analysis, report generation, financial forecasting, risk assessment, and custom queries about your financial data."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="w-3 h-3 mr-1" />
              Documentation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              User <span className="text-gradient">Guide</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know to get the most out of FinanceAI. 
              Learn how to upload documents, run analyses, and leverage AI-powered insights.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {section.icon}
                </div>
                <span className="text-sm font-medium">{section.title}</span>
              </a>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-16">
            {sections.map((section, idx) => (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1">Step {idx + 1}</Badge>
                    <h2 className="text-2xl font-display font-bold">{section.title}</h2>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.content.map((item, itemIdx) => (
                    <Card key={itemIdx} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* FAQs */}
          <section className="mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Common Questions</span>
              </div>
              <h2 className="text-3xl font-display font-bold">Frequently Asked Questions</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-20 text-center">
            <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 p-8 md:p-12">
              <h3 className="text-2xl font-display font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Start analyzing your financial documents with AI-powered insights today.
              </p>
              <a 
                href="/#demo" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Try AI Demo
                <ArrowRight className="w-4 h-4" />
              </a>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserGuide;
