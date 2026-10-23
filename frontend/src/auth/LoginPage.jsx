import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "./authApi.js";
import { useAuthForm } from "./useAuthForm.js";
import { validateLogin } from "./validation.js";
import TextField from "../components/form/TextField.jsx";
import Checkbox from "../components/form/Checkbox.jsx";
import Button from "../components/form/Button.jsx";
import FormAlert from "../components/form/FormAlert.jsx";
import { ArrowRightIcon, LockIcon, MailIcon } from "../components/Icons.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showResetNote, setShowResetNote] = useState(false);
  const { field, handleSubmit, status, formError, submitting } = useAuthForm({
    initialValues: { email: "", password: "", remember: true },
    validate: validateLogin,
    onSubmit: authApi.login,
  });

  useEffect(() => {
    document.title = "Log in · India-Tour";
    return () => (document.title = "India Tour");
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    const t = setTimeout(() => navigate("/", { replace: true }), 1200);
    return () => clearTimeout(t);
  }, [status, navigate]);

  return (
    <section className="auth-card" aria-labelledby="login-title">
      <p className="auth-eyebrow">Welcome back</p>
      <h1 id="login-title" className="auth-title">
        Your next Indian adventure starts here.
      </h1>
      <p className="auth-subtitle">Log in to save destinations and plan journeys across India.</p>

      {status === "success" && (
        <FormAlert tone="success" title="You're logged in">
          Taking you to India-Tour…
        </FormAlert>
      )}
      {formError && (
        <FormAlert tone="error" title={formError.kind === "unavailable" ? "Sign-in isn't live yet" : "Couldn't log you in"}>
          {formError.message}
        </FormAlert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email address"
          icon={MailIcon}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={submitting}
          {...field("email")}
        />
        <TextField
          label="Password"
          icon={LockIcon}
          revealable
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={submitting}
          {...field("password")}
        />

        <div className="auth-row">
          <Checkbox disabled={submitting} {...field("remember")}>
            Remember me
          </Checkbox>
          <button
            type="button"
            className="auth-link"
            onClick={() => setShowResetNote(true)}
            aria-expanded={showResetNote}
            aria-controls="reset-note"
          >
            Forgot password?
          </button>
        </div>

        {showResetNote && (
          <div id="reset-note">
            <FormAlert tone="info">
              Password reset isn't available yet. It will arrive together with account sign-in.
            </FormAlert>
          </div>
        )}

        <Button type="submit" loading={submitting} loadingText="Logging in…" disabled={status === "success"}>
          Log in
          <ArrowRightIcon size={18} />
        </Button>
      </form>

      <p className="auth-switch">
        New to India-Tour? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  );
}
