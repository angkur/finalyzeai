import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Discovery & Requirements",
    description: "Collaborate with financial analysts and quantitative researchers to understand requirements and translate them into actionable specifications.",
  },
  {
    number: "02",
    title: "Architecture & Design",
    description: "Design robust system architecture including data pipelines, model selection, and integration points with existing financial infrastructure.",
  },
  {
    number: "03",
    title: "Development & Training",
    description: "Build and train models using curated financial datasets, implementing rigorous testing and validation throughout the development cycle.",
  },
  {
    number: "04",
    title: "Deployment & Monitoring",
    description: "Deploy solutions to production with comprehensive monitoring, documentation, and ongoing optimization for peak performance.",
  },
];

const ProcessStep = ({ step, index, isLast }: { step: typeof steps[0]; index: number; isLast: boolean }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "relative flex gap-4 sm:gap-6 md:gap-8 pb-10 sm:pb-12 md:pb-16 last:pb-0",
        "scroll-animate-left",
        isVisible && "visible"
      )}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[27px] sm:left-[31px] md:left-[39px] top-14 sm:top-16 md:top-20 w-px h-full bg-gradient-to-b from-primary/50 to-transparent" />
      )}

      {/* Number Circle */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-card border border-border flex items-center justify-center shadow-card">
          <span className="font-display text-lg sm:text-xl md:text-2xl font-bold text-gradient-primary">{step.number}</span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-1 sm:pt-2 min-w-0 flex-1">
        <h3 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3">
          {step.title}
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
};

const Process = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container relative z-10 px-4 sm:px-6">
        {/* Section Header */}
        <div 
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={cn(
            "text-center max-w-3xl mx-auto mb-10 sm:mb-16 md:mb-20 scroll-animate",
            headerVisible && "visible"
          )}
        >
          <span className="text-accent font-medium text-xs sm:text-sm tracking-wider uppercase">Process</span>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mt-3 sm:mt-4 mb-4 sm:mb-6">
            <span className="text-foreground">Proven </span>
            <span className="text-gradient-accent">Methodology</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
            A structured approach to delivering AI solutions that meet the rigorous demands 
            of financial applications.
          </p>
        </div>

        {/* Process Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <ProcessStep 
              key={step.number} 
              step={step} 
              index={index} 
              isLast={index === steps.length - 1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
