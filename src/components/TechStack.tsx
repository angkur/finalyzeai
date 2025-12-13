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

const TechStack = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="container relative z-10 px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm tracking-wider uppercase">Technology</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            <span className="text-foreground">Cutting-Edge </span>
            <span className="text-gradient-primary">Tech Stack</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Leveraging the latest advancements in AI/ML technologies to build robust, 
            scalable financial solutions.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {technologies.map((tech, index) => (
            <div
              key={tech.name}
              className="group relative px-6 py-4 rounded-xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div>
                  <span className="font-medium text-foreground">{tech.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">/ {tech.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-2xl bg-secondary/30 border border-border/30">
            <div className="font-display text-3xl font-bold text-gradient-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Cloud Native</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-secondary/30 border border-border/30">
            <div className="font-display text-3xl font-bold text-gradient-accent mb-2">CI/CD</div>
            <div className="text-sm text-muted-foreground">Automated Pipelines</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-secondary/30 border border-border/30">
            <div className="font-display text-3xl font-bold text-gradient-primary mb-2">SOC 2</div>
            <div className="text-sm text-muted-foreground">Compliant</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
