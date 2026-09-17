import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/AdminLogin.css";

export default function AdminLogin() {
  const {
    signIn,
    isAuthenticated,
    loading,
  } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      await signIn(
        email.trim(),
        password
      );

      navigate("/admin", {
        replace: true,
      });
    } catch (loginError) {
      console.error(
        "❌ Erreur de connexion Admin :",
        loginError
      );

      setError(
        "Adresse e-mail ou mot de passe incorrect."
      );
    } finally {
      setSubmitting(false);
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

            <h1>
              Administration
            </h1>

            <p>
              Connectez-vous pour accéder
              à votre espace administrateur.
            </p>
          </div>

          {error && (
            <div
              className="admin-login-error"
              role="alert"
            >
              {error}
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
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@senepicerie.com"
                autoComplete="email"
                disabled={submitting}
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">
                Mot de passe
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="admin-login-button"
              disabled={submitting}
            >
              {submitting
                ? "Connexion..."
                : "Se connecter"}
            </button>

          </form>

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