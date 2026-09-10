import { Link } from "react-router-dom";

import "../styles/About.css";

function About() {
  return (
    <main className="about-page">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="about-hero">

        <div className="container">

          <span className="about-kicker">
            À PROPOS DE SENÉPICERIE
          </span>

          <div className="about-hero-content">

            <div>

              <h1>
                Votre épicerie du quotidien,
                <br />
                simplement en ligne.
              </h1>

              <p>
                SENÉPICERIE est une boutique en ligne
                pensée pour faciliter vos achats
                alimentaires et du quotidien au Sénégal.
              </p>

              <Link
                to="/shop"
                className="about-primary-button"
              >
                Découvrir nos produits
              </Link>

            </div>

            <div className="about-hero-card">

              <div className="about-hero-icon">
                🛒
              </div>

              <strong>
                Une épicerie proche de vous
              </strong>

              <span>
                Des produits essentiels,
                accessibles depuis chez vous.
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          PRÉSENTATION
      ===================================== */}

      <section className="about-section">

        <div className="container">

          <div className="about-two-columns">

            <div>

              <span className="about-section-kicker">
                NOTRE HISTOIRE
              </span>

              <h2>
                Une nouvelle façon
                de faire ses courses.
              </h2>

            </div>

            <div className="about-text">

              <p>
                SENÉPICERIE a été créée avec une idée
                simple : rendre les achats du quotidien
                plus pratiques, plus rapides et plus
                accessibles.
              </p>

              <p>
                Notre boutique propose une sélection de
                produits alimentaires, d'épices, de
                boissons et de produits ménagers adaptés
                aux besoins des familles au Sénégal.
              </p>

              <p>
                Nous souhaitons offrir une expérience
                d'achat simple, claire et agréable, de la
                découverte du produit jusqu'à la livraison.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          NOS VALEURS
      ===================================== */}

      <section className="about-values-section">

        <div className="container">

          <div className="about-section-heading">

            <span className="about-section-kicker">
              NOS ENGAGEMENTS
            </span>

            <h2>
              Ce qui nous tient à cœur
            </h2>

            <p>
              Nous construisons SENÉPICERIE autour de
              valeurs simples et essentielles.
            </p>

          </div>

          <div className="about-values-grid">

            <article className="about-value-card">

              <div className="about-value-icon">
                🛍️
              </div>

              <h3>
                Simplicité
              </h3>

              <p>
                Une expérience pensée pour vous
                permettre de trouver facilement
                les produits dont vous avez besoin.
              </p>

            </article>

            <article className="about-value-card">

              <div className="about-value-icon">
                💰
              </div>

              <h3>
                Prix accessibles
              </h3>

              <p>
                Nous cherchons à proposer des prix
                compétitifs pour les produits du
                quotidien.
              </p>

            </article>

            <article className="about-value-card">

              <div className="about-value-icon">
                🚚
              </div>

              <h3>
                Proximité
              </h3>

              <p>
                Notre objectif est de rapprocher
                les produits du quotidien de nos
                clients partout où nous livrons.
              </p>

            </article>

            <article className="about-value-card">

              <div className="about-value-icon">
                🤝
              </div>

              <h3>
                Confiance
              </h3>

              <p>
                Une relation transparente avec nos
                clients, avant, pendant et après
                chaque commande.
              </p>

            </article>

          </div>

        </div>

      </section>

      {/* =====================================
          COMMENT ÇA MARCHE
      ===================================== */}

      <section className="about-section">

        <div className="container">

          <div className="about-section-heading">

            <span className="about-section-kicker">
              COMMENT ÇA MARCHE
            </span>

            <h2>
              Faire ses courses en quelques étapes
            </h2>

          </div>

          <div className="about-steps">

            <div className="about-step">

              <span className="about-step-number">
                01
              </span>

              <div>
                <h3>
                  Choisissez vos produits
                </h3>

                <p>
                  Parcourez notre boutique et ajoutez
                  vos produits préférés au panier.
                </p>
              </div>

            </div>

            <div className="about-step">

              <span className="about-step-number">
                02
              </span>

              <div>
                <h3>
                  Passez votre commande
                </h3>

                <p>
                  Vérifiez votre panier puis renseignez
                  les informations nécessaires à votre
                  commande.
                </p>
              </div>

            </div>

            <div className="about-step">

              <span className="about-step-number">
                03
              </span>

              <div>
                <h3>
                  Recevez vos produits
                </h3>

                <p>
                  Votre commande est préparée puis
                  livrée selon les zones disponibles.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          PAIEMENT
      ===================================== */}

      <section className="about-payment-section">

        <div className="container">

          <div className="about-payment-card">

            <div>

              <span className="about-section-kicker">
                PAIEMENT
              </span>

              <h2>
                Des moyens de paiement adaptés
              </h2>

              <p>
                Nous souhaitons proposer des solutions
                de paiement pratiques pour nos clients.
              </p>

            </div>

            <div className="about-payment-list">

              <span>
                ✓ Wave
              </span>

              <span>
                ✓ Orange Money
              </span>

              <span>
                ✓ Paiement à la livraison
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          CTA
      ===================================== */}

      <section className="about-cta">

        <div className="container">

          <div className="about-cta-content">

            <span>
              SENÉPICERIE
            </span>

            <h2>
              Prêt à faire vos courses ?
            </h2>

            <p>
              Découvrez notre sélection de produits
              et trouvez tout ce qu'il vous faut
              pour votre quotidien.
            </p>

            <Link
              to="/shop"
              className="about-cta-button"
            >
              Voir la boutique →
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default About;