import { Brain, Database, LineChart, FileSearch, Workflow, Shield } from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "LLM Development",
    description: "Develop, train, and fine-tune large language models specifically designed for financial applications, data analysis, and report generation.",
    gradient: "primary",
  },
  {
    icon: FileSearch,
    title: "RAG Systems",
    description: "Design and implement Retrieval-Augmented Generation systems that integrate LLMs with internal and external financial data sources.",
    gradient: "accent",
  },
  {
    icon: Database,
    title: "Knowledge Bases",
    description: "Build and maintain robust knowledge bases containing financial data, research, and domain-specific information for intelligent querying.",
    gradient: "primary",
  },
  {
    icon: LineChart,
    title: "Predictive Modeling",
    description: "Develop, test, and deploy predictive models and credit scorecards with high accuracy for risk assessment and financial forecasting.",
    gradient: "accent",
  },
  {
    icon: Workflow,
    title: "Process Optimization",
    description: "Optimize LLM performance and efficiency for financial modeling tasks while maintaining software development best practices.",
    gradient: "primary",
  },
  {
    icon: Shield,
    title: "Compliant Solutions",
    description: "Implement solutions with comprehensive documentation, version control, testing, and code reviews meeting regulatory standards.",
    gradient: "accent",
  },
];

const Services = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-primary font-medium text-sm tracking-wider uppercase">Services</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            <span className="text-foreground">End-to-End </span>
            <span className="text-gradient-primary">AI Solutions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive expertise spanning the full lifecycle of AI-powered financial systems, 
            from concept to deployment and beyond.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-glow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl ${service.gradient === 'primary' ? 'bg-primary/10' : 'bg-accent/10'} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className={`w-6 h-6 ${service.gradient === 'primary' ? 'text-primary' : 'text-accent'}`} />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>

              {/* Hover Gradient */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${service.gradient === 'primary' ? 'bg-gradient-to-br from-primary/5 to-transparent' : 'bg-gradient-to-br from-accent/5 to-transparent'} pointer-events-none`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
