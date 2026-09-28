"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/common/form-field";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { roleHome } from "@/hooks/use-require-auth";
import { ApiError } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [method, setMethod] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string }>({});

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, timer]);

  const validateEmail = (val: string) => {
    if (!val) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(val)) return "Enter a valid email";
    return "";
  };

  const handleSendOtp = async () => {
    const err = validateEmail(email);
    if (err) {
      setErrors({ email: err });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await authService.sendOtp(email);
      setOtpSent(true);
      setTimer(59);
      toast.success(
        res.delivered ? `Verification code sent to ${email}` : "Verification code generated",
      );
      // Only ever returned when no mail provider is configured (local dev) — with mail
      // set up the code is emailed and never comes back over the API.
      if (res.otp) {
        toast.info(`Dev mode — no mail provider configured. Code: ${res.otp}`, { duration: 8000 });
        setCode(res.otp);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to send OTP.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    try {
      const res = await authService.sendOtp(email);
      setTimer(59);
      toast.success(
        res.delivered ? `New verification code sent to ${email}` : "New verification code generated",
      );
      if (res.otp) {
        toast.info(`Dev mode — no mail provider configured. Code: ${res.otp}`, { duration: 8000 });
        setCode(res.otp);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to resend OTP.";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }

    setLoading(true);
    try {
      if (method === "password") {
        if (!password) {
          setErrors({ password: "Password is required" });
          setLoading(false);
          return;
        }
        const res = await authService.login({ email, password });
        setSession(res);
        toast.success("Welcome back");
        router.push(roleHome(res.user.role));
      } else {
        if (!code || code.length !== 6) {
          setErrors({ code: "Enter a valid 6-digit code" });
          setLoading(false);
          return;
        }
        const res = await authService.loginOtp(email, code);
        setSession(res);
        toast.success("Successfully logged in");
        router.push(roleHome(res.user.role));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Authentication failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>Access your Career Rise learning space.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Toggle tabs */}
        {!otpSent && (
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => { setMethod("otp"); setErrors({}); }}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-all ${
                method === "otp" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="size-4" />
              OTP Code
            </button>
            <button
              type="button"
              onClick={() => { setMethod("password"); setErrors({}); }}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-all ${
                method === "password" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="size-4" />
              Password
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              disabled={otpSent}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </FormField>

          {method === "password" && (
            <>
              <FormField label="Password" htmlFor="password" error={errors.password}>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </FormField>
            </>
          )}

          {method === "otp" && otpSent && (
            <>
              <FormField label="Verification Code" htmlFor="code" error={errors.code}>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="text-center text-lg font-mono tracking-widest"
                />
              </FormField>

              <div className="flex items-center justify-between text-xs px-0.5 -mt-2">
                <span className="text-muted-foreground">Didn&apos;t receive code?</span>
                {timer > 0 ? (
                  <span className="text-muted-foreground font-medium">
                    Resend in <span className="font-mono text-foreground font-semibold">{timer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="font-medium text-primary hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {resending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3" />
                    )}
                    Resend code
                  </button>
                )}
              </div>
            </>
          )}

          {method === "otp" && !otpSent ? (
            <Button type="button" onClick={handleSendOtp} className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Send verification code
            </Button>
          ) : (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Verify & Log in
            </Button>
          )}

          {otpSent && (
            <button
              type="button"
              onClick={() => { setOtpSent(false); setCode(""); setTimer(0); }}
              className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" />
              Change email address
            </button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
