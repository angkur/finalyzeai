import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { ReactNode, forwardRef } from "react";

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale";
  delay?: number;
}

const ScrollSection = forwardRef<HTMLElement, ScrollSectionProps>(
  ({ children, className, id, animation = "fade-up", delay = 0 }, forwardedRef) => {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

    const animationClass = {
      "fade-up": "scroll-animate",
      "fade-left": "scroll-animate-left",
      "fade-right": "scroll-animate-right",
      "scale": "scroll-animate-scale",
    }[animation];

    const staggerClass = delay > 0 ? `stagger-${Math.min(delay, 6)}` : "";

    return (
      <section
        ref={(node) => {
          // Handle both refs
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        id={id}
        className={cn(animationClass, staggerClass, isVisible && "visible", className)}
      >
        {children}
      </section>
    );
  }
);

ScrollSection.displayName = "ScrollSection";

export default ScrollSection;
