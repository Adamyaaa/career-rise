import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { OtpSendDto } from "./dto/otp-send.dto";
import { OtpVerifyDto } from "./dto/otp-verify.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // These ceilings are per IP. They're deliberately far above what a real person does
  // and far below what a scripted attack needs.
  @Public()
  @Throttle({ default: { ttl: 3_600_000, limit: 5 } })
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 900_000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("logout")
  async logout(@Body() dto: RefreshTokenDto): Promise<{ success: true }> {
    await this.authService.logout(dto.refreshToken);
    return { success: true };
  }

  // Tightest limit on the API: every call costs an email from a finite daily quota,
  // and an unthrottled version is an open relay for spamming arbitrary addresses.
  @Public()
  @Throttle({ default: { ttl: 900_000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @Post("otp/send")
  sendOtp(@Body() dto: OtpSendDto) {
    return this.authService.sendOtp(dto.email);
  }

  // IP throttling alone wouldn't stop a distributed guess at a 6-digit code, so the
  // service also counts failures per email and burns the code after too many.
  @Public()
  @Throttle({ default: { ttl: 900_000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post("otp/verify")
  verifyOtp(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtp(dto.email, dto.code);
  }
}
