import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/AdminResetPassword.css";

export default function AdminResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const checkRecoverySession = async () => {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!active) return;

      if (sessionError || !data?.session) {
        setError(
          "Le lien est invalide ou a expiré. Demandez un nouveau lien de réinitialisation."
        );
        setReady(false);
      } else {
        setReady(true);
      }

      setChecking(false);
    };

    checkRecoverySession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;

        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
          setError("");
          setChecking(false);
        }
      }
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    try {
      setSaving(true);

      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setSuccess(
        "Votre mot de passe a été modifié. Vous allez être redirigé vers la connexion."
      );

      await supabase.auth.signOut();

      window.setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 1800);
    } catch (updateError) {
      console.error("Erreur de changement de mot de passe :", updateError);
      setError(
        "Impossible de modifier le mot de passe. Le lien a peut-être expiré ; demandez-en un nouveau."
      );
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <main className="admin-reset-page">
        <section className="admin-reset-card">
          Vérification du lien de réinitialisation...
        </section>
      </main>
    );
  }

  return (
    <main className="admin-reset-page">
      <section className="admin-reset-card">
        <span className="admin-reset-kicker">SENÉPICERIE</span>
        <h1>Nouveau mot de passe</h1>
        <p>Choisissez un nouveau mot de passe pour votre compte administrateur.</p>

        {error && <div className="admin-reset-message error" role="alert">{error}</div>}
        {success && <div className="admin-reset-message success" role="status">{success}</div>}

        {ready && !success && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={saving}
            />

            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              disabled={saving}
            />

            <button type="submit" disabled={saving}>
              {saving ? "Modification en cours..." : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>
        )}

        {!ready && !success && (
          <button
            type="button"
            onClick={() => navigate("/admin/login", { replace: true })}
          >
            Retour à la connexion
          </button>
        )}
      </section>
    </main>
  );
}
