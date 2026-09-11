import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { getOrderById } from "../utils/ordersManager";

import "../styles/OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(
    location.state?.order || null
  );

  const [loading, setLoading] = useState(
    !location.state?.order
  );

  /* ========================================
     CHARGER LA COMMANDE DEPUIS SUPABASE
  ======================================== */

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        setLoading(true);

        const foundOrder = await getOrderById(id);

        if (isMounted) {
          setOrder(foundOrder || null);
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors du chargement de la commande :",
          error
        );

        if (isMounted) {
          setOrder(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    /* Mise à jour lorsque l'administration
       modifie la commande */

    const handleOrdersUpdated = () => {
      loadOrder();
    };

    window.addEventListener(
      "ordersUpdated",
      handleOrdersUpdated
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        "ordersUpdated",
        handleOrdersUpdated
      );
    };
  }, [id]);

  /* ========================================
     CHARGEMENT
  ======================================== */

  if (loading) {
    return (
      <main className="order-page">
        <div className="container">
          <div className="order-not-found">
            <div className="order-not-found-icon">
              📦
            </div>

            <h1>
              Chargement de votre commande...
            </h1>

            <p>
              Nous récupérons les informations de votre
              commande.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================
     COMMANDE INTROUVABLE
  ======================================== */

  if (!order) {
    return (
      <main className="order-page">
        <div className="container">
          <div className="order-not-found">
            <div className="order-not-found-icon">
              📦
            </div>

            <h1>
              Commande introuvable
            </h1>

            <p>
              Cette commande n'existe pas ou n'est plus
              disponible.
            </p>

            <Link
              to="/shop"
              className="order-primary-button"
            >
              Retourner à la boutique
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================
     DONNÉES SÉCURISÉES
  ======================================== */

  const customer = order.customer || {};
  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("fr-FR");

  const formatDate = (date) => {
    if (!date) {
      return "Date non disponible";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date non disponible";
    }

    return parsedDate.toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  /* ========================================
     STATUT
  ======================================== */

  const getStatusContent = (status) => {
    switch (status) {
      case "Confirmée":
      case "confirmée":
        return {
          title: "Commande confirmée !",
          message:
            "Votre commande a été confirmée par notre équipe.",
          icon: "✓",
          className: "confirmed",
        };

      case "En livraison":
      case "en livraison":
        return {
          title: "Commande en livraison !",
          message:
            "Votre commande est actuellement en cours de livraison.",
          icon: "🚚",
          className: "delivery",
        };

      case "Livrée":
      case "livrée":
        return {
          title: "Commande livrée !",
          message:
            "Votre commande a bien été livrée. Merci pour votre confiance.",
          icon: "✓",
          className: "delivered",
        };

      case "Annulée":
      case "annulée":
        return {
          title: "Commande annulée",
          message:
            "Cette commande a été annulée.",
          icon: "×",
          className: "cancelled",
        };

      case "En attente":
      case "en attente":
      default:
        return {
          title: "Commande reçue !",
          message:
            "Merci pour votre commande. Nous avons bien reçu votre demande et elle est actuellement en attente de traitement.",
          icon: "✓",
          className: "pending",
        };
    }
  };

  const statusContent = getStatusContent(
    order.status
  );

  return (
    <main className="order-page">
      <div className="container">

        {/* =====================================
            CONFIRMATION
        ===================================== */}

        <section
          className={`order-success ${statusContent.className}`}
        >
          <div className="success-icon">
            {statusContent.icon}
          </div>

          <span className="order-kicker">
            SENÉPICERIE
          </span>

          <h1>
            {statusContent.title}
          </h1>

          <p>
            {statusContent.message}
          </p>

          <div className="order-number">
            <span>
              Numéro de commande
            </span>

            <strong>
              {order.id}
            </strong>
          </div>
        </section>

        {/* =====================================
            INFORMATIONS
        ===================================== */}

        <div className="order-layout">

          <section className="order-main">

            {/* =====================================
                INFORMATIONS COMMANDE
            ===================================== */}

            <div className="order-card">

              <div className="order-card-header">

                <div>
                  <span className="order-label">
                    COMMANDE
                  </span>

                  <h2>
                    Détails de la commande
                  </h2>
                </div>

                <span className="order-status">
                  {order.status || "En attente"}
                </span>

              </div>

              <div className="order-meta">

                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {formatDate(order.date)}
                  </strong>
                </div>

                <div>
                  <span>
                    Paiement
                  </span>

                  <strong>
                    {order.payment ||
                      "À la livraison"}
                  </strong>
                </div>

                <div>
                  <span>
                    Livraison
                  </span>

                  <strong>
                    {customer.zone ||
                      "Zone non renseignée"}
                  </strong>
                </div>

              </div>

            </div>

            {/* =====================================
                PRODUITS
            ===================================== */}

            <div className="order-card">

              <h2>
                Produits commandés
              </h2>

              <div className="order-products">

                {items.length > 0 ? (
                  items.map((item) => (

                    <div
                      className="order-product"
                      key={item.id}
                    >

                      <div className="order-product-icon">
                        🛒
                      </div>

                      <div className="order-product-info">

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {Number(item.quantity || 0)} ×{" "}
                          {formatPrice(item.price)} FCFA
                        </span>

                      </div>

                      <strong>
                        {formatPrice(
                          Number(item.price || 0) *
                            Number(item.quantity || 0)
                        )} FCFA
                      </strong>

                    </div>

                  ))
                ) : (
                  <p>
                    Aucun produit dans cette commande.
                  </p>
                )}

              </div>

            </div>

            {/* =====================================
                CLIENT
            ===================================== */}

            <div className="order-card">

              <h2>
                Informations de livraison
              </h2>

              <div className="customer-info">

                <div>
                  <span>
                    Client
                  </span>

                  <strong>
                    {customer.firstName || ""}{" "}
                    {customer.lastName || ""}
                  </strong>
                </div>

                <div>
                  <span>
                    Téléphone
                  </span>

                  <strong>
                    {customer.phone ||
                      "Non renseigné"}
                  </strong>
                </div>

                <div>
                  <span>
                    Adresse
                  </span>

                  <strong>
                    {customer.address ||
                      "Non renseignée"}
                  </strong>
                </div>

                <div>
                  <span>
                    Zone
                  </span>

                  <strong>
                    {customer.zone ||
                      "Non renseignée"}
                  </strong>
                </div>

              </div>

            </div>

          </section>

          {/* =====================================
              RÉCAPITULATIF
          ===================================== */}

          <aside className="order-summary">

            <h2>
              Résumé
            </h2>

            <div className="summary-row">

              <span>
                Sous-total
              </span>

              <strong>
                {formatPrice(order.subtotal)} FCFA
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Livraison
              </span>

              <strong>
                {formatPrice(order.shipping)} FCFA
              </strong>

            </div>

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                {formatPrice(order.total)} FCFA
              </strong>

            </div>

            <div className="payment-info">

              <span>
                Mode de paiement
              </span>

              <strong>
                {order.payment ||
                  "À la livraison"}
              </strong>

            </div>

            <Link
              to="/shop"
              className="order-primary-button"
            >
              Continuer mes achats
            </Link>

            <Link
              to="/"
              className="order-secondary-button"
            >
              Retour à l'accueil
            </Link>

          </aside>

        </div>

      </div>
    </main>
  );
}

export default OrderDetails;