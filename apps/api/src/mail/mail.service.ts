import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    // No key configured — the app still runs, it just falls back to logging the code
    // to the server console (see sendOtpCode). Keeps local dev working without secrets.
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = this.config.get<string>("MAIL_FROM") ?? "Career Rise <onboarding@resend.dev>";
  }

  get isConfigured() {
    return this.resend !== null;
  }

  async sendOtpCode(to: string, code: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not set — OTP for ${to} is ${code} (logged, not emailed)`);
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `${code} is your Career Rise verification code`,
      text: `Your Career Rise verification code is ${code}. It expires in 5 minutes.\n\nIf you didn't request this, you can ignore this email.`,
      html: otpEmailHtml(code),
    });

    if (error) {
      // Surfaced to the caller so the API can return a real failure instead of
      // pretending a code was sent.
      this.logger.error(`Failed to send OTP to ${to}: ${error.message}`);
      throw new Error(error.message);
    }

    this.logger.log(`OTP emailed to ${to}`);
  }
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
