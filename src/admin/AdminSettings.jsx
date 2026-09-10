import { useState } from "react";
import { Link } from "react-router-dom";

import "../styles/AdminSettings.css";

function AdminSettings() {
  const [settings, setSettings] = useState({
    shopName: "SENÉPICERIE",
    phone: "77 000 00 00",
    email: "contact@senepicerie.com",
    address: "Dakar, Sénégal",
    currency: "FCFA",
    defaultShipping: "2000",
    wave: true,
    orangeMoney: true,
    cashOnDelivery: true,
    notifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem(
      "senepicerie_settings",
      JSON.stringify(settings)
    );

    setSaved(true);
  };

  return (
    <main className="admin-settings-page">

      {/* HEADER */}

      <section className="admin-settings-header">
        <div className="container">

          <span className="admin-settings-kicker">
            ADMINISTRATION
          </span>

          <div className="admin-settings-title-row">

            <div>
              <h1>Paramètres</h1>

              <p>
                Configurez les informations et les
                options de votre boutique.
              </p>
            </div>

            <Link
              to="/admin"
              className="admin-settings-back"
            >
              ← Tableau de bord
            </Link>

          </div>

        </div>
      </section>

      {/* CONTENU */}

      <section className="admin-settings-content">
        <div className="container">

          <form onSubmit={handleSubmit}>

            {/* INFORMATIONS BOUTIQUE */}

            <section className="admin-settings-card">

              <div className="admin-settings-card-header">
                <div>
                  <span>IDENTITÉ</span>

                  <h2>
                    Informations de la boutique
                  </h2>

                  <p>
                    Les informations générales de
                    votre boutique.
                  </p>
                </div>
              </div>

              <div className="admin-settings-grid">

                <div className="admin-settings-group">
                  <label htmlFor="shopName">
                    Nom de la boutique
                  </label>

                  <input
                    id="shopName"
                    name="shopName"
                    value={settings.shopName}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-settings-group">
                  <label htmlFor="phone">
                    Téléphone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-settings-group">
                  <label htmlFor="email">
                    Adresse e-mail
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-settings-group">
                  <label htmlFor="address">
                    Adresse
                  </label>

                  <input
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                  />
                </div>

              </div>

            </section>

            {/* LIVRAISON */}

            <section className="admin-settings-card">

              <div className="admin-settings-card-header">
                <div>
                  <span>LIVRAISON</span>

                  <h2>
                    Configuration de la livraison
                  </h2>

                  <p>
                    Définissez les paramètres utilisés
                    pour les livraisons.
                  </p>
                </div>
              </div>

              <div className="admin-settings-grid">

                <div className="admin-settings-group">

                  <label htmlFor="currency">
                    Devise
                  </label>

                  <select
                    id="currency"
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                  >
                    <option value="FCFA">
                      FCFA
                    </option>
                  </select>

                </div>

                <div className="admin-settings-group">

                  <label htmlFor="defaultShipping">
                    Frais de livraison par défaut
                  </label>

                  <div className="input-with-suffix">

                    <input
                      id="defaultShipping"
                      name="defaultShipping"
                      type="number"
                      min="0"
                      value={settings.defaultShipping}
                      onChange={handleChange}
                    />

                    <span>FCFA</span>

                  </div>

                </div>

              </div>

            </section>

            {/* PAIEMENT */}

            <section className="admin-settings-card">

              <div className="admin-settings-card-header">
                <div>
                  <span>PAIEMENT</span>

                  <h2>
                    Modes de paiement
                  </h2>

                  <p>
                    Activez ou désactivez les moyens
                    de paiement disponibles.
                  </p>
                </div>
              </div>

              <div className="admin-settings-options">

                <label className="settings-option">

                  <div>
                    <strong>💙 Wave</strong>

                    <span>
                      Paiement mobile Wave
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="wave"
                    checked={settings.wave}
                    onChange={handleChange}
                  />

                </label>

                <label className="settings-option">

                  <div>
                    <strong>🟠 Orange Money</strong>

                    <span>
                      Paiement mobile Orange Money
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="orangeMoney"
                    checked={settings.orangeMoney}
                    onChange={handleChange}
                  />

                </label>

                <label className="settings-option">

                  <div>
                    <strong>💵 Paiement à la livraison</strong>

                    <span>
                      Le client paie lors de la réception
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="cashOnDelivery"
                    checked={settings.cashOnDelivery}
                    onChange={handleChange}
                  />

                </label>

              </div>

            </section>

            {/* NOTIFICATIONS */}

            <section className="admin-settings-card">

              <div className="admin-settings-card-header">
                <div>
                  <span>NOTIFICATIONS</span>

                  <h2>
                    Notifications
                  </h2>

                  <p>
                    Gérez les notifications de
                    l'administration.
                  </p>
                </div>
              </div>

              <label className="settings-option">

                <div>
                  <strong>
                    🔔 Notifications de commandes
                  </strong>

                  <span>
                    Être informé lorsqu'une nouvelle
                    commande est enregistrée.
                  </span>
                </div>

                <input
                  type="checkbox"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                />

              </label>

            </section>

            {/* ACTION */}

            <div className="admin-settings-actions">

              {saved && (
                <span className="settings-saved">
                  ✓ Paramètres enregistrés
                </span>
              )}

              <button
                type="submit"
                className="admin-settings-save"
              >
                Enregistrer les paramètres
              </button>

            </div>

          </form>

        </div>
      </section>

    </main>
  );
}

export default AdminSettings;