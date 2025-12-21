import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Search,
  Tag,
  TrendingUp,
  Brain,
  FileText,
  Shield,
  BarChart3,
  Zap,
  Users,
  Target,
  Lightbulb,
  Rocket
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  icon: React.ReactNode;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "introduction-to-ai-financial-analysis",
    title: "Introduction to AI-Powered Financial Analysis",
    excerpt: "Discover how artificial intelligence is revolutionizing the way businesses analyze financial data and make strategic decisions.",
    content: `Artificial Intelligence has transformed nearly every industry, and financial analysis is no exception. At FinanceAI, we leverage cutting-edge machine learning algorithms to provide insights that would take human analysts hours or even days to compile.

## What is AI Financial Analysis?

AI financial analysis uses machine learning models to process large volumes of financial data, identify patterns, and generate actionable insights. Unlike traditional analysis methods, AI can process thousands of data points simultaneously while maintaining accuracy and consistency.

## Key Benefits

**Speed and Efficiency**: What once took days now takes minutes. Our AI processes your financial documents instantly, providing immediate insights.

**Pattern Recognition**: AI excels at identifying trends and anomalies that might escape human notice. This includes subtle correlations between different financial metrics.

**Reduced Human Error**: By automating calculations and analysis, we eliminate the risk of manual errors that can lead to costly mistakes.

**Scalability**: Whether you're analyzing a single report or thousands of documents, AI handles it with equal efficiency.

## How FinanceAI Works

Our platform combines natural language processing with advanced financial models. Simply upload your documents, ask questions in plain English, and receive comprehensive analysis complete with visualizations.

The future of financial analysis is here, and it's powered by AI.`,
    category: "AI Technology",
    readTime: "5 min read",
    date: "December 20, 2025",
    icon: <Brain className="w-6 h-6" />,
    featured: true
  },
  {
    id: "2",
    slug: "document-processing-guide",
    title: "A Complete Guide to Financial Document Processing",
    excerpt: "Learn how to efficiently upload and process various financial documents including balance sheets, income statements, and annual reports.",
    content: `Efficient document processing is the foundation of good financial analysis. In this guide, we'll walk you through everything you need to know about uploading and processing financial documents with FinanceAI.

## Supported Document Types

FinanceAI supports a wide range of financial documents:

- **Balance Sheets**: Analyze assets, liabilities, and equity positions
- **Income Statements**: Track revenue, expenses, and profitability
- **Cash Flow Statements**: Monitor cash inflows and outflows
- **Annual Reports**: Comprehensive company analysis
- **Financial Forecasts**: Project future performance

## Supported File Formats

We accept documents in multiple formats:
- PDF files
- Excel spreadsheets (.xlsx, .xls)
- CSV files
- Text documents

## Best Practices for Upload

**Clean Data**: Ensure your documents are clearly formatted with readable text. Scanned documents should have high resolution.

**Organize Files**: Name your files descriptively so you can easily track what you've uploaded.

**Batch Processing**: Upload multiple related documents together for comprehensive analysis.

## Processing Steps

1. Drag and drop your file or click to browse
2. Our AI extracts and validates the data
3. The document is indexed for analysis
4. You can now query the data using natural language

Start uploading your documents today and unlock powerful financial insights.`,
    category: "Tutorials",
    readTime: "7 min read",
    date: "December 18, 2025",
    icon: <FileText className="w-6 h-6" />
  },
  {
    id: "3",
    slug: "data-security-best-practices",
    title: "Data Security: Protecting Your Financial Information",
    excerpt: "Understanding how FinanceAI protects your sensitive financial data with enterprise-grade security measures.",
    content: `When dealing with financial data, security isn't optional—it's essential. At FinanceAI, we've implemented comprehensive security measures to ensure your data remains protected at all times.

## Our Security Framework

**Encryption Standards**: All data is encrypted using AES-256 encryption, both in transit and at rest. This is the same standard used by banks and government agencies.

**Access Controls**: Multi-factor authentication and role-based access ensure only authorized users can view your data.

**Secure Infrastructure**: Our platform runs on enterprise-grade cloud infrastructure with regular security audits.

## Data Privacy Principles

- Your data belongs to you. We never sell or share your information.
- You control who has access to your documents and analysis.
- Delete your data anytime—it's permanently removed from our systems.

## Compliance & Certifications

We follow industry best practices for data protection and maintain compliance with relevant regulations. Our security protocols are regularly reviewed and updated.

## What You Can Do

**Strong Passwords**: Use unique, complex passwords for your account.
**Enable 2FA**: Add an extra layer of protection with two-factor authentication.
**Regular Reviews**: Periodically review your account activity and permissions.

Your financial data is sensitive. Trust it only to platforms that take security as seriously as we do.`,
    category: "Security",
    readTime: "6 min read",
    date: "December 15, 2025",
    icon: <Shield className="w-6 h-6" />
  },
  {
    id: "4",
    slug: "understanding-financial-visualizations",
    title: "Understanding Financial Visualizations and Charts",
    excerpt: "Master the art of interpreting financial charts and graphs generated by our AI analysis platform.",
    content: `Visualizations transform complex financial data into understandable insights. Learn how to read and interpret the various charts and graphs generated by FinanceAI.

## Types of Visualizations

**Line Charts**: Perfect for showing trends over time. Track revenue growth, expense patterns, or stock performance across months or years.

**Bar Charts**: Compare values across categories. Useful for comparing revenue by product line or expenses by department.

**Pie Charts**: Show composition and percentages. Ideal for displaying expense breakdowns or revenue sources.

**Scatter Plots**: Identify correlations between variables. Discover relationships between marketing spend and sales, for example.

**Heatmaps**: Visualize data density and patterns. Great for identifying peak performance periods.

## Reading the Data

When analyzing any visualization:

1. **Check the Axes**: Understand what each axis represents and the scale being used.
2. **Look for Trends**: Is the data increasing, decreasing, or stable?
3. **Identify Outliers**: Unusual data points often reveal important insights.
4. **Compare Periods**: How does current performance compare to previous periods?

## Customization Options

FinanceAI allows you to customize visualizations:
- Adjust time ranges
- Filter by specific metrics
- Change chart types
- Export for presentations

## Best Practices

- Use appropriate chart types for your data
- Keep visualizations simple and focused
- Include context and annotations
- Update regularly to track progress

Effective visualization is key to communicating financial insights. Master these skills to make better-informed decisions.`,
    category: "Analytics",
    readTime: "8 min read",
    date: "December 12, 2025",
    icon: <BarChart3 className="w-6 h-6" />
  },
  {
    id: "5",
    slug: "maximizing-ai-analysis-efficiency",
    title: "5 Tips for Maximizing Your AI Analysis Efficiency",
    excerpt: "Get the most out of FinanceAI with these expert tips for faster, more accurate financial analysis.",
    content: `Want to supercharge your financial analysis workflow? Here are five proven tips to maximize efficiency with FinanceAI.

## 1. Prepare Your Data

Clean, well-organized data leads to better analysis:
- Remove duplicates and errors before upload
- Ensure consistent formatting across documents
- Use clear, descriptive file names

## 2. Ask Specific Questions

The more specific your query, the more precise the answer:

**Good**: "What was the revenue growth rate for Q3 2024 compared to Q3 2023?"
**Better**: "Show me the year-over-year revenue growth rate for Q3, broken down by product category."

## 3. Use Follow-Up Questions

Don't stop at the first answer. Dig deeper:
- Ask for clarification on specific points
- Request breakdowns by different dimensions
- Compare findings to industry benchmarks

## 4. Leverage Templates

Save time by using report templates:
- Create standard reports for recurring analysis
- Set up automated monthly summaries
- Build custom dashboards for quick insights

## 5. Regular Data Updates

Keep your analysis current:
- Upload new data as it becomes available
- Set reminders for periodic document updates
- Archive old data to maintain relevance

## Bonus: Keyboard Shortcuts

Speed up your workflow with these shortcuts:
- Quick upload: Drag & drop
- New analysis: Navigate to AI Demo
- Export results: Use the export button on any visualization

Implement these tips and watch your analysis efficiency soar.`,
    category: "Tips & Tricks",
    readTime: "5 min read",
    date: "December 10, 2025",
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: "6",
    slug: "ai-financial-forecasting",
    title: "The Power of AI-Driven Financial Forecasting",
    excerpt: "Learn how machine learning models predict future financial performance with unprecedented accuracy.",
    content: `Predicting the future is no longer guesswork. AI-driven forecasting uses historical data and advanced algorithms to project financial outcomes with remarkable accuracy.

## How AI Forecasting Works

Our forecasting models analyze:
- Historical financial performance
- Seasonal patterns and trends
- Market conditions and indicators
- Industry benchmarks

The AI identifies patterns in your data that humans might miss, then uses these patterns to project future performance.

## Types of Forecasts

**Revenue Projections**: Predict future sales based on historical growth patterns and market trends.

**Expense Forecasting**: Anticipate future costs and budget requirements.

**Cash Flow Predictions**: Plan for liquidity needs and investment opportunities.

**Risk Scenarios**: Model best-case, worst-case, and most-likely outcomes.

## Accuracy Factors

Forecast accuracy depends on:
- Quality of historical data
- Consistency of business patterns
- Market stability
- Length of the forecast period

## Using Forecasts Effectively

1. **Don't rely on a single forecast**: Consider multiple scenarios
2. **Update regularly**: Incorporate new data as it becomes available
3. **Validate against actual results**: Learn from prediction errors
4. **Combine with human judgment**: AI enhances, not replaces, expertise

## Getting Started

To generate forecasts with FinanceAI:
1. Upload at least 12 months of historical data
2. Request a forecast analysis
3. Review the projections and confidence intervals
4. Adjust assumptions as needed

Start forecasting smarter today.`,
    category: "AI Technology",
    readTime: "6 min read",
    date: "December 8, 2025",
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    id: "7",
    slug: "team-collaboration-features",
    title: "Collaborating on Financial Analysis with Your Team",
    excerpt: "Discover how to work together on financial projects using FinanceAI's collaboration features.",
    content: `Financial analysis is often a team effort. FinanceAI provides powerful collaboration features to help teams work together effectively.

## Collaboration Features

**Shared Workspaces**: Create team workspaces where everyone can access the same documents and analyses.

**Permission Controls**: Assign different access levels—view only, edit, or admin—to team members.

**Comments and Notes**: Add context to analyses for team reference.

**Activity History**: Track who made changes and when.

## Setting Up Your Team

1. Navigate to your account settings
2. Access the team management section
3. Invite team members via email
4. Assign appropriate permissions

## Best Practices for Team Collaboration

**Establish Naming Conventions**: Create consistent naming for files and analyses so everyone can find what they need.

**Define Workflows**: Establish clear processes for document upload, analysis, and review.

**Regular Check-ins**: Schedule periodic reviews to discuss findings and align on priorities.

**Document Decisions**: Use notes to record important conclusions and action items.

## Security Considerations

When collaborating:
- Only invite team members who need access
- Review permissions regularly
- Remove access when team members leave
- Use separate workspaces for sensitive projects

## Communication Tips

- Tag team members when you need their input
- Share specific analyses rather than entire workspaces
- Provide context when sharing insights
- Follow up on pending items

Effective collaboration leads to better financial insights and faster decision-making.`,
    category: "Collaboration",
    readTime: "5 min read",
    date: "December 5, 2025",
    icon: <Users className="w-6 h-6" />
  },
  {
    id: "8",
    slug: "financial-reporting-automation",
    title: "Automating Your Financial Reporting Workflow",
    excerpt: "Save hours every month by automating repetitive financial reporting tasks with AI assistance.",
    content: `Manual financial reporting is time-consuming and error-prone. Learn how to automate your reporting workflow and reclaim valuable time.

## What Can Be Automated?

**Data Collection**: Automatically import financial data from various sources.

**Report Generation**: Create standardized reports with a single click.

**Distribution**: Schedule and send reports to stakeholders automatically.

**Updates**: Keep reports current with automatic data refresh.

## Building Automated Reports

Step 1: Define your report structure and metrics
Step 2: Connect your data sources
Step 3: Create report templates
Step 4: Set up scheduling rules
Step 5: Configure distribution lists

## Popular Automated Reports

- **Monthly Financial Summary**: Key metrics and trends
- **Budget vs. Actual**: Track spending against plans
- **KPI Dashboard**: Performance indicators at a glance
- **Executive Summary**: High-level overview for leadership

## Customization Options

Each automated report can be customized:
- Filter by date range, department, or category
- Include or exclude specific metrics
- Add custom calculations
- Brand with your company logo

## Time Savings

Our users report saving an average of:
- 10+ hours per month on reporting tasks
- 95% reduction in reporting errors
- Faster insights for decision-making

## Getting Started

1. Identify your most time-consuming reports
2. Start with simple automation
3. Gradually add complexity
4. Gather feedback and refine

Transform your reporting workflow from a burden to a breeze.`,
    category: "Automation",
    readTime: "6 min read",
    date: "December 3, 2025",
    icon: <Target className="w-6 h-6" />
  },
  {
    id: "9",
    slug: "interpreting-ai-insights",
    title: "How to Interpret and Act on AI-Generated Insights",
    excerpt: "Transform raw AI analysis into actionable business decisions with this comprehensive guide.",
    content: `Getting insights is one thing—knowing what to do with them is another. This guide will help you interpret AI-generated insights and turn them into action.

## Understanding Insight Types

**Descriptive Insights**: What happened? Historical analysis and trends.

**Diagnostic Insights**: Why did it happen? Root cause analysis.

**Predictive Insights**: What might happen? Forecasts and projections.

**Prescriptive Insights**: What should we do? Recommendations.

## Evaluating Insight Quality

Consider these factors:
- **Confidence Level**: How certain is the AI about this insight?
- **Data Quality**: Is the underlying data reliable?
- **Relevance**: Does this insight matter to your goals?
- **Actionability**: Can you act on this information?

## From Insight to Action

1. **Validate**: Verify the insight makes sense given your business knowledge
2. **Contextualize**: Consider external factors the AI may not know
3. **Prioritize**: Focus on high-impact insights first
4. **Plan**: Define specific actions and timelines
5. **Execute**: Implement changes systematically
6. **Measure**: Track results and refine approach

## Common Insight Categories

**Growth Opportunities**: Areas where you can increase revenue or expand.

**Cost Savings**: Inefficiencies or waste that can be eliminated.

**Risk Alerts**: Potential problems that need attention.

**Performance Trends**: Patterns in your metrics over time.

## Best Practices

- Don't act on every insight immediately
- Combine AI insights with human expertise
- Track which insights led to successful actions
- Continuously refine your analysis approach

The value of AI isn't just in the insights—it's in the actions they enable.`,
    category: "Best Practices",
    readTime: "7 min read",
    date: "December 1, 2025",
    icon: <Lightbulb className="w-6 h-6" />
  },
  {
    id: "10",
    slug: "future-of-ai-finance",
    title: "The Future of AI in Financial Services",
    excerpt: "Explore upcoming trends and innovations in AI-powered financial analysis and what they mean for your business.",
    content: `The intersection of AI and finance is evolving rapidly. Here's a look at what's coming next and how to prepare.

## Emerging Trends

**Real-Time Analysis**: Moving from batch processing to continuous, real-time financial monitoring and insights.

**Natural Language Interfaces**: Even more intuitive ways to interact with financial data through conversation.

**Predictive Intelligence**: AI that anticipates your questions and proactively surfaces relevant insights.

**Integration Everywhere**: Seamless connections between all your financial tools and data sources.

## Technology Advances

**Large Language Models**: More sophisticated understanding of financial concepts and context.

**Multimodal AI**: Processing documents, images, audio, and data together for comprehensive analysis.

**Edge Computing**: Faster processing with data staying closer to the source.

**Quantum Computing**: Eventually, solving complex financial problems that are currently impossible.

## Impact on Finance Professionals

AI won't replace financial professionals—it will augment them:
- Automate routine tasks
- Surface insights faster
- Enable deeper analysis
- Free time for strategic thinking

## Preparing for the Future

**Embrace Learning**: Stay current with AI developments in finance.

**Experiment Early**: Test new tools and techniques as they emerge.

**Focus on Judgment**: Develop skills AI can't replicate—strategic thinking, relationships, creativity.

**Invest in Data**: Quality data is the foundation of AI success.

## Our Roadmap

At FinanceAI, we're continuously improving:
- Enhanced forecasting models
- More industry-specific analysis
- Deeper integrations
- Advanced visualization capabilities

## Conclusion

The future of finance is AI-powered. Those who embrace this technology today will have a significant advantage tomorrow.

Stay ahead of the curve with FinanceAI.`,
    category: "Industry Trends",
    readTime: "8 min read",
    date: "November 28, 2025",
    icon: <Rocket className="w-6 h-6" />
  }
];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const categories = [...new Set(blogPosts.map(post => post.category))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts.find(post => post.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <FileText className="w-3 h-3 mr-1" />
              Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Insights & <span className="text-gradient">Updates</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert articles on AI-powered financial analysis, best practices, and industry trends.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {featuredPost && !searchQuery && !selectedCategory && (
            <Card 
              className="mb-12 overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 cursor-pointer hover:border-primary/40 transition-all"
              onClick={() => navigate(`/blog/${featuredPost.slug}`)}
            >
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    {featuredPost.icon}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <Badge className="mb-3">Featured Article</Badge>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                      <Badge variant="secondary">{featuredPost.category}</Badge>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary hidden md:block" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts
              .filter(post => !post.featured || searchQuery || selectedCategory)
              .map((post) => (
              <Card 
                key={post.id}
                className="group cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      {post.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {post.category}
                      </Badge>
                      <h3 className="font-display font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
