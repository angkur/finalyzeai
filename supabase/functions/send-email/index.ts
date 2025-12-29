import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "welcome" | "purchase_confirmation" | "password_reset_success" | "custom";
  to: string;
  data?: {
    userName?: string;
    productName?: string;
    amount?: string;
    orderId?: string;
    subject?: string;
    body?: string;
  };
}

const getEmailTemplate = (type: string, data: EmailRequest["data"] = {}) => {
  const userName = data.userName || "User";
  
  switch (type) {
    case "welcome":
      return {
        subject: "Welcome to FinalyzeAI! 🚀",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              <div style="background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to FinalyzeAI</h1>
              </div>
              <div style="padding: 40px 30px;">
                <p style="color: #e2e8f0; font-size: 18px; margin: 0 0 20px; line-height: 1.6;">Hi ${userName},</p>
                <p style="color: #94a3b8; font-size: 16px; margin: 0 0 25px; line-height: 1.7;">
                  Welcome aboard! We're thrilled to have you join FinalyzeAI. You now have access to powerful AI-driven financial analysis tools.
                </p>
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px; margin: 25px 0;">
                  <h3 style="color: #8b5cf6; margin: 0 0 15px; font-size: 16px;">What you can do:</h3>
                  <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Upload financial documents for AI analysis</li>
                    <li>Get intelligent insights and predictions</li>
                    <li>Chat with your data using natural language</li>
                    <li>Generate comprehensive reports</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://finalyzeai.com" style="display: inline-block; background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 16px;">Get Started</a>
                </div>
                <p style="color: #64748b; font-size: 14px; margin: 30px 0 0; line-height: 1.6;">
                  If you have any questions, just reply to this email — we're here to help!
                </p>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 25px 30px; text-align: center;">
                <p style="color: #64748b; font-size: 13px; margin: 0;">
                  © 2025 FinalyzeAI. All rights reserved.<br>
                  <a href="https://finalyzeai.com" style="color: #8b5cf6; text-decoration: none;">finalyzeai.com</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "purchase_confirmation":
      return {
        subject: `Purchase Confirmed - Order #${data.orderId || "N/A"}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Payment Successful!</h1>
              </div>
              <div style="padding: 40px 30px;">
                <p style="color: #e2e8f0; font-size: 18px; margin: 0 0 20px; line-height: 1.6;">Hi ${userName},</p>
                <p style="color: #94a3b8; font-size: 16px; margin: 0 0 25px; line-height: 1.7;">
                  Thank you for your purchase! Your payment has been confirmed and your account has been upgraded.
                </p>
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 25px; margin: 25px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="color: #64748b; padding: 8px 0; font-size: 14px;">Order ID</td>
                      <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">#${data.orderId || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 8px 0; font-size: 14px;">Plan</td>
                      <td style="color: #e2e8f0; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">${data.productName || "Premium Plan"}</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; padding: 8px 0; font-size: 14px;">Amount</td>
                      <td style="color: #10b981; padding: 8px 0; font-size: 18px; text-align: right; font-weight: 700;">${data.amount || "$0.00"}</td>
                    </tr>
                  </table>
                </div>
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://finalyzeai.com/profile" style="display: inline-block; background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Account</a>
                </div>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 25px 30px; text-align: center;">
                <p style="color: #64748b; font-size: 13px; margin: 0;">
                  © 2025 FinalyzeAI. All rights reserved.<br>
                  <a href="https://finalyzeai.com" style="color: #8b5cf6; text-decoration: none;">finalyzeai.com</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "password_reset_success":
      return {
        subject: "Password Changed Successfully",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              <div style="background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🔒</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Password Updated</h1>
              </div>
              <div style="padding: 40px 30px;">
                <p style="color: #e2e8f0; font-size: 18px; margin: 0 0 20px; line-height: 1.6;">Hi ${userName},</p>
                <p style="color: #94a3b8; font-size: 16px; margin: 0 0 25px; line-height: 1.7;">
                  Your password has been successfully changed. If you made this change, no further action is required.
                </p>
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 25px 0;">
                  <p style="color: #f87171; font-size: 14px; margin: 0; line-height: 1.6;">
                    <strong>Didn't make this change?</strong><br>
                    If you didn't change your password, please contact our support team immediately.
                  </p>
                </div>
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://finalyzeai.com" style="display: inline-block; background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to FinalyzeAI</a>
                </div>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 25px 30px; text-align: center;">
                <p style="color: #64748b; font-size: 13px; margin: 0;">
                  © 2025 FinalyzeAI. All rights reserved.<br>
                  <a href="https://finalyzeai.com" style="color: #8b5cf6; text-decoration: none;">finalyzeai.com</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "custom":
      return {
        subject: data.subject || "Message from FinalyzeAI",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              <div style="background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">FinalyzeAI</h1>
              </div>
              <div style="padding: 40px 30px;">
                <p style="color: #e2e8f0; font-size: 18px; margin: 0 0 20px; line-height: 1.6;">Hi ${userName},</p>
                <div style="color: #94a3b8; font-size: 16px; line-height: 1.7;">
                  ${data.body || ""}
                </div>
              </div>
              <div style="background: rgba(0,0,0,0.2); padding: 25px 30px; text-align: center;">
                <p style="color: #64748b; font-size: 13px; margin: 0;">
                  © 2025 FinalyzeAI. All rights reserved.<br>
                  <a href="https://finalyzeai.com" style="color: #8b5cf6; text-decoration: none;">finalyzeai.com</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to}`);

    if (!to || !type) {
      throw new Error("Missing required fields: 'to' and 'type'");
    }

    const template = getEmailTemplate(type, data);

    const emailResponse = await resend.emails.send({
      from: "FinalyzeAI <no-reply@finalyzeai.com>",
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
