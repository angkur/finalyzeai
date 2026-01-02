import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  return (
    <>
      <AnalyticsTracker />
      {children}
    </>
  );
};
