import { supabase } from "@/integrations/supabase/client";

interface EmailData {
  userName?: string;
  productName?: string;
  amount?: string;
  orderId?: string;
  subject?: string;
  body?: string;
}

type EmailType = "welcome" | "purchase_confirmation" | "password_reset_success" | "custom";

export const useEmail = () => {
  const sendEmail = async (
    type: EmailType,
    to: string,
    data?: EmailData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: response, error } = await supabase.functions.invoke("send-email", {
        body: { type, to, data },
      });

      if (error) {
        console.error("Email send error:", error);
        return { success: false, error: error.message };
      }

      return { success: response?.success ?? true };
    } catch (err: any) {
      console.error("Email send exception:", err);
      return { success: false, error: err.message };
    }
  };

  const sendWelcomeEmail = async (email: string, userName?: string) => {
    return sendEmail("welcome", email, { userName });
  };

  const sendPurchaseConfirmation = async (
    email: string,
    data: { userName?: string; productName: string; amount: string; orderId: string }
  ) => {
    return sendEmail("purchase_confirmation", email, data);
  };

  const sendPasswordResetSuccess = async (email: string, userName?: string) => {
    return sendEmail("password_reset_success", email, { userName });
  };

  const sendCustomEmail = async (
    email: string,
    subject: string,
    body: string,
    userName?: string
  ) => {
    return sendEmail("custom", email, { subject, body, userName });
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendPurchaseConfirmation,
    sendPasswordResetSuccess,
    sendCustomEmail,
  };
};
