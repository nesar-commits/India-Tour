import { useEffect } from "react";
import { Link } from "react-router-dom";
import { authApi } from "./authApi.js";
import { useAuthForm } from "./useAuthForm.js";
import { validateSignup } from "./validation.js";
import TextField from "../components/form/TextField.jsx";
import Checkbox from "../components/form/Checkbox.jsx";
import Button from "../components/form/Button.jsx";
import FormAlert from "../components/form/FormAlert.jsx";
import PasswordStrength from "../components/form/PasswordStrength.jsx";
import { ArrowRightIcon, CheckCircleIcon, LockIcon, MailIcon, UserIcon } from "../components/Icons.jsx";

export default function SignupPage() {
  const { values, field, handleSubmit, status, formError, submitting } = useAuthForm({
    initialValues: { name: "", email: "", password: "", confirmPassword: "", terms: false },
    validate: validateSignup,
    onSubmit: authApi.register,
  });

  useEffect(() => {
    document.title = "Create account · India-Tour";
    return () => (document.title = "India Tour");
  }, []);

  if (status === "success") {
    return (
      <section className="auth-card auth-success" aria-labelledby="signup-done">
        <span className="auth-success-icon">
          <CheckCircleIcon size={32} />
        </span>
        <h1 id="signup-done" className="auth-title">
          Welcome aboard, {values.name.trim().split(" ")[0]}!
        </h1>
        <p className="auth-subtitle">
          Your India-Tour account for <strong>{values.email.trim()}</strong> is ready.
        </p>
        <Link to="/login" className="btn btn-primary">
          Continue to log in
          <ArrowRightIcon size={18} />
        </Link>
      </section>
    );
  }

  return (
    <section className="auth-card" aria-labelledby="signup-title">
      <p className="auth-eyebrow">Create your account</p>
      <h1 id="signup-title" className="auth-title">
        Discover India, one unforgettable journey at a time.
      </h1>
      <p className="auth-subtitle">Join free and keep every destination you love in one place.</p>

      {formError && (
        <FormAlert
          tone="error"
          title={formError.kind === "unavailable" ? "Sign-up isn't live yet" : "Couldn't create your account"}
        >
          {formError.message}
          {formError.kind === "exists" && (
            <>
              {" "}
              <Link to="/login">Log in</Link>
            </>
          )}
        </FormAlert>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Full name"
          icon={UserIcon}
          autoComplete="name"
          placeholder="Aarav Sharma"
          maxLength={80}
          disabled={submitting}
          {...field("name")}
        />
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
          autoComplete="new-password"
          placeholder="Create a password"
          maxLength={128}
          disabled={submitting}
          hint={<PasswordStrength password={values.password} />}
          {...field("password")}
        />
        <TextField
          label="Confirm password"
          icon={LockIcon}
          revealable
          autoComplete="new-password"
          placeholder="Re-enter your password"
          maxLength={128}
          disabled={submitting}
          {...field("confirmPassword")}
        />

        <Checkbox disabled={submitting} {...field("terms")}>
          I agree to the{" "}
          <Link to="/terms" target="_blank" rel="noreferrer">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" target="_blank" rel="noreferrer">
            Privacy Policy
          </Link>
          .
        </Checkbox>

        <Button type="submit" loading={submitting} loadingText="Creating your account…">
          Create account
          <ArrowRightIcon size={18} />
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
