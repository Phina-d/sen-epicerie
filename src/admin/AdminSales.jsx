import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getSales,
  getTodaySalesCount,
  getTodayRevenue,
  getTodayProductsSold,
} from "../utils/salesManager";

import "../styles/AdminSales.css";

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(date) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminSales() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);

  /* ========================================
     FILTRES
  ======================================== */

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [paymentFilter, setPaymentFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const loadSales = () => {
    setSales(getSales());
  };

  useEffect(() => {
    loadSales();

    window.addEventListener(
      "salesUpdated",
      loadSales
    );

    window.addEventListener(
      "ordersUpdated",
      loadSales
    );

    return () => {
      window.removeEventListener(
        "salesUpdated",
        loadSales
      );

      window.removeEventListener(
        "ordersUpdated",
        loadSales
      );
    };
  }, []);

  /* ========================================
     STATISTIQUES
  ======================================== */

  const totalRevenue = sales.reduce(
    (total, sale) =>
      total + Number(sale.total || 0),
    0
  );

  const totalProductsSold = sales.reduce(
    (total, sale) =>
      total +
      (sale.items || []).reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      ),
    0
  );

  const todaySalesCount =
    getTodaySalesCount();

  const todayRevenue =
    getTodayRevenue();

  const todayProductsSold =
    getTodayProductsSold();

  /* ========================================
     STATUT
  ======================================== */

  const getStatusClass = (status) => {
    switch (status) {
      case "Enregistrée":
        return "sale-status-recorded";

      case "Annulée":
        return "sale-status-cancelled";

      default:
        return "";
    }
  };

  /* ========================================
     FILTRAGE DES VENTES
  ======================================== */

  const filteredSales = useMemo(() => {
    const now = new Date();

    return sales.filter((sale) => {

      /* -------------------------------
         RECHERCHE
      ------------------------------- */

      const customerName = [
        sale.customer?.firstName,
        sale.customer?.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const customerPhone =
        sale.customer?.phone || "";

      const searchableText = [
        sale.id,
        sale.orderId,
        customerName,
        customerPhone,
        sale.payment,
        sale.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatch =
        !search.trim() ||
        searchableText.includes(
          search.trim().toLowerCase()
        );

      if (!searchMatch) {
        return false;
      }

      /* -------------------------------
         PÉRIODE
      ------------------------------- */

      const saleDate = new Date(sale.date);

      if (period === "today") {
        const todayStart = new Date(now);

        todayStart.setHours(
          0,
          0,
          0,
          0
        );

        if (saleDate < todayStart) {
          return false;
        }
      }

      if (period === "7days") {
        const sevenDaysAgo = new Date(now);

        sevenDaysAgo.setHours(
          0,
          0,
          0,
          0
        );

        sevenDaysAgo.setDate(
          sevenDaysAgo.getDate() - 6
        );

        if (saleDate < sevenDaysAgo) {
          return false;
        }
      }

      if (period === "month") {
        const monthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

        if (saleDate < monthStart) {
          return false;
        }
      }

      /* -------------------------------
         PAIEMENT
      ------------------------------- */

      if (
        paymentFilter !== "all" &&
        sale.payment !== paymentFilter
      ) {
        return false;
      }

      /* -------------------------------
         STATUT
      ------------------------------- */

      if (
        statusFilter !== "all" &&
        sale.status !== statusFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    sales,
    search,
    period,
    paymentFilter,
    statusFilter,
  ]);

  /* ========================================
     OPTIONS PAIEMENT
  ======================================== */

  const paymentOptions = useMemo(() => {
    return [
      ...new Set(
        sales
          .map((sale) => sale.payment)
          .filter(Boolean)
      ),
    ];
  }, [sales]);

  /* ========================================
     RÉINITIALISATION
  ======================================== */

  const resetFilters = () => {
    setSearch("");
    setPeriod("all");
    setPaymentFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    period !== "all" ||
    paymentFilter !== "all" ||
    statusFilter !== "all";

  return (
    <main className="admin-sales-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-sales-header">

        <div className="container">

          <span className="admin-sales-kicker">
            ADMINISTRATION
          </span>

          <div className="admin-sales-title-row">

            <div>

              <h1>
                Ventes
              </h1>

              <p>
                Consultez les ventes enregistrées
                et suivez votre chiffre d'affaires.
              </p>

            </div>

            <Link
              to="/admin"
              className="admin-sales-back"
            >
              ← Tableau de bord
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="admin-sales-content">

        <div className="container">

          {/* =================================
              STATISTIQUES
          ================================= */}

          <div className="sales-stat-grid">

            <div className="sales-stat-card">

              <div className="sales-stat-icon">
                💰
              </div>

              <div>

                <span>
                  Chiffre d'affaires
                </span>

                <strong>
                  {formatPrice(totalRevenue)}
                </strong>

              </div>

            </div>

            <div className="sales-stat-card">

              <div className="sales-stat-icon">
                🧾
              </div>

              <div>

                <span>
                  Total des ventes
                </span>

                <strong>
                  {sales.length}
                </strong>

              </div>

            </div>

            <div className="sales-stat-card">

              <div className="sales-stat-icon">
                📅
              </div>

              <div>

                <span>
                  Ventes aujourd'hui
                </span>

                <strong>
                  {todaySalesCount}
                </strong>

              </div>

            </div>

            <div className="sales-stat-card">

              <div className="sales-stat-icon">
                🛒
              </div>

              <div>

                <span>
                  Produits vendus
                </span>

                <strong>
                  {totalProductsSold}
                </strong>

              </div>

            </div>

          </div>

          {/* =================================
              RÉSUMÉ DU JOUR
          ================================= */}

          <div className="today-sales-card">

            <div>

              <span>
                ACTIVITÉ DU JOUR
              </span>

              <h2>
                Aujourd'hui
              </h2>

            </div>

            <div className="today-sales-values">

              <div>

                <small>
                  Chiffre d'affaires
                </small>

                <strong>
                  {formatPrice(todayRevenue)}
                </strong>

              </div>

              <div>

                <small>
                  Ventes
                </small>

                <strong>
                  {todaySalesCount}
                </strong>

              </div>

              <div>

                <small>
                  Produits vendus
                </small>

                <strong>
                  {todayProductsSold}
                </strong>

              </div>

            </div>

          </div>

          {/* =================================
              HISTORIQUE
          ================================= */}

          <div className="admin-sales-section">

            <div className="admin-sales-section-header">

              <div>

                <span>
                  HISTORIQUE
                </span>

                <h2>
                  Toutes les ventes
                </h2>

              </div>

              <strong>
                {hasActiveFilters
                  ? `${filteredSales.length} vente${filteredSales.length > 1
                    ? "s"
                    : ""
                  } affichée${filteredSales.length > 1
                    ? "s"
                    : ""
                  } sur ${sales.length}`
                  : `${sales.length} vente${sales.length > 1
                    ? "s"
                    : ""
                  }`}
              </strong>

            </div>

            {/* =================================
                RECHERCHE + FILTRES
            ================================= */}

            <div className="admin-sales-filters">

              <div className="admin-sales-search">

                <span>
                  🔎
                </span>

                <input
                  type="search"
                  placeholder="Rechercher une vente, commande, client..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    aria-label="Effacer la recherche"
                  >
                    ×
                  </button>
                )}

              </div>

              <div className="admin-sales-filter-grid">

                <div className="admin-sales-filter">

                  <label htmlFor="sales-period">
                    Période
                  </label>

                  <select
                    id="sales-period"
                    value={period}
                    onChange={(event) =>
                      setPeriod(
                        event.target.value
                      )
                    }
                  >
                    <option value="all">
                      Toutes les périodes
                    </option>

                    <option value="today">
                      Aujourd'hui
                    </option>

                    <option value="7days">
                      7 derniers jours
                    </option>

                    <option value="month">
                      Ce mois
                    </option>
                  </select>

                </div>

                <div className="admin-sales-filter">

                  <label htmlFor="sales-payment">
                    Paiement
                  </label>

                  <select
                    id="sales-payment"
                    value={paymentFilter}
                    onChange={(event) =>
                      setPaymentFilter(
                        event.target.value
                      )
                    }
                  >

                    <option value="all">
                      Tous les paiements
                    </option>

                    {paymentOptions.map(
                      (payment) => (
                        <option
                          key={payment}
                          value={payment}
                        >
                          {payment}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="admin-sales-filter">

                  <label htmlFor="sales-status">
                    Statut
                  </label>

                  <select
                    id="sales-status"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                  >

                    <option value="all">
                      Tous les statuts
                    </option>

                    <option value="Enregistrée">
                      Enregistrée
                    </option>

                    <option value="Annulée">
                      Annulée
                    </option>

                  </select>

                </div>

                {hasActiveFilters && (

                  <button
                    type="button"
                    className="admin-sales-reset"
                    onClick={resetFilters}
                  >
                    ↻ Réinitialiser
                  </button>

                )}

              </div>

            </div>

            {/* =================================
                TABLEAU
            ================================= */}

            {filteredSales.length > 0 ? (

              <div className="admin-sales-table-wrapper">

                <table className="admin-sales-table">

                  <thead>

                    <tr>
                      <th>Vente</th>
                      <th>Commande</th>
                      <th>Client</th>
                      <th>Produits</th>
                      <th>Paiement</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredSales.map(
                      (sale) => {

                        const productsCount =
                          (
                            sale.items || []
                          ).reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              Number(
                                item.quantity ||
                                0
                              ),
                            0
                          );

                        return (
                          <tr
                            key={sale.id}
                          >

                            <td>
                              <strong>
                                {sale.id}
                              </strong>
                            </td>

                            <td>
                              <span className="sale-order-id">
                                {sale.orderId ||
                                  "—"}
                              </span>
                            </td>

                            <td>

                              <div className="admin-sale-customer">

                                <strong>
                                  {
                                    sale
                                      .customer
                                      ?.firstName
                                  }{" "}
                                  {
                                    sale
                                      .customer
                                      ?.lastName
                                  }
                                </strong>

                                <small>
                                  {
                                    sale
                                      .customer
                                      ?.phone
                                  }
                                </small>

                              </div>

                            </td>

                            <td>
                              {productsCount}
                            </td>

                            <td>
                              {sale.payment ||
                                "—"}
                            </td>

                            <td>
                              <strong>
                                {formatPrice(
                                  sale.total
                                )}
                              </strong>
                            </td>

                            <td>
                              {formatDate(
                                sale.date
                              )}
                            </td>

                            <td>

                              <span
                                className={`admin-sale-status ${getStatusClass(
                                  sale.status
                                )}`}
                              >
                                {sale.status ||
                                  "Enregistrée"}
                              </span>

                            </td>

                            {/* ACTION */}

                            <td>

                              <button
                                type="button"
                                className="admin-sale-view-button"
                                onClick={() => setSelectedSale(sale)}
                              >
                                👁️ Voir
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="admin-sales-empty">

                <div>
                  {hasActiveFilters
                    ? "🔎"
                    : "💰"}
                </div>

                <h2>
                  {hasActiveFilters
                    ? "Aucune vente trouvée"
                    : "Aucune vente"}
                </h2>

                <p>
                  {hasActiveFilters
                    ? "Aucune vente ne correspond aux critères de recherche sélectionnés."
                    : "Les ventes enregistrées après validation des commandes apparaîtront ici."}
                </p>

                {hasActiveFilters ? (

                  <button
                    type="button"
                    className="admin-sales-empty-button"
                    onClick={resetFilters}
                  >
                    Réinitialiser les filtres
                  </button>

                ) : (

                  <Link
                    to="/admin/orders"
                    className="admin-sales-empty-button"
                  >
                    Voir les commandes
                  </Link>

                )}

              </div>

            )}

          </div>

        </div>

      </section>

      {/* =====================================
    MODALE DÉTAILS DE LA VENTE
===================================== */}

      {selectedSale && (

        <div
          className="admin-sale-modal-overlay"
          onClick={() => setSelectedSale(null)}
        >

          <div
            className="admin-sale-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="admin-sale-modal-header">

              <div>

                <span>
                  DÉTAIL DE LA VENTE
                </span>

                <h2>
                  {selectedSale.id}
                </h2>

              </div>

              <button
                type="button"
                className="admin-sale-modal-close"
                onClick={() =>
                  setSelectedSale(null)
                }
                aria-label="Fermer"
              >
                ×
              </button>

            </div>

            {/* INFORMATIONS */}

            <div className="admin-sale-modal-info">

              <div>

                <span>
                  Commande
                </span>

                <strong>
                  {selectedSale.orderId || "—"}
                </strong>

              </div>

              <div>

                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    selectedSale.date
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Paiement
                </span>

                <strong>
                  {selectedSale.payment || "—"}
                </strong>

              </div>

              <div>

                <span>
                  Statut
                </span>

                <strong
                  className={`admin-sale-modal-status ${getStatusClass(
                    selectedSale.status
                  )}`}
                >
                  {selectedSale.status ||
                    "Enregistrée"}
                </strong>

              </div>

            </div>

            {/* CLIENT */}

            <div className="admin-sale-modal-section">

              <div className="admin-sale-modal-section-title">

                <span>
                  👤
                </span>

                <h3>
                  Informations client
                </h3>

              </div>

              <div className="admin-sale-customer-box">

                <strong>
                  {
                    selectedSale.customer
                      ?.firstName
                  }{" "}
                  {
                    selectedSale.customer
                      ?.lastName
                  }
                </strong>

                <span>
                  📞{" "}
                  {
                    selectedSale.customer
                      ?.phone || "Non renseigné"
                  }
                </span>

                {selectedSale.customer?.email && (

                  <span>
                    ✉️{" "}
                    {
                      selectedSale.customer.email
                    }
                  </span>

                )}

                {selectedSale.customer?.address && (

                  <span>
                    📍{" "}
                    {
                      selectedSale.customer.address
                    }
                  </span>

                )}

              </div>

            </div>

            {/* PRODUITS */}

            <div className="admin-sale-modal-section">

              <div className="admin-sale-modal-section-title">

                <span>
                  🛒
                </span>

                <h3>
                  Produits
                </h3>

              </div>

              <div className="admin-sale-products">

                {(selectedSale.items || []).map(
                  (item, index) => {

                    const quantity =
                      Number(
                        item.quantity || 0
                      );

                    const price =
                      Number(
                        item.price || 0
                      );

                    const subtotal =
                      price * quantity;

                    return (

                      <div
                        className="admin-sale-product"
                        key={
                          item.id ||
                          `${item.name}-${index}`
                        }
                      >

                        <div className="admin-sale-product-info">

                          <strong>
                            {item.name ||
                              "Produit"}
                          </strong>

                          {item.variant && (

                            <small>
                              {item.variant}
                            </small>

                          )}

                        </div>

                        <div className="admin-sale-product-quantity">

                          ×{quantity}

                        </div>

                        <div className="admin-sale-product-price">

                          {formatPrice(
                            subtotal
                          )}

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

            {/* TOTAL */}

            <div className="admin-sale-modal-total">

              <div>

                <span>
                  Sous-total
                </span>

                <strong>
                  {formatPrice(
                    selectedSale.subtotal ??
                    (
                      selectedSale.items ||
                      []
                    ).reduce(
                      (total, item) =>
                        total +
                        Number(
                          item.price || 0
                        ) *
                        Number(
                          item.quantity || 0
                        ),
                      0
                    )
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Livraison
                </span>

                <strong>
                  {formatPrice(
                    selectedSale.shipping
                  )}
                </strong>

              </div>

              <div className="admin-sale-grand-total">

                <span>
                  Total
                </span>

                <strong>
                  {formatPrice(
                    selectedSale.total
                  )}
                </strong>

              </div>

            </div>

            {/* FOOTER */}

            <div className="admin-sale-modal-footer">

              <button
                type="button"
                className="admin-sale-modal-secondary"
                onClick={() =>
                  setSelectedSale(null)
                }
              >
                Fermer
              </button>

            </div>

          </div>

        </div>

      )}
    </main>
  );
}

export default AdminSales;