import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  getOrders,
  getOrderById,
} from "../utils/ordersManager";

import "../styles/OrderTracking.css";

function OrderTracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");

  /* ========================================
     CHARGER LES COMMANDES
  ======================================== */

  const loadOrders = () => {
    const data = getOrders();

    const loadedOrders = Array.isArray(data)
      ? data
      : [];

    setOrders(loadedOrders);

    if (orderId) {
      const foundOrder = getOrderById(orderId);

      if (foundOrder) {
        setSelectedOrder(foundOrder);
      }
    }
  };

  useEffect(() => {
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
  }, [orderId]);

  /* ========================================
     RECHERCHE
  ======================================== */

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) return;

    const foundOrder = getOrderById(value);

    if (foundOrder) {
      setSelectedOrder(foundOrder);
    } else {
      setSelectedOrder(null);
    }
  };

  /* ========================================
     FORMATAGE
  ======================================== */

  const formatPrice = (value) =>
    Number(value || 0).toLocaleString("fr-FR");

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString(
      "fr-FR",
      {
        dateStyle: "long",
        timeStyle: "short",
      }
    );
  };

  /* ========================================
     ÉTAPES
  ======================================== */

  const steps = [
    {
      key: "En attente",
      icon: "📦",
      title: "Commande reçue",
      text: "Votre commande a bien été reçue.",
    },
    {
      key: "Confirmée",
      icon: "✓",
      title: "Commande confirmée",
      text: "Votre commande a été confirmée.",
    },
    {
      key: "En livraison",
      icon: "🚚",
      title: "En livraison",
      text: "Votre commande est en cours de livraison.",
    },
    {
      key: "Livrée",
      icon: "✓",
      title: "Commande livrée",
      text: "Votre commande a été livrée.",
    },
  ];

  const getStepState = (stepKey, status) => {
    if (status === "Annulée") {
      return "cancelled";
    }

    const currentIndex = steps.findIndex(
      (step) => step.key === status
    );

    const stepIndex = steps.findIndex(
      (step) => step.key === stepKey
    );

    if (currentIndex === -1) {
      return "";
    }

    if (stepIndex < currentIndex) {
      return "completed";
    }

    if (stepIndex === currentIndex) {
      return "active";
    }

    return "";
  };

  /* ========================================
     COMMANDE ANNULÉE
  ======================================== */

  const renderCancelled = () => (
    <div className="tracking-cancelled">

      <div className="tracking-cancelled-icon">
        ×
      </div>

      <span>
        COMMANDE ANNULÉE
      </span>

      <h2>
        Cette commande a été annulée
      </h2>

      <p>
        La commande{" "}
        <strong>#{selectedOrder.id}</strong>{" "}
        a été annulée.
      </p>

    </div>
  );

  /* ========================================
     RENDU
  ======================================== */

  return (
    <main className="order-tracking-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="order-tracking-header">

        <div className="container">

          <span className="order-tracking-kicker">
            SENÉPICERIE · ASSISTANCE
          </span>

          <h1>
            Suivre ma commande
          </h1>

          <p>
            Consultez en temps réel l'état de
            votre commande.
          </p>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="order-tracking-content">

        <div className="container">

          {/* RECHERCHE */}

          <section className="tracking-search-card">

            <div>

              <span>
                NUMÉRO DE COMMANDE
              </span>

              <h2>
                Où en est ma commande ?
              </h2>

              <p>
                Saisissez votre numéro de commande
                pour consulter son statut.
              </p>

            </div>

            <form
              className="tracking-search-form"
              onSubmit={handleSearch}
            >

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Ex. CMD-123456"
              />

              <button type="submit">
                Rechercher
              </button>

            </form>

          </section>

          {/* =================================
              AUCUNE COMMANDE SÉLECTIONNÉE
          ================================= */}

          {!selectedOrder && (

            <div className="tracking-empty">

              <div>
                🔎
              </div>

              <h2>
                Recherchez votre commande
              </h2>

              <p>
                Entrez le numéro de votre commande
                ci-dessus pour voir son évolution.
              </p>

              {orders.length === 0 && (
                <Link
                  to="/shop"
                  className="tracking-primary-button"
                >
                  Découvrir la boutique
                </Link>
              )}

            </div>

          )}

          {/* =================================
              COMMANDE
          ================================= */}

          {selectedOrder && (

            <section className="tracking-order-card">

              {/* HEADER */}

              <div className="tracking-order-header">

                <div>

                  <span>
                    COMMANDE
                  </span>

                  <h2>
                    #{selectedOrder.id}
                  </h2>

                  <p>
                    {formatDate(
                      selectedOrder.date
                    )}
                  </p>

                </div>

                <div
                  className={`tracking-status ${
                    selectedOrder.status ===
                    "Annulée"
                      ? "cancelled"
                      : selectedOrder.status ===
                        "Livrée"
                      ? "delivered"
                      : selectedOrder.status ===
                        "En livraison"
                      ? "delivery"
                      : selectedOrder.status ===
                        "Confirmée"
                      ? "confirmed"
                      : "pending"
                  }`}
                >
                  {selectedOrder.status ||
                    "En attente"}
                </div>

              </div>

              {/* ANNULATION */}

              {selectedOrder.status ===
                "Annulée" ? (

                renderCancelled()

              ) : (

                <>

                  {/* TIMELINE */}

                  <div className="tracking-timeline">

                    {steps.map(
                      (step, index) => {

                        const state =
                          getStepState(
                            step.key,
                            selectedOrder.status ||
                              "En attente"
                          );

                        return (
                          <div
                            className={`tracking-step ${state}`}
                            key={step.key}
                          >

                            <div className="tracking-step-marker">

                              {state ===
                              "completed"
                                ? "✓"
                                : step.icon}

                            </div>

                            <div className="tracking-step-content">

                              <span>
                                ÉTAPE {index + 1}
                              </span>

                              <h3>
                                {step.title}
                              </h3>

                              <p>
                                {step.text}
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </>

              )}

              {/* INFORMATIONS */}

              <div className="tracking-order-info">

                <div>

                  <span>
                    Client
                  </span>

                  <strong>
                    {selectedOrder.customer
                      ?.firstName || ""}{" "}
                    {selectedOrder.customer
                      ?.lastName || ""}
                  </strong>

                </div>

                <div>

                  <span>
                    Livraison
                  </span>

                  <strong>
                    {selectedOrder.customer
                      ?.zone || "Non renseignée"}
                  </strong>

                </div>

                <div>

                  <span>
                    Paiement
                  </span>

                  <strong>
                    {selectedOrder.payment ||
                      "Non renseigné"}
                  </strong>

                </div>

                <div>

                  <span>
                    Total
                  </span>

                  <strong>
                    {formatPrice(
                      selectedOrder.total
                    )}{" "}
                    FCFA
                  </strong>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="tracking-actions">

                <Link
                  to={`/order/${selectedOrder.id}`}
                  state={{
                    order: selectedOrder,
                  }}
                  className="tracking-primary-button"
                >
                  Voir les détails
                </Link>

                <Link
                  to="/my-orders"
                  className="tracking-secondary-button"
                >
                  Mes commandes
                </Link>

              </div>

            </section>

          )}

        </div>

      </section>

    </main>
  );
}

export default OrderTracking;