
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";

import "../styles/AdminLogin.css";

export default function AdminLogin() {
  const { signIn, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recovering, setRecovering] = useState(false);

  if (loading) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-loading">
          Vérification de la session...
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }

    if (!password) {
      setError("Veuillez saisir votre mot de passe.");
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (loginError) {
      console.error("Erreur de connexion Admin :", loginError);
      setError("Adresse e-mail ou mot de passe incorrect.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setSuccess("");

    const emailAddress = email.trim();

    if (!emailAddress) {
      setError(
        "Saisissez votre adresse e-mail avant de demander la réinitialisation."
      );
      return;
    }

    try {
      setRecovering(true);

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(emailAddress, {
          redirectTo: `${window.location.origin}/sen-epicerie/admin/reset-password`,
        });

      if (resetError) {
        throw resetError;
      }

      setSuccess(
        "Si cette adresse correspond à un compte, un e-mail de réinitialisation va être envoyé. Vérifiez votre boîte de réception et vos courriers indésirables."
      );
    } catch (resetError) {
      console.error("Erreur de réinitialisation :", resetError);
      setError(
        "Impossible d'envoyer le lien pour le moment. Vérifiez la configuration des URL dans Supabase, puis réessayez."
      );
    } finally {
      setRecovering(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-wrapper">
        <section className="admin-login-card">
          <div className="admin-login-header">
            <span className="admin-login-kicker">
              SENÉPICERIE
            </span>

            <h1>Administration</h1>

            <p>
              Connectez-vous pour accéder à votre espace administrateur.
            </p>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="admin-login-success" role="status">
              {success}
            </div>
          )}

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-login-field">
              <label htmlFor="admin-email">
                Adresse e-mail
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@senepicerie.com"
                autoComplete="email"
                disabled={submitting || recovering}
                required
              />
            </div>

            <div className="admin-login-field admin-password-field">
              <label htmlFor="admin-password">
                Mot de passe
              </label>

              <div className="admin-password-wrapper">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  disabled={submitting || recovering}
                  required
                />

                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  aria-pressed={showPassword}
                  title={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  disabled={submitting || recovering}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.4 3.3" />
                      <path d="M6.2 6.2C3.9 7.6 2.4 9.7 2 12c1 2.5 4.5 7 10 7 1.2 0 2.3-.2 3.3-.6" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-login-button"
              disabled={submitting || recovering}
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <button
            type="button"
            className="admin-forgot-password"
            onClick={handlePasswordReset}
            disabled={submitting || recovering}
          >
            {recovering
              ? "Envoi en cours..."
              : "Mot de passe oublié ?"}
          </button>

          <div className="admin-login-footer">
            <span>
              🔒 Accès réservé à l'administration
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
