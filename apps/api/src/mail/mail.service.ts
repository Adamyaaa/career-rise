import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

interface Sender {
  name: string;
  email: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string | undefined;
  private readonly sender: Sender;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>("BREVO_API_KEY");
    this.sender = parseSender(this.config.get<string>("MAIL_FROM"));
  }

  get isConfigured() {
    return Boolean(this.apiKey);
  }

  async sendOtpCode(to: string, code: string): Promise<void> {
    // No key configured — the app still runs, it just logs the code to the server
    // console. Keeps local dev working without any mail account.
    if (!this.apiKey) {
      this.logger.warn(`BREVO_API_KEY not set — OTP for ${to} is ${code} (logged, not emailed)`);
      return;
    }

    // Brevo's REST API rather than their SDK: one fetch, no extra dependency, and
    // Node 22 has fetch built in.
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": this.apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: this.sender,
        to: [{ email: to }],
        subject: `${code} is your Career Rise verification code`,
        textContent: `Your Career Rise verification code is ${code}. It expires in 5 minutes.\n\nIf you didn't request this, you can ignore this email.`,
        htmlContent: otpEmailHtml(code),
      }),
    });

    if (!response.ok) {
      // Brevo returns { code, message }; fall back to the status if the body isn't JSON.
      const detail = await response.text().catch(() => "");
      this.logger.error(`Failed to send OTP to ${to}: ${response.status} ${detail}`);
      throw new Error(`Brevo responded ${response.status}`);
    }

    this.logger.log(`OTP emailed to ${to}`);
  }
}

// Accepts either "Career Rise <no-reply@example.com>" or a bare address.
function parseSender(raw?: string): Sender {
  const fallback = { name: "Career Rise", email: "no-reply@example.com" };
  if (!raw) return fallback;

  const match = raw.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (match) {
    return { name: match[1] || fallback.name, email: match[2] };
  }
  return { name: fallback.name, email: raw.trim() };
}

function otpEmailHtml(code: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#faf6ef;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:#2b2118;">
    <table role="presentation" style="max-width:480px;margin:0 auto;background:#fffdf9;border:1px solid #ece2d4;border-radius:12px;">
      <tr>
        <td style="padding:28px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#c2410c;">Career Rise</p>
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">Your verification code</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#6b5b4b;">
            Enter this code to finish signing in. It expires in 5 minutes.
          </p>
          <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:.28em;color:#2b2118;">${code}</p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#9a8b7b;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
