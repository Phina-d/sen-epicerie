import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getSales,
} from "../utils/salesManager";

import "../styles/AdminSales.css";

/* =========================================================
   OUTILS
========================================================= */

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString(
    "fr-FR"
  )} FCFA`;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   NORMALISER UNE VENTE / COMMANDE
========================================================= */

function normalizeSale(sale) {
  if (!sale) {
    return null;
  }

  const items =
    Array.isArray(sale.items)
      ? sale.items
      : [];

  const normalizedItems = items.map(
    (item) => ({
      ...item,

      id:
        item.id ||
        item.productId ||
        item.product_id ||
        "",

      name:
        item.name ||
        item.productName ||
        item.product_name ||
        "Produit",

      price:
        Number(
          item.price ??
            item.unitPrice ??
            item.unit_price ??
            0
        ) || 0,

      quantity:
        Number(item.quantity || 0),
    })
  );

  const totalProducts = normalizedItems.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  return {
    ...sale,

    id:
      sale.id ||
      sale.orderId ||
      "",

    orderId:
      sale.orderId ||
      sale.id ||
      "",

    customer:
      sale.customer &&
      typeof sale.customer === "object"
        ? sale.customer
        : {},

    items: normalizedItems,

    totalProducts,

    subtotal:
      Number(sale.subtotal || 0),

    shipping:
      Number(sale.shipping || 0),

    total:
      Number(sale.total || 0),

    orderTotal:
      Number(
        sale.total ||
          sale.orderTotal ||
          0
      ),

    payment:
      sale.payment ||
      "À la livraison",

    status:
      sale.status ||
      "Enregistrée",

    date:
      sale.date ||
      sale.created_at ||
      new Date().toISOString(),
  };
}

/* =========================================================
   ADMIN SALES
========================================================= */

function AdminSales() {
  const [sales, setSales] = useState([]);

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* ========================================
     FILTRES
  ======================================== */

  const [search, setSearch] =
    useState("");

  const [period, setPeriod] =
    useState("all");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  /* ========================================
     CHARGEMENT DES VENTES
  ======================================== */

  const loadSales = async () => {
    try {
      setLoading(true);

      const salesFromSupabase =
        await getSales();

      const normalizedSales =
        Array.isArray(
          salesFromSupabase
        )
          ? salesFromSupabase
              .map(normalizeSale)
              .filter(Boolean)
          : [];

      setSales(normalizedSales);

      console.log(
        `✅ ${normalizedSales.length} vente(s) affichée(s) dans AdminSales`
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement des ventes :",
        error
      );

      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  /* ========================================
     ÉCOUTER LES MODIFICATIONS
  ======================================== */

  useEffect(() => {
    loadSales();

    const handleSalesUpdated = () => {
      loadSales();
    };

    const handleOrdersUpdated = () => {
      loadSales();
    };

    window.addEventListener(
      "salesUpdated",
      handleSalesUpdated
    );

    window.addEventListener(
      "ordersUpdated",
      handleOrdersUpdated
    );

    return () => {
      window.removeEventListener(
        "salesUpdated",
        handleSalesUpdated
      );

      window.removeEventListener(
        "ordersUpdated",
        handleOrdersUpdated
      );
    };
  }, []);

  /* ========================================
     STATISTIQUES GÉNÉRALES
  ======================================== */

  const totalRevenue = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total +
        Number(sale.total || 0),
      0
    );
  }, [sales]);

  const totalProductsSold =
    useMemo(() => {
      return sales.reduce(
        (total, sale) =>
          total +
          Number(
            sale.totalProducts || 0
          ),
        0
      );
    }, [sales]);

  /* ========================================
     STATISTIQUES DU JOUR
  ======================================== */

  const todayStats = useMemo(() => {
    const now = new Date();

    const todayStart = new Date(now);

    todayStart.setHours(
      0,
      0,
      0,
      0
    );

    const todaySales =
      sales.filter((sale) => {
        if (!sale.date) {
          return false;
        }

        const saleDate =
          new Date(sale.date);

        return (
          !Number.isNaN(
            saleDate.getTime()
          ) &&
          saleDate >= todayStart
        );
      });

    const revenue =
      todaySales.reduce(
        (total, sale) =>
          total +
          Number(sale.total || 0),
        0
      );

    const products =
      todaySales.reduce(
        (total, sale) =>
          total +
          Number(
            sale.totalProducts || 0
          ),
        0
      );

    return {
      count: todaySales.length,
      revenue,
      products,
    };
  }, [sales]);

  /* ========================================
     STATUT
  ======================================== */

  const getStatusClass = (
    status
  ) => {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "enregistrée":
      case "enregistree":
        return "sale-status-recorded";

      case "annulée":
      case "annulee":
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
      /* -----------------------------------
         RECHERCHE
      ----------------------------------- */

      const customerName = [
        sale.customer?.firstName,
        sale.customer?.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const customerPhone =
        sale.customer?.phone || "";

      const searchableProducts =
        Array.isArray(sale.items)
          ? sale.items
              .map(
                (item) =>
                  item.name || ""
              )
              .join(" ")
          : "";

      const searchableText = [
        sale.id,
        sale.orderId,
        customerName,
        customerPhone,
        sale.payment,
        sale.status,
        searchableProducts,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatch =
        !search.trim() ||
        searchableText.includes(
          search
            .trim()
            .toLowerCase()
        );

      if (!searchMatch) {
        return false;
      }

      /* -----------------------------------
         DATE
      ----------------------------------- */

      const saleDate =
        new Date(sale.date);

      if (
        Number.isNaN(
          saleDate.getTime()
        )
      ) {
        return false;
      }

      /* -----------------------------------
         PÉRIODE
      ----------------------------------- */

      if (period === "today") {
        const todayStart =
          new Date(now);

        todayStart.setHours(
          0,
          0,
          0,
          0
        );

        if (
          saleDate <
          todayStart
        ) {
          return false;
        }
      }

      if (period === "7days") {
        const sevenDaysAgo =
          new Date(now);

        sevenDaysAgo.setHours(
          0,
          0,
          0,
          0
        );

        sevenDaysAgo.setDate(
          sevenDaysAgo.getDate() - 6
        );

        if (
          saleDate <
          sevenDaysAgo
        ) {
          return false;
        }
      }

      if (period === "month") {
        const monthStart =
          new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          );

        if (
          saleDate <
          monthStart
        ) {
          return false;
        }
      }

      /* -----------------------------------
         PAIEMENT
      ----------------------------------- */

      if (
        paymentFilter !== "all" &&
        sale.payment !==
          paymentFilter
      ) {
        return false;
      }

      /* -----------------------------------
         STATUT
      ----------------------------------- */

      if (
        statusFilter !== "all" &&
        sale.status !==
          statusFilter
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
     OPTIONS DE PAIEMENT
  ======================================== */

  const paymentOptions = useMemo(() => {
    return [
      ...new Set(
        sales
          .map(
            (sale) =>
              sale.payment
          )
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

  /* ========================================
     AFFICHAGE
  ======================================== */

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
                Consultez les ventes
                enregistrées et suivez
                votre chiffre d'affaires.
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
                  {formatPrice(
                    totalRevenue
                  )}
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
                  {todayStats.count}
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
                  {formatPrice(
                    todayStats.revenue
                  )}
                </strong>

              </div>

              <div>

                <small>
                  Ventes
                </small>

                <strong>
                  {todayStats.count}
                </strong>

              </div>

              <div>

                <small>
                  Produits vendus
                </small>

                <strong>
                  {todayStats.products}
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
                  ? `${filteredSales.length} vente${
                      filteredSales.length >
                      1
                        ? "s"
                        : ""
                    } affichée${
                      filteredSales.length >
                      1
                        ? "s"
                        : ""
                    } sur ${
                      sales.length
                    }`
                  : `${sales.length} vente${
                      sales.length >
                      1
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
                    value={
                      paymentFilter
                    }
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
                    value={
                      statusFilter
                    }
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

                    <option value="en attente">
                      En attente
                    </option>

                    <option value="confirmée">
                      Confirmée
                    </option>

                    <option value="expédiée">
                      Expédiée
                    </option>

                    <option value="livrée">
                      Livrée
                    </option>

                  </select>

                </div>

                {hasActiveFilters && (

                  <button
                    type="button"
                    className="admin-sales-reset"
                    onClick={
                      resetFilters
                    }
                  >
                    ↻ Réinitialiser
                  </button>

                )}

              </div>

            </div>

            {/* =================================
                CHARGEMENT
            ================================= */}

            {loading ? (

              <div className="admin-sales-empty">

                <div>
                  ⏳
                </div>

                <h2>
                  Chargement des ventes...
                </h2>

                <p>
                  Récupération des ventes
                  depuis Supabase.
                </p>

              </div>

            ) : filteredSales.length > 0 ? (

              /* =================================
                  TABLEAU
              ================================= */

              <div className="admin-sales-table-wrapper">

                <table className="admin-sales-table">

                  <thead>

                    <tr>
                      <th>Vente</th>
                      <th>Commande</th>
                      <th>Client</th>
                      <th>Produits</th>
                      <th>Qté</th>
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

                        const firstProduct =
                          sale.items?.[0];

                        const productCount =
                          Array.isArray(
                            sale.items
                          )
                            ? sale.items.length
                            : 0;

                        return (
                          <tr
                            key={
                              sale.id
                            }
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
                                      ?.phone ||
                                    "—"
                                  }
                                </small>

                              </div>

                            </td>

                            <td>

                              <strong>
                                {firstProduct?.name ||
                                  "Produit"}

                                {productCount >
                                  1 && (
                                  <span>
                                    {" "}
                                    +{" "}
                                    {productCount -
                                      1}{" "}
                                    autre
                                    {productCount -
                                      1 >
                                    1
                                      ? "s"
                                      : ""}
                                  </span>
                                )}
                              </strong>

                            </td>

                            <td>
                              {Number(
                                sale.totalProducts ||
                                  0
                              )}
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

                            <td>

                              <button
                                type="button"
                                className="admin-sale-view-button"
                                onClick={() =>
                                  setSelectedSale(
                                    sale
                                  )
                                }
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

              /* =================================
                  AUCUNE VENTE
              ================================= */

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
                    onClick={
                      resetFilters
                    }
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
          MODALE DÉTAILS
      ===================================== */}

      {selectedSale && (

        <div
          className="admin-sale-modal-overlay"
          onClick={() =>
            setSelectedSale(null)
          }
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
                  {selectedSale.orderId ||
                    "—"}
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
                  {selectedSale.payment ||
                    "—"}
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
                    selectedSale
                      .customer
                      ?.firstName
                  }{" "}

                  {
                    selectedSale
                      .customer
                      ?.lastName
                  }

                </strong>

                <span>

                  📞{" "}

                  {
                    selectedSale
                      .customer
                      ?.phone ||
                    "Non renseigné"
                  }

                </span>

                {selectedSale
                  .customer
                  ?.email && (

                  <span>

                    ✉️{" "}

                    {
                      selectedSale
                        .customer
                        .email
                    }

                  </span>

                )}

                {selectedSale
                  .customer
                  ?.address && (

                  <span>

                    📍{" "}

                    {
                      selectedSale
                        .customer
                        .address
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
                  Produits vendus
                </h3>

              </div>

              <div className="admin-sale-products">

                {Array.isArray(
                  selectedSale.items
                ) &&
                selectedSale.items.length >
                  0 ? (

                  selectedSale.items.map(
                    (item, index) => {

                      const quantity =
                        Number(
                          item.quantity ||
                            0
                        );

                      const unitPrice =
                        Number(
                          item.price ||
                            item.unitPrice ||
                            item.unit_price ||
                            0
                        );

                      const itemTotal =
                        unitPrice *
                        quantity;

                      return (
                        <div
                          className="admin-sale-product"
                          key={
                            item.id ||
                            `${selectedSale.id}-${index}`
                          }
                        >

                          <div className="admin-sale-product-info">

                            <strong>
                              {item.name ||
                                "Produit"}
                            </strong>

                            <small>
                              {formatPrice(
                                unitPrice
                              )}{" "}
                              / unité
                            </small>

                          </div>

                          <div className="admin-sale-product-quantity">

                            ×
                            {quantity}

                          </div>

                          <div className="admin-sale-product-price">

                            {formatPrice(
                              itemTotal
                            )}

                          </div>

                        </div>
                      );
                    }
                  )

                ) : (

                  <div className="admin-sale-product">

                    <div className="admin-sale-product-info">

                      <strong>
                        Produit
                      </strong>

                    </div>

                    <div className="admin-sale-product-quantity">

                      ×0

                    </div>

                    <div className="admin-sale-product-price">

                      {formatPrice(0)}

                    </div>

                  </div>

                )}

              </div>

            </div>

            {/* TOTAL */}

            <div className="admin-sale-modal-total">

              <div>

                <span>
                  Sous-total commande
                </span>

                <strong>
                  {formatPrice(
                    selectedSale.subtotal
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
                  Total commande
                </span>

                <strong>
                  {formatPrice(
                    selectedSale.orderTotal ||
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