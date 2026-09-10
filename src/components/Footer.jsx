import { Link } from "react-router-dom";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="site-footer">

      <div className="container">

        <div className="footer-content">

          {/* MARQUE */}
          <div className="footer-brand">

            <Link to="/" className="footer-logo">
              🇸🇳 SenÉpicerie
            </Link>

            <p>
              Votre épicerie en ligne pour retrouver
              facilement les produits du quotidien.
            </p>

          </div>

          {/* NAVIGATION */}
          <div className="footer-column">

            <h3>
              Navigation
            </h3>

            <Link to="/">
              Accueil
            </Link>

            <Link to="/shop">
              Boutique
            </Link>

            <Link to="/favorites">
              Favoris
            </Link>

            <Link to="/cart">
              Panier
            </Link>

          </div>

          {/* INFORMATIONS */}
          <div className="footer-column">

            <h3>
              Informations
            </h3>

            <Link to="/about">
              À propos
            </Link>

            <Link to="/help">
              Aide
            </Link>

            <Link to="/support">
              Support
            </Link>

            <Link to="/terms">
              Conditions d'utilisation
            </Link>

          </div>

          {/* CONTACT */}
          <div className="footer-column">

            <h3>
              Contact
            </h3>

            <p>
              📍 Dakar, Sénégal
            </p>

            <p>
              📞 +221 XX XXX XX XX
            </p>

            <p>
              ✉️ contact@senepicerie.sn
            </p>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} SenÉpicerie.
            Tous droits réservés.
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;