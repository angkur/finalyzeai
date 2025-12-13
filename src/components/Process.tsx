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

const Process = () => {
  return (
    <section className="py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container relative z-10 px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-accent font-medium text-sm tracking-wider uppercase">Process</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            <span className="text-foreground">Proven </span>
            <span className="text-gradient-accent">Methodology</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A structured approach to delivering AI solutions that meet the rigorous demands 
            of financial applications.
          </p>
        </div>

        {/* Process Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex gap-8 pb-16 last:pb-0">
              {/* Timeline Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[39px] top-20 w-px h-full bg-gradient-to-b from-primary/50 to-transparent" />
              )}

              {/* Number Circle */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-card border border-border flex items-center justify-center shadow-card">
                  <span className="font-display text-2xl font-bold text-gradient-primary">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <div className="pt-2">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
