import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

interface FeedbackRatingProps {
  interactionId: string | null;
  onRatingSubmit?: (rating: number) => void;
}

const FeedbackRating = ({ interactionId, onRatingSubmit }: FeedbackRatingProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = async (selectedRating: number) => {
    if (!interactionId || isSubmitting || submitted) return;

    setRating(selectedRating);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-interaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            interactionId,
            rating: selectedRating,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      setSubmitted(true);
      onRatingSubmit?.(selectedRating);
      toast.success("Thanks for your feedback!");
    } catch (error) {
      console.error("Rating error:", error);
      toast.error("Failed to submit rating");
      setRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-accent">
        <ThumbsUp className="w-4 h-4" />
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Rate this response:</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            disabled={isSubmitting || !interactionId}
            className={`p-1 transition-all duration-200 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
            }`}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/50"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedbackRating;
