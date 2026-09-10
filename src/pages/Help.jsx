import { Link } from "react-router-dom";
import "../styles/Help.css";

function Help() {
  return (
    <main className="help-page">

      {/* HERO */}
      <section className="help-hero">
        <div className="container">

          <span className="help-kicker">
            CENTRE D'AIDE
          </span>

          <h1>
            Comment pouvons-nous vous aider ?
          </h1>

          <p>
            Retrouvez rapidement les informations
            nécessaires pour utiliser SENÉPICERIE,
            passer une commande et suivre vos achats.
          </p>

        </div>
      </section>

      {/* RUBRIQUES */}
      <section className="help-content">
        <div className="container">

          <div className="help-grid">

            <Link
              to="/shop"
              className="help-card"
            >
              <div className="help-card-icon">
                🛒
              </div>

              <div>
                <h2>
                  Passer une commande
                </h2>

                <p>
                  Découvrez nos produits et ajoutez
                  facilement vos articles au panier.
                </p>
              </div>
            </Link>

            <Link
              to="/order-tracking"
              className="help-card"
            >
              <div className="help-card-icon">
                📦
              </div>

              <div>
                <h2>
                  Suivre une commande
                </h2>

                <p>
                  Consultez l'état de votre commande
                  et suivez son évolution.
                </p>
              </div>
            </Link>

            <Link
              to="/my-orders"
              className="help-card"
            >
              <div className="help-card-icon">
                🧾
              </div>

              <div>
                <h2>
                  Mes commandes
                </h2>

                <p>
                  Retrouvez votre historique de commandes
                  et consultez leurs détails.
                </p>
              </div>
            </Link>

            <Link
              to="/cart"
              className="help-card"
            >
              <div className="help-card-icon">
                🛍️
              </div>

              <div>
                <h2>
                  Panier et paiement
                </h2>

                <p>
                  Gérez vos articles et découvrez
                  les étapes du paiement.
                </p>
              </div>
            </Link>

          </div>

          {/* FAQ */}
          <section className="help-faq">

            <div className="help-section-heading">

              <span>
                QUESTIONS FRÉQUENTES
              </span>

              <h2>
                Les réponses aux questions courantes
              </h2>

            </div>

            <div className="help-faq-list">

              <details className="help-faq-item">
                <summary>
                  Comment passer une commande ?
                </summary>

                <p>
                  Choisissez vos produits, ajoutez-les
                  au panier puis suivez les étapes
                  indiquées pour finaliser votre commande.
                </p>
              </details>

              <details className="help-faq-item">
                <summary>
                  Quels sont les moyens de paiement ?
                </summary>

                <p>
                  Les moyens de paiement disponibles
                  sont indiqués lors de la validation
                  de votre commande.
                </p>
              </details>

              <details className="help-faq-item">
                <summary>
                  Comment suivre ma commande ?
                </summary>

                <p>
                  Rendez-vous dans la rubrique de suivi
                  des commandes pour consulter
                  l'évolution de votre commande.
                </p>
              </details>

              <details className="help-faq-item">
                <summary>
                  Puis-je consulter mes anciennes commandes ?
                </summary>

                <p>
                  Oui. La rubrique « Mes commandes »
                  vous permet de retrouver votre
                  historique et les détails de vos achats.
                </p>
              </details>

            </div>

          </section>

          {/* CONTACT */}
          <section className="help-contact">

            <div>

              <span>
                BESOIN D'UNE AIDE SUPPLÉMENTAIRE ?
              </span>

              <h2>
                Notre équipe est là pour vous accompagner.
              </h2>

              <p>
                Si vous ne trouvez pas la réponse
                recherchée, contactez-nous directement.
              </p>

            </div>

            <Link
              to="/support"
              className="help-contact-button"
            >
              Contacter le support →
            </Link>

          </section>

        </div>
      </section>

    </main>
  );
}

export default Help;