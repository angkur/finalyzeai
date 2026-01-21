// Centralized plan configuration - single source of truth for all plan limits
// This is imported by AuthContext, Pricing, and other components

export interface PlanLimits {
  daily_limit: number;
  monthly_limit: number;
  upload_limit_mb: number;
  history_retention_days: number | null; // null means unlimited
}

export interface PlanConfig {
  name: string;
  price: string;
  stripePriceId?: string;
  limits: PlanLimits;
}

// Stripe price IDs for each plan
export const STRIPE_PRICES: Record<string, string> = {
  "mini-pro": "price_1SnNzFGj42kzuAASjkxZfEvI",
  "mini": "price_1SnNzYGj42kzuAASdZ3S0PwS",
  "starter": "price_1SnO0KGj42kzuAASMuvVqTrS",
  "pro": "price_1SnO1NGj42kzuAASLZ9votZm",
};

// Plan limits - used for database sync and validation
export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    daily_limit: 5,
    monthly_limit: 5,
    upload_limit_mb: 5,
    history_retention_days: 7,
  },
  "mini-pro": {
    daily_limit: 7,
    monthly_limit: 15,
    upload_limit_mb: 8,
    history_retention_days: 14,
  },
  mini: {
    daily_limit: 10,
    monthly_limit: 25,
    upload_limit_mb: 10,
    history_retention_days: 30,
  },
  starter: {
    daily_limit: 25,
    monthly_limit: 100,
    upload_limit_mb: 25,
    history_retention_days: 90,
  },
  pro: {
    daily_limit: 50,
    monthly_limit: 500,
    upload_limit_mb: 50,
    history_retention_days: null, // Unlimited
  },
};

// Helper to get retention days for database (null becomes large number)
export const getRetentionDaysForDb = (planName: string): number => {
  const limits = PLAN_LIMITS[planName];
  if (!limits) return 7; // Default to free tier
  return limits.history_retention_days ?? 36500; // ~100 years for unlimited
};

// Get plan limits with fallback to free
export const getPlanLimits = (planName: string): PlanLimits => {
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
};
