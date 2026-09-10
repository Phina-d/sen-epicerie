import { Link } from "react-router-dom";

import "../styles/Terms.css";

function Terms() {
  return (
    <main className="terms-page">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="terms-hero">

        <div className="container">

          <span className="terms-kicker">
            SENÉPICERIE · INFORMATIONS
          </span>

          <h1>
            Conditions d'utilisation
          </h1>

          <p>
            Les présentes conditions définissent les règles
            applicables à l'utilisation de SENÉPICERIE et
            aux commandes effectuées sur notre boutique en ligne.
          </p>

          <div className="terms-updated">
            Dernière mise à jour : septembre 2026
          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="terms-content">

        <div className="container">

          <div className="terms-layout">

            {/* SOMMAIRE */}

            <aside className="terms-sidebar">

              <div className="terms-sidebar-card">

                <span>
                  SOMMAIRE
                </span>

                <a href="#acceptation">
                  1. Acceptation des conditions
                </a>

                <a href="#service">
                  2. Présentation du service
                </a>

                <a href="#commandes">
                  3. Commandes
                </a>

                <a href="#prix">
                  4. Prix et paiement
                </a>

                <a href="#livraison">
                  5. Livraison
                </a>

                <a href="#responsabilite">
                  6. Responsabilité
                </a>

                <a href="#donnees">
                  7. Données personnelles
                </a>

                <a href="#modification">
                  8. Modification des conditions
                </a>

                <a href="#contact">
                  9. Contact
                </a>

              </div>

            </aside>

            {/* ARTICLES */}

            <article className="terms-article">

              <section id="acceptation">

                <span className="terms-number">
                  01
                </span>

                <h2>
                  Acceptation des conditions
                </h2>

                <p>
                  En accédant au site SENÉPICERIE ou en utilisant
                  ses services, vous reconnaissez avoir pris
                  connaissance des présentes conditions
                  d'utilisation et les accepter sans réserve.
                </p>

                <p>
                  Si vous n'acceptez pas ces conditions, nous
                  vous invitons à ne pas utiliser nos services.
                </p>

              </section>

              <section id="service">

                <span className="terms-number">
                  02
                </span>

                <h2>
                  Présentation du service
                </h2>

                <p>
                  SENÉPICERIE est une boutique en ligne permettant
                  aux clients de consulter des produits, de les
                  ajouter au panier et de passer des commandes.
                </p>

                <p>
                  Les produits proposés peuvent notamment
                  comprendre des produits alimentaires, des
                  boissons, des épices et des produits ménagers.
                </p>

              </section>

              <section id="commandes">

                <span className="terms-number">
                  03
                </span>

                <h2>
                  Commandes
                </h2>

                <p>
                  Le client peut sélectionner les produits
                  disponibles et les ajouter à son panier avant
                  de procéder à la validation de sa commande.
                </p>

                <p>
                  Avant la validation définitive, le client doit
                  vérifier les informations relatives aux produits,
                  aux quantités, à l'adresse de livraison et au
                  montant total de la commande.
                </p>

                <div className="terms-info-box">
                  <strong>
                    Important
                  </strong>

                  <p>
                    Une commande validée constitue une demande
                    d'achat. Elle peut être soumise à une
                    confirmation de notre équipe.
                  </p>
                </div>

              </section>

              <section id="prix">

                <span className="terms-number">
                  04
                </span>

                <h2>
                  Prix et paiement
                </h2>

                <p>
                  Les prix affichés sur SENÉPICERIE sont indiqués
                  en francs CFA (FCFA), sauf indication contraire.
                </p>

                <p>
                  Les moyens de paiement disponibles peuvent
                  notamment inclure :
                </p>

                <ul>
                  <li>Wave</li>
                  <li>Orange Money</li>
                  <li>Paiement à la livraison</li>
                </ul>

                <p>
                  Les frais de livraison applicables sont affichés
                  avant la validation de la commande.
                </p>

              </section>

              <section id="livraison">

                <span className="terms-number">
                  05
                </span>

                <h2>
                  Livraison
                </h2>

                <p>
                  Les commandes sont livrées à l'adresse indiquée
                  par le client lors de la validation de la
                  commande.
                </p>

                <p>
                  Les délais de livraison peuvent varier en
                  fonction de la zone géographique, de la
                  disponibilité des produits et des conditions
                  opérationnelles.
                </p>

                <p>
                  Le client doit fournir des informations de
                  livraison exactes afin de permettre le bon
                  acheminement de sa commande.
                </p>

              </section>

              <section id="responsabilite">

                <span className="terms-number">
                  06
                </span>

                <h2>
                  Responsabilité
                </h2>

                <p>
                  SENÉPICERIE met en œuvre les moyens nécessaires
                  pour assurer la disponibilité et le bon
                  fonctionnement du service.
                </p>

                <p>
                  Toutefois, SENÉPICERIE ne peut être tenue
                  responsable des interruptions ou perturbations
                  résultant de circonstances indépendantes de
                  sa volonté.
                </p>

              </section>

              <section id="donnees">

                <span className="terms-number">
                  07
                </span>

                <h2>
                  Données personnelles
                </h2>

                <p>
                  Les informations communiquées par le client
                  peuvent être utilisées pour traiter les
                  commandes, organiser les livraisons et assurer
                  le suivi du service.
                </p>

                <p>
                  SENÉPICERIE s'engage à traiter les informations
                  personnelles conformément aux règles applicables
                  en matière de protection des données.
                </p>

              </section>

              <section id="modification">

                <span className="terms-number">
                  08
                </span>

                <h2>
                  Modification des conditions
                </h2>

                <p>
                  SENÉPICERIE peut modifier les présentes
                  conditions d'utilisation lorsque cela est
                  nécessaire, notamment pour tenir compte de
                  l'évolution du service ou de la réglementation.
                </p>

                <p>
                  La version publiée sur le site est la version
                  applicable au moment de l'utilisation du service.
                </p>

              </section>

              <section id="contact">

                <span className="terms-number">
                  09
                </span>

                <h2>
                  Contact
                </h2>

                <p>
                  Pour toute question concernant ces conditions
                  d'utilisation, vous pouvez contacter notre
                  équipe via la page Support.
                </p>

                <Link
                  to="/support"
                  className="terms-contact-button"
                >
                  Contacter le support →
                </Link>

              </section>

            </article>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Terms;