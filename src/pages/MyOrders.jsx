import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../utils/ordersManager";

import "../styles/MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);

  /* ========================================
     CHARGER LES COMMANDES
  ======================================== */

  useEffect(() => {
    const loadOrders = () => {
      const data = getOrders();

      setOrders(
        Array.isArray(data)
          ? [...data].sort(
              (a, b) =>
                new Date(b.date) -
                new Date(a.date)
            )
          : []
      );
    };

    loadOrders();

    window.addEventListener(
      "ordersUpdated",
      loadOrders
    );

    return () => {
      window.removeEventListener(
        "ordersUpdated",
        loadOrders
      );
    };
  }, []);

  /* ========================================
     FORMATAGE
  ======================================== */

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("fr-FR");

  const formatDate = (date) => {
    if (!date) return "Date inconnue";

    return new Date(date).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* ========================================
     STATUT
  ======================================== */

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmée":
        return "confirmed";

      case "En livraison":
        return "delivery";

      case "Livrée":
        return "delivered";

      case "Annulée":
        return "cancelled";

      case "En attente":
      default:
        return "pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmée":
        return "✓";

      case "En livraison":
        return "🚚";

      case "Livrée":
        return "✓";

      case "Annulée":
        return "×";

      case "En attente":
      default:
        return "⏳";
    }
  };

  /* ========================================
     AUCUNE COMMANDE
  ======================================== */

  if (orders.length === 0) {
    return (
      <main className="my-orders-page">

        <section className="my-orders-header">
          <div className="container">

            <span className="my-orders-kicker">
              SENÉPICERIE · CLIENT
            </span>

            <h1>
              Mes commandes
            </h1>

            <p>
              Retrouvez ici l'historique de
              toutes vos commandes.
            </p>

          </div>
        </section>

        <section className="my-orders-content">
          <div className="container">

            <div className="my-orders-empty">

              <div className="my-orders-empty-icon">
                📦
              </div>

              <h2>
                Aucune commande
              </h2>

              <p>
                Vous n'avez pas encore passé
                de commande.
              </p>

              <Link
                to="/shop"
                className="my-orders-primary-button"
              >
                Découvrir la boutique
              </Link>

            </div>

          </div>
        </section>

      </main>
    );
  }

  /* ========================================
     RENDU
  ======================================== */

  return (
    <main className="my-orders-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="my-orders-header">

        <div className="container">

          <span className="my-orders-kicker">
            SENÉPICERIE · CLIENT
          </span>

          <div className="my-orders-title-row">

            <div>

              <h1>
                Mes commandes
              </h1>

              <p>
                Retrouvez l'historique de
                toutes vos commandes.
              </p>

            </div>

            <Link
              to="/shop"
              className="my-orders-back"
            >
              ← Continuer mes achats
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="my-orders-content">

        <div className="container">

          {/* RÉSUMÉ */}

          <div className="my-orders-summary">

            <div>
              <span>
                Commandes
              </span>

              <strong>
                {orders.length}
              </strong>
            </div>

            <div>
              <span>
                Dernière commande
              </span>

              <strong>
                {formatDate(
                  orders[0]?.date
                )}
              </strong>
            </div>

          </div>

          {/* LISTE */}

          <div className="my-orders-list">

            {orders.map((order) => {

              const statusClass =
                getStatusClass(
                  order.status
                );

              return (
                <article
                  className="my-order-card"
                  key={order.id}
                >

                  {/* HEADER COMMANDE */}

                  <div className="my-order-card-header">

                    <div>

                      <span className="my-order-label">
                        COMMANDE
                      </span>

                      <h2>
                        #{order.id}
                      </h2>

                      <p>
                        {formatDate(
                          order.date
                        )}
                      </p>

                    </div>

                    <div
                      className={`my-order-status ${statusClass}`}
                    >

                      <span>
                        {getStatusIcon(
                          order.status
                        )}
                      </span>

                      {order.status ||
                        "En attente"}

                    </div>

                  </div>

                  {/* PRODUITS */}

                  <div className="my-order-products">

                    {(order.items || [])
                      .slice(0, 3)
                      .map((item) => (

                        <div
                          className="my-order-product"
                          key={item.id}
                        >

                          <div className="my-order-product-icon">
                            🛒
                          </div>

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              {item.quantity} ×{" "}
                              {formatPrice(
                                item.price
                              )} FCFA
                            </span>

                          </div>

                        </div>

                      ))}

                  </div>

                  {/* PIED */}

                  <div className="my-order-card-footer">

                    <div>

                      <span>
                        Total
                      </span>

                      <strong>
                        {formatPrice(
                          order.total
                        )} FCFA
                      </strong>

                    </div>

                    <div className="my-order-actions">

                      <Link
                        to={`/order/${order.id}`}
                        state={{
                          order,
                        }}
                        className="my-order-view"
                      >
                        Voir les détails →
                      </Link>

                      <Link
                        to={`/order-tracking?order=${order.id}`}
                        className="my-order-track"
                      >
                        Suivre
                      </Link>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

        </div>

      </section>

    </main>
  );
}

export default MyOrders;