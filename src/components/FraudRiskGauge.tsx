import { cn } from "@/lib/utils";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

interface FraudRiskGaugeProps {
  percentage: number;
  confidence?: "low" | "medium" | "high";
  className?: string;
}

const FraudRiskGauge = ({ percentage, confidence = "medium", className }: FraudRiskGaugeProps) => {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  
  // Determine severity level and colors
  const getSeverityConfig = (pct: number) => {
    if (pct <= 25) {
      return {
        level: "Low Risk",
        color: "text-green-500",
        bgColor: "bg-green-500",
        gradientFrom: "from-green-500",
        gradientTo: "to-green-400",
        ringColor: "stroke-green-500",
        icon: ShieldCheck,
        description: "No significant fraud indicators detected"
      };
    } else if (pct <= 50) {
      return {
        level: "Moderate Risk",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500",
        gradientFrom: "from-yellow-500",
        gradientTo: "to-yellow-400",
        ringColor: "stroke-yellow-500",
        icon: ShieldAlert,
        description: "Some anomalies require attention"
      };
    } else if (pct <= 75) {
      return {
        level: "High Risk",
        color: "text-orange-500",
        bgColor: "bg-orange-500",
        gradientFrom: "from-orange-500",
        gradientTo: "to-orange-400",
        ringColor: "stroke-orange-500",
        icon: ShieldAlert,
        description: "Multiple fraud indicators present"
      };
    } else {
      return {
        level: "Critical Risk",
        color: "text-red-500",
        bgColor: "bg-red-500",
        gradientFrom: "from-red-500",
        gradientTo: "to-red-400",
        ringColor: "stroke-red-500",
        icon: ShieldX,
        description: "Strong evidence of fraudulent activity"
      };
    }
  };

  const config = getSeverityConfig(clampedPercentage);
  const Icon = config.icon;
  
  // SVG arc calculations for the gauge
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle
  const offset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm", className)}>
      {/* Gauge */}
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 10}
          className="transform -rotate-180"
          style={{ overflow: 'visible' }}
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
            strokeLinecap="round"
          />
          
          {/* Colored arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            className={config.ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <Icon className={cn("w-8 h-8 mb-1", config.color)} />
          <span className={cn("text-4xl font-bold tabular-nums", config.color)}>
            {clampedPercentage}%
          </span>
        </div>
      </div>

      {/* Severity label */}
      <div className="mt-4 text-center">
        <div className={cn("text-lg font-semibold", config.color)}>
          {config.level}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {config.description}
        </p>
      </div>

      {/* Confidence indicator */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Confidence:</span>
        <div className="flex gap-1">
          {["low", "medium", "high"].map((level) => (
            <div
              key={level}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                confidence === level || 
                (confidence === "high" && ["low", "medium", "high"].includes(level)) ||
                (confidence === "medium" && ["low", "medium"].includes(level))
                  ? config.bgColor
                  : "bg-muted/30"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground capitalize">{confidence}</span>
      </div>

      {/* Severity scale */}
      <div className="mt-4 w-full">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-50" />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-green-500">Low</span>
          <span className="text-yellow-500">Moderate</span>
          <span className="text-orange-500">High</span>
          <span className="text-red-500">Critical</span>
        </div>
      </div>
    </div>
  );
};

export default FraudRiskGauge;
