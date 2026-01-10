import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const technologies = [
  { name: "Python", category: "Language" },
  { name: "PyTorch", category: "Framework" },
  { name: "TensorFlow", category: "Framework" },
  { name: "Hugging Face", category: "Models" },
  { name: "LangChain", category: "RAG" },
  { name: "OpenAI", category: "LLM" },
  { name: "Anthropic", category: "LLM" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Pinecone", category: "Vector DB" },
  { name: "AWS", category: "Cloud" },
  { name: "Docker", category: "DevOps" },
  { name: "MLflow", category: "MLOps" },
];

const TechBadge = ({ tech, index }: { tech: typeof technologies[0]; index: number }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "group relative px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-default",
        "scroll-animate-scale",
        isVisible && "visible"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse" />
        <div className="flex items-center flex-wrap gap-x-1 sm:gap-x-2">
          <span className="font-medium text-xs sm:text-sm md:text-base text-foreground">{tech.name}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">/ {tech.category}</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "text-center p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-secondary/30 border border-border/30",
        "scroll-animate-scale",
        isVisible && "visible"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {children}
    </div>
  );
};

const TechStack = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="container relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <div 
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={cn(
            "text-center max-w-3xl mx-auto mb-10 sm:mb-16 scroll-animate",
            headerVisible && "visible"
          )}
        >
          <span className="text-primary font-medium text-xs sm:text-sm tracking-wider uppercase">Technology</span>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mt-3 sm:mt-4 mb-4 sm:mb-6">
            <span className="text-foreground">Cutting-Edge </span>
            <span className="text-gradient-primary">Tech Stack</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
            Leveraging the latest advancements in AI/ML technologies to build robust, 
            scalable financial solutions.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
          {technologies.map((tech, index) => (
            <TechBadge key={tech.name} tech={tech} index={index} />
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          <StatCard index={0}>
            <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary mb-1 sm:mb-2">100%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Cloud Native</div>
          </StatCard>
          <StatCard index={1}>
            <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-gradient-accent mb-1 sm:mb-2">CI/CD</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Automated Pipelines</div>
          </StatCard>
          <StatCard index={2}>
            <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary mb-1 sm:mb-2">SOC 2</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Compliant</div>
          </StatCard>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
