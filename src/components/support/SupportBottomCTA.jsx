import { Link } from "react-router-dom";

export default function SupportBottomCTA() {
  return (
    <section className="support-bottom-cta">
      <div className="container">

        <div className="support-bottom-cta-inner">

          <div>
            <span>
              SENÉPICERIE
            </span>

            <h2>
              Besoin de retrouver vos commandes ?
            </h2>

            <p>
              Consultez votre historique de commandes
              en quelques secondes.
            </p>
          </div>

          <Link
            to="/my-orders"
            className="support-bottom-cta-button"
          >
            Mes commandes →
          </Link>

        </div>

      </div>
    </section>
  );
}