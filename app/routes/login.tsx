import { useState } from "react";
import { data, Form, Link, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { portal } from "../config";
import { Icon } from "../components/icon";
import { safeOrigin } from "../lib/policy";
import { safeReturnPath } from "../lib/domain";
import { rawBackend, APIError, apiBase } from "../lib/api.server";
import {
  readSession,
  publicUser,
  type PortalUser,
} from "../lib/session.server";

export function meta() {
  return [
    { title: `Sign in · ${portal.name}` },
    { name: "robots", content: "noindex" },
  ];
}
export const headers = () => ({ "Cache-Control": "private, no-store" });
export async function loader({ request }: Route.LoaderArgs) {
  const { session } = await readSession(request);
  if (session?.get("user") && portal.roles.includes(session.get("user")!.role))
    return redirect("/");
  return data(
    {
      step: session?.get("preAuthToken")
        ? "2fa"
        : session?.get("phone")
          ? "otp"
          : "credentials",
      phone: session?.get("phone") ?? "",
      next: safeReturnPath(new URL(request.url).searchParams.get("next")),
      configured: !!apiBase(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function action({ request }: Route.ActionArgs) {
  if (!safeOrigin(request))
    return data(
      { error: "Request origin denied.", step: "credentials" },
      { status: 403 },
    );
  const { storage, session } = await readSession(request);
  if (!storage || !session || !apiBase())
    return data(
      {
        error:
          "Sign-in is being prepared. You can explore the sample workspace meanwhile.",
        step: "credentials",
      },
      { status: 503 },
    );
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const next = safeReturnPath(form.get("next"));
  let step = "credentials";
  try {
    let result: Record<string, unknown>;
    if (portal.id === "team") {
      if (intent === "2fa") {
        step = "2fa";
        const code = String(form.get("code") ?? "");
        const pre = session.get("preAuthToken");
        if (!pre || !/^\d{6}$/.test(code))
          return data(
            { error: "Enter the six-digit authenticator code.", step },
            { status: 400 },
          );
        result = await rawBackend("/admin/login/2fa", "POST", {
          pre_auth_token: pre,
          totp_code: code,
        });
      } else {
        const email = String(form.get("email") ?? "").trim();
        const password = String(form.get("password") ?? "");
        if (
          email.length > 200 ||
          password.length > 200 ||
          !email.includes("@") ||
          password.length < 1
        )
          return data(
            { error: "Enter your work email and password.", step },
            { status: 400 },
          );
        result = await rawBackend("/admin/login", "POST", { email, password });
        if (
          result.requires_2fa === true &&
          typeof result.pre_auth_token === "string"
        ) {
          session.set("preAuthToken", result.pre_auth_token);
          return data(
            { step: "2fa", error: "" },
            {
              headers: {
                "Set-Cookie": await storage.commitSession(session, {
                  maxAge: 300,
                }),
                "Cache-Control": "no-store",
              },
            },
          );
        }
        return data(
          {
            error:
              "Two-step verification must be enabled for this staff account. Please contact your administrator.",
            step,
          },
          { status: 403 },
        );
      }
    } else {
      const phone = String(
        form.get("phone") ?? session.get("phone") ?? "",
      ).trim();
      const country = String(form.get("country") ?? "BD");
      if (
        phone.length < 7 ||
        phone.length > 25 ||
        !/^\+?[\d\s()-]+$/.test(phone) ||
        !/^[A-Z]{2}$/.test(country)
      )
        return data(
          { error: "Enter a valid phone number and country.", step },
          { status: 400 },
        );
      if (intent === "send-otp") {
        await rawBackend("/auth/send-otp", "POST", {
          phone,
          country_code: country,
        });
        session.set("phone", phone);
        return data(
          { step: "otp", phone, error: "" },
          {
            headers: {
              "Set-Cookie": await storage.commitSession(session, {
                maxAge: 300,
              }),
              "Cache-Control": "no-store",
            },
          },
        );
      }
      step = "otp";
      const code = String(form.get("code") ?? "");
      if (!/^\d{6}$/.test(code))
        return data(
          { error: "Enter the six-digit code sent to your phone.", step },
          { status: 400 },
        );
      result = await rawBackend("/auth/verify-otp", "POST", {
        phone,
        country_code: country,
        otp: code,
      });
    }
    const user = result.user as PortalUser | undefined;
    if (
      !user ||
      typeof user.id !== "string" ||
      typeof user.role !== "string" ||
      !portal.roles.includes(user.role)
    )
      return data(
        {
          error:
            "This account does not have an approved role for this workspace. Your Ringdo administrator can review access.",
          step,
        },
        { status: 403 },
      );
    if (
      typeof result.access_token !== "string" ||
      typeof result.refresh_token !== "string"
    )
      throw new APIError(502, "The session could not be created.");
    session.set("user", publicUser(user)!);
    session.set("accessToken", result.access_token);
    session.set("refreshToken", result.refresh_token);
    session.unset("preAuthToken");
    session.unset("phone");
    return redirect(next, {
      status: 303,
      headers: {
        "Set-Cookie": await storage.commitSession(session, {
          maxAge: 60 * 60 * 8,
        }),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return data(
      {
        error:
          e instanceof APIError
            ? e.message
            : "Sign-in could not be completed. Please try again.",
        step,
      },
      {
        status: e instanceof APIError ? e.status : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
export default function Login({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [bn, setBn] = useState(false);
  const t = (en: string, bangla: string) => (bn ? bangla : en);
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const step = actionData?.step ?? loaderData.step;
  const team = portal.id === "team";
  const phone =
    "phone" in (actionData ?? {})
      ? String((actionData as { phone?: string }).phone ?? loaderData.phone)
      : loaderData.phone;
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>ringdo</span>
        </Link>
        <div>
          <div className="eyebrow">
            {t("GOOD THINGS ARE CLOSE BY", "প্রয়োজনের সবকিছু কাছেই")}
          </div>
          <h1>
            {t("Closer to a better everyday.", "আরও সহজ প্রতিদিনের কাছে।")}
          </h1>
          <p>
            {t(
              "A trusted local connection for the people, places and services that make your day.",
              "প্রতিদিনের প্রয়োজনের মানুষ, দোকান আর সেবার সঙ্গে বিশ্বস্ত যোগাযোগ।",
            )}
          </p>
          <div className="auth-illustration">
            <span className="auth-ring" />
            <span className="auth-store">
              <Icon name={portal.icon} size={95} />
            </span>
            <span className="auth-bubble one">
              <Icon name="shield" />
              Verified connections
            </span>
            <span className="auth-bubble two">
              <Icon name="location" />
              Right around the corner
            </span>
          </div>
        </div>
        <span>© 2026 Ringdo · {portal.name}</span>
      </aside>
      <main className="auth-main">
        <div className="auth-top">
          <Link to="/?preview=1">
            {t("Explore the preview", "প্রিভিউ দেখুন")}
            <Icon name="arrow" size={15} />
          </Link>
          <button className="language-button" onClick={() => setBn(!bn)}>
            {bn ? "EN" : "বাংলা"}
          </button>
        </div>
        <section className="auth-card">
          <span className="auth-symbol">
            <Icon name={step === "2fa" ? "shield" : portal.icon} size={27} />
          </span>
          <p className="eyebrow">{portal.name.toUpperCase()}</p>
          <h2>
            {t(
              step === "2fa"
                ? "One more step."
                : step === "otp"
                  ? "Check your phone."
                  : "Welcome to your workspace.",
              step === "2fa"
                ? "আর একটি ধাপ।"
                : step === "otp"
                  ? "আপনার ফোনে দেখুন।"
                  : "আপনার ওয়ার্কস্পেসে স্বাগতম।",
            )}
          </h2>
          <p>
            {t(
              step === "2fa"
                ? "Enter the current code from your authenticator app."
                : step === "otp"
                  ? "Enter the six-digit verification code sent to your number."
                  : team
                    ? "Use your authorized staff account and two-step verification."
                    : "Sign in with your phone number to continue.",
              step === "2fa"
                ? "অথেনটিকেটর অ্যাপের বর্তমান কোড লিখুন।"
                : step === "otp"
                  ? "আপনার নম্বরে পাঠানো ছয় সংখ্যার কোড লিখুন।"
                  : team
                    ? "অনুমোদিত স্টাফ অ্যাকাউন্ট ও দুই ধাপের যাচাই ব্যবহার করুন।"
                    : "ফোন নম্বর দিয়ে সাইন ইন করুন।",
            )}
          </p>
          {actionData?.error && (
            <div className="notice error" role="alert">
              {actionData.error}
            </div>
          )}
          <Form method="post">
            <input type="hidden" name="next" value={loaderData.next} />
            {team && step === "credentials" ? (
              <>
                <label className="field">
                  <span>{t("Work email", "অফিসের ইমেইল")}</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    maxLength={200}
                  />
                </label>
                <label className="field">
                  <span>{t("Password", "পাসওয়ার্ড")}</span>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    maxLength={200}
                  />
                </label>
              </>
            ) : !team && step === "credentials" ? (
              <>
                <label className="field">
                  <span>{t("Country", "দেশ")}</span>
                  <select name="country">
                    <option value="BD">Bangladesh (+880)</option>
                  </select>
                </label>
                <label className="field">
                  <span>{t("Phone number", "ফোন নম্বর")}</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="01712 345678"
                    minLength={7}
                    maxLength={25}
                  />
                </label>
              </>
            ) : (
              <>
                <input type="hidden" name="phone" value={phone} />
                <input type="hidden" name="country" value="BD" />
                <label className="field">
                  <span>{t("Six-digit code", "ছয় সংখ্যার কোড")}</span>
                  <input
                    name="code"
                    className="otp-input"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    required
                    minLength={6}
                    maxLength={6}
                  />
                </label>
              </>
            )}
            <button
              className="button primary full"
              disabled={busy}
              name="intent"
              value={
                team
                  ? step === "2fa"
                    ? "2fa"
                    : "credentials"
                  : step === "otp"
                    ? "verify-otp"
                    : "send-otp"
              }
            >
              {t(
                busy
                  ? "Please wait…"
                  : step === "otp" || step === "2fa"
                    ? "Verify & continue"
                    : team
                      ? "Continue securely"
                      : "Send verification code",
                busy
                  ? "অপেক্ষা করুন…"
                  : step === "otp" || step === "2fa"
                    ? "যাচাই করে এগিয়ে যান"
                    : team
                      ? "নিরাপদে এগিয়ে যান"
                      : "যাচাইয়ের কোড পাঠান",
              )}
              <Icon name="arrow" size={17} />
            </button>
          </Form>
          <div className="auth-security">
            <Icon name="lock" size={14} />
            {t(
              "Protected sign-in for your Ringdo workspace.",
              "আপনার রিংডো ওয়ার্কস্পেসের জন্য সুরক্ষিত সাইন ইন।",
            )}
          </div>
          <div className="auth-preview-link">
            <span>{t("Just taking a look?", "শুধু ঘুরে দেখতে চান?")}</span>
            <Link to="/?preview=1">
              {t(
                "Try the interactive preview",
                "ইন্টার‌্যাক্টিভ প্রিভিউ দেখুন",
              )}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
