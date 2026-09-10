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

  /* ========================================
     CHARGER LA COMMANDE
  ======================================== */

  useEffect(() => {
    const loadOrder = () => {
      const foundOrder = getOrderById(id);

      if (foundOrder) {
        setOrder(foundOrder);
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
      window.removeEventListener(
        "ordersUpdated",
        handleOrdersUpdated
      );
    };
  }, [id]);

  if (!order) {
    return (
      <main className="order-page">
        <div className="container">
          <div className="order-not-found">
            <div className="order-not-found-icon">📦</div>

            <h1>Commande introuvable</h1>

            <p>
              Cette commande n'existe pas ou n'est plus disponible.
            </p>

            <Link to="/shop" className="order-primary-button">
              Retourner à la boutique
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("fr-FR");

  const formatDate = (date) => {
    return new Date(date).toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const getStatusContent = (status) => {
  switch (status) {
    case "Confirmée":
      return {
        title: "Commande confirmée !",
        message:
          "Votre commande a été confirmée par notre équipe.",
        icon: "✓",
        className: "confirmed",
      };

    case "En livraison":
      return {
        title: "Commande en livraison !",
        message:
          "Votre commande est actuellement en cours de livraison.",
        icon: "🚚",
        className: "delivery",
      };

    case "Livrée":
      return {
        title: "Commande livrée !",
        message:
          "Votre commande a bien été livrée. Merci pour votre confiance.",
        icon: "✓",
        className: "delivered",
      };

    case "Annulée":
      return {
        title: "Commande annulée",
        message:
          "Cette commande a été annulée.",
        icon: "×",
        className: "cancelled",
      };

    case "En attente":
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

const statusContent = getStatusContent(order.status);

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
            <span>Numéro de commande</span>

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
                  {order.status}
                </span>

              </div>

              <div className="order-meta">

                <div>
                  <span>Date</span>
                  <strong>
                    {formatDate(order.date)}
                  </strong>
                </div>

                <div>
                  <span>Paiement</span>
                  <strong>
                    {order.payment}
                  </strong>
                </div>

                <div>
                  <span>Livraison</span>
                  <strong>
                    {order.customer.zone}
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

                {order.items.map((item) => (

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
                        {item.quantity} ×{" "}
                        {formatPrice(item.price)} FCFA
                      </span>

                    </div>

                    <strong>
                      {formatPrice(
                        item.price * item.quantity
                      )} FCFA
                    </strong>

                  </div>

                ))}

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
                  <span>Client</span>

                  <strong>
                    {order.customer.firstName}{" "}
                    {order.customer.lastName}
                  </strong>
                </div>

                <div>
                  <span>Téléphone</span>

                  <strong>
                    {order.customer.phone}
                  </strong>
                </div>

                <div>
                  <span>Adresse</span>

                  <strong>
                    {order.customer.address}
                  </strong>
                </div>

                <div>
                  <span>Zone</span>

                  <strong>
                    {order.customer.zone}
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
                {order.payment}
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