import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  getProducts,
} from "../utils/productsManager";

import {
  getSales,
  getTodaySales,
  getTodayRevenue,
  getTodaySalesCount,
  getTodayProductsSold,
} from "../utils/salesManager";

import "../styles/AdminDashboard.css";

const LOW_STOCK_LIMIT = 10;

/* ========================================
   FORMATAGE
======================================== */

function formatPrice(value) {
  return `${Number(
    value || 0
  ).toLocaleString(
    "fr-FR"
  )} FCFA`;
}

function formatDate(date) {
  if (!date) {
    return "Date inconnue";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Date inconnue";
  }

  return parsedDate.toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* ========================================
   NOM DU CLIENT
======================================== */

function getCustomerName(sale) {
  return `${sale.customer?.firstName || ""} ${
    sale.customer?.lastName || ""
  }`.trim() || "Client inconnu";
}

/* ========================================
   IMPRESSION DU TABLEAU DE BORD
======================================== */

function printDashboard({
  todayRevenue,
  todaySalesCount,
  todayProductsSold,
  products,
  lowStockProducts,
  outOfStockProducts,
  bestSellingProducts,
  recentSales,
}) {
  const printWindow =
    window.open(
      "",
      "_blank",
      "width=1100,height=800"
    );

  if (!printWindow) {
    window.alert(
      "Impossible d'ouvrir la fenêtre d'impression. Vérifiez que les fenêtres pop-up sont autorisées."
    );

    return;
  }

  const stockRows = [
    ...outOfStockProducts,
    ...lowStockProducts,
  ]
    .slice(0, 10)
    .map(
      (product) => `
        <tr>
          <td>${product.name || "Produit"}</td>
          <td>${product.category || "—"}</td>
          <td>${Number(product.stock || 0)}</td>
          <td>
            ${
              Number(product.stock || 0) <= 0
                ? "Rupture"
                : `${product.stock} ${
                    product.unit || ""
                  }`
            }
          </td>
        </tr>
      `
    )
    .join("");

  const bestProductsRows =
    bestSellingProducts
      .map(
        (product, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${product.name || "Produit"}</td>
            <td>${product.quantity}</td>
            <td>${formatPrice(
              product.revenue
            )}</td>
          </tr>
        `
      )
      .join("");

  const salesRows =
    recentSales
      .map(
        (sale) => `
          <tr>
            <td>${sale.id || "—"}</td>
            <td>${getCustomerName(sale)}</td>
            <td>${sale.payment || "Non précisé"}</td>
            <td>${formatPrice(
              sale.total
            )}</td>
            <td>${formatDate(
              sale.date
            )}</td>
          </tr>
        `
      )
      .join("");

  const generatedAt =
    new Date().toLocaleString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  printWindow.document.write(`
    <!DOCTYPE html>

    <html lang="fr">

      <head>

        <meta charset="UTF-8" />

        <title>
          Tableau de bord - SENÉPICERIE
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 35px;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            color: #222;
            background: #fff;
          }

          .document {
            max-width: 1100px;
            margin: 0 auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #222;
            margin-bottom: 30px;
          }

          .brand {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .subtitle {
            margin-top: 7px;
            color: #666;
          }

          .date {
            text-align: right;
            color: #666;
            font-size: 13px;
          }

          .section {
            margin-bottom: 35px;
          }

          .section-title {
            margin: 0 0 15px;
            font-size: 20px;
          }

          .stats {
            display: grid;
            grid-template-columns:
              repeat(4, 1fr);
            gap: 15px;
          }

          .stat {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 18px;
          }

          .stat span {
            display: block;
            color: #666;
            font-size: 13px;
            margin-bottom: 8px;
          }

          .stat strong {
            display: block;
            font-size: 20px;
          }

          .grid {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 25px;
          }

          .box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 10px;
            border-bottom:
              1px solid #e5e5e5;
            text-align: left;
            font-size: 13px;
          }

          th {
            background: #f5f5f5;
            font-weight: 700;
          }

          td:last-child,
          th:last-child {
            text-align: right;
          }

          .empty {
            padding: 20px;
            text-align: center;
            color: #777;
          }

          .footer {
            margin-top: 45px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #777;
            font-size: 12px;
          }

          @media print {

            body {
              padding: 0;
            }

            .document {
              max-width: none;
            }

            .box,
            .stat {
              break-inside: avoid;
            }

            .section {
              break-inside: auto;
            }

          }

        </style>

      </head>

      <body>

        <div class="document">

          <div class="header">

            <div>

              <div class="brand">
                SENÉPICERIE
              </div>

              <div class="subtitle">
                Tableau de bord administratif
              </div>

            </div>

            <div class="date">
              Impression :<br />
              ${generatedAt}
            </div>

          </div>

          <section class="section">

            <h2 class="section-title">
              Résumé de la journée
            </h2>

            <div class="stats">

              <div class="stat">
                <span>
                  Chiffre d'affaires
                </span>

                <strong>
                  ${formatPrice(
                    todayRevenue
                  )}
                </strong>
              </div>

              <div class="stat">
                <span>
                  Ventes aujourd'hui
                </span>

                <strong>
                  ${todaySalesCount}
                </strong>
              </div>

              <div class="stat">
                <span>
                  Produits vendus
                </span>

                <strong>
                  ${todayProductsSold}
                </strong>
              </div>

              <div class="stat">
                <span>
                  Produits en catalogue
                </span>

                <strong>
                  ${products.length}
                </strong>
              </div>

            </div>

          </section>

          <section class="section">

            <div class="grid">

              <div class="box">

                <h2 class="section-title">
                  État du stock
                </h2>

                <table>

                  <thead>

                    <tr>
                      <th>Produit</th>
                      <th>Catégorie</th>
                      <th>Stock</th>
                      <th>État</th>
                    </tr>

                  </thead>

                  <tbody>

                    ${
                      stockRows ||
                      `
                        <tr>
                          <td
                            colspan="4"
                            class="empty"
                          >
                            Tous les stocks sont suffisants.
                          </td>
                        </tr>
                      `
                    }

                  </tbody>

                </table>

              </div>

              <div class="box">

                <h2 class="section-title">
                  Produits les plus vendus
                </h2>

                <table>

                  <thead>

                    <tr>
                      <th>#</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>CA</th>
                    </tr>

                  </thead>

                  <tbody>

                    ${
                      bestProductsRows ||
                      `
                        <tr>
                          <td
                            colspan="4"
                            class="empty"
                          >
                            Aucune vente enregistrée.
                          </td>
                        </tr>
                      `
                    }

                  </tbody>

                </table>

              </div>

            </div>

          </section>

          <section class="section">

            <div class="box">

              <h2 class="section-title">
                Dernières ventes
              </h2>

              <table>

                <thead>

                  <tr>
                    <th>Vente</th>
                    <th>Client</th>
                    <th>Paiement</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  ${
                    salesRows ||
                    `
                      <tr>
                        <td
                          colspan="5"
                          class="empty"
                        >
                          Aucune vente enregistrée.
                        </td>
                      </tr>
                    `
                  }

                </tbody>

              </table>

            </div>

          </section>

          <div class="footer">
            Document généré depuis le tableau de bord
            administratif de SENÉPICERIE.
          </div>

        </div>

        <script>

          window.onload = function () {

            window.print();

            window.onafterprint =
              function () {
                window.close();
              };

          };

        </script>

      </body>

    </html>
  `);

  printWindow.document.close();
}

/* ========================================
   EXPORT EXCEL
======================================== */

function exportDashboardToExcel({
  products,
  sales,
  bestSellingProducts,
  lowStockProducts,
  outOfStockProducts,
  todayRevenue,
  todaySalesCount,
  todayProductsSold,
}) {
  const summaryData = [
    {
      Indicateur:
        "Chiffre d'affaires du jour",
      Valeur:
        Number(todayRevenue || 0),
    },

    {
      Indicateur:
        "Ventes aujourd'hui",
      Valeur:
        Number(todaySalesCount || 0),
    },

    {
      Indicateur:
        "Produits vendus aujourd'hui",
      Valeur:
        Number(todayProductsSold || 0),
    },

    {
      Indicateur:
        "Produits en catalogue",
      Valeur:
        products.length,
    },

    {
      Indicateur:
        "Produits en stock faible",
      Valeur:
        lowStockProducts.length,
    },

    {
      Indicateur:
        "Produits en rupture",
      Valeur:
        outOfStockProducts.length,
    },

    {
      Indicateur:
        "Nombre total de ventes",
      Valeur:
        sales.length,
    },
  ];

  const summarySheet =
    XLSX.utils.json_to_sheet(
      summaryData
    );

  summarySheet["!cols"] = [
    {
      wch: 35,
    },
    {
      wch: 20,
    },
  ];

  const salesData = sales.map(
    (sale) => ({
      "N° Vente":
        sale.id || "",

      Date:
        formatDate(sale.date),

      Client:
        getCustomerName(sale),

      Téléphone:
        sale.customer?.phone || "",

      Paiement:
        sale.payment || "Non précisé",

      Total:
        Number(sale.total || 0),

      "Nombre de produits":
        (sale.items || []).reduce(
          (total, item) =>
            total +
            Number(
              item.quantity || 0
            ),
          0
        ),
    })
  );

  const salesSheet =
    XLSX.utils.json_to_sheet(
      salesData
    );

  salesSheet["!cols"] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
  ];

  const bestProductsData =
    bestSellingProducts.map(
      (product, index) => ({
        Rang:
          index + 1,

        "ID Produit":
          product.id || "",

        Produit:
          product.name || "",

        "Quantité vendue":
          Number(
            product.quantity || 0
          ),

        "Chiffre d'affaires":
          Number(
            product.revenue || 0
          ),
      })
    );

  const bestProductsSheet =
    XLSX.utils.json_to_sheet(
      bestProductsData
    );

  bestProductsSheet["!cols"] = [
    { wch: 10 },
    { wch: 18 },
    { wch: 35 },
    { wch: 20 },
    { wch: 25 },
  ];

  const stockData = products.map(
    (product) => ({
      "ID Produit":
        product.id || "",

      Produit:
        product.name || "",

      Catégorie:
        product.category || "",

      Stock:
        Number(product.stock || 0),

      Unité:
        product.unit || "",

      Statut:
        Number(product.stock || 0) <= 0
          ? "Rupture"
          : Number(product.stock || 0) <=
            LOW_STOCK_LIMIT
          ? "Stock faible"
          : "Suffisant",

      Actif:
        product.active !== false
          ? "Oui"
          : "Non",
    })
  );

  const stockSheet =
    XLSX.utils.json_to_sheet(
      stockData
    );

  stockSheet["!cols"] = [
    { wch: 18 },
    { wch: 35 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
  ];

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    "Résumé"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    salesSheet,
    "Ventes"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    bestProductsSheet,
    "Top produits"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    stockSheet,
    "Stock"
  );

  const date =
    new Date()
      .toISOString()
      .slice(0, 10);

  const filename =
    `senepicerie-tableau-bord-${date}.xlsx`;

  XLSX.writeFile(
    workbook,
    filename
  );
}

/* ========================================
   ADMIN DASHBOARD
======================================== */

function AdminDashboard() {
  const [products, setProducts] =
    useState([]);

  const [sales, setSales] =
    useState([]);

  const [todaySales, setTodaySales] =
    useState([]);

  const [todayRevenue, setTodayRevenue] =
    useState(0);

  const [todaySalesCount, setTodaySalesCount] =
    useState(0);

  const [todayProductsSold, setTodayProductsSold] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  /* ========================================
     CHARGEMENT DU DASHBOARD
  ======================================== */

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        productsFromSupabase,
        salesFromSupabase,
        todaySalesFromSupabase,
        todayRevenueFromSupabase,
        todaySalesCountFromSupabase,
        todayProductsSoldFromSupabase,
      ] = await Promise.all([
        getProducts(),
        getSales(),
        getTodaySales(),
        getTodayRevenue(),
        getTodaySalesCount(),
        getTodayProductsSold(),
      ]);

      setProducts(
        Array.isArray(productsFromSupabase)
          ? productsFromSupabase
          : []
      );

      setSales(
        Array.isArray(salesFromSupabase)
          ? salesFromSupabase
          : []
      );

      setTodaySales(
        Array.isArray(todaySalesFromSupabase)
          ? todaySalesFromSupabase
          : []
      );

      setTodayRevenue(
        Number(
          todayRevenueFromSupabase || 0
        )
      );

      setTodaySalesCount(
        Number(
          todaySalesCountFromSupabase || 0
        )
      );

      setTodayProductsSold(
        Number(
          todayProductsSoldFromSupabase || 0
        )
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement du tableau de bord :",
        error
      );

      setProducts([]);
      setSales([]);
      setTodaySales([]);
      setTodayRevenue(0);
      setTodaySalesCount(0);
      setTodayProductsSold(0);
    } finally {
      setLoading(false);
    }
  };

  /* ========================================
     ÉVÉNEMENTS
  ======================================== */

  useEffect(() => {
    loadDashboard();

    const handleProductsUpdated = () => {
      loadDashboard();
    };

    const handleSalesUpdated = () => {
      loadDashboard();
    };

    window.addEventListener(
      "productsUpdated",
      handleProductsUpdated
    );

    window.addEventListener(
      "salesUpdated",
      handleSalesUpdated
    );

    return () => {
      window.removeEventListener(
        "productsUpdated",
        handleProductsUpdated
      );

      window.removeEventListener(
        "salesUpdated",
        handleSalesUpdated
      );
    };
  }, []);

  /* ========================================
     STOCK
  ======================================== */

  const lowStockProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          product.active !== false &&
          Number(product.stock) > 0 &&
          Number(product.stock) <=
            LOW_STOCK_LIMIT
      );
    }, [products]);

  const outOfStockProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          product.active !== false &&
          Number(product.stock) <= 0
      );
    }, [products]);

  /* ========================================
     PRODUITS LES PLUS VENDUS
  ======================================== */

  const bestSellingProducts =
    useMemo(() => {
      const quantities = {};

      sales.forEach(
        (sale) => {
          const items =
            Array.isArray(sale.items)
              ? sale.items
              : [];

          items.forEach(
            (item) => {
              const itemId =
                item.id ||
                item.productId ||
                item.product_id ||
                item.name;

              if (!itemId) {
                return;
              }

              if (
                !quantities[itemId]
              ) {
                quantities[itemId] = {
                  id: itemId,
                  name:
                    item.name ||
                    "Produit",
                  quantity: 0,
                  revenue: 0,
                };
              }

              const quantity =
                Number(
                  item.quantity || 0
                );

              const price =
                Number(
                  item.price ||
                  item.unitPrice ||
                  item.unit_price ||
                  0
                );

              quantities[
                itemId
              ].quantity +=
                quantity;

              quantities[
                itemId
              ].revenue +=
                price *
                quantity;
            }
          );
        }
      );

      return Object.values(
        quantities
      )
        .sort(
          (a, b) =>
            b.quantity -
            a.quantity
        )
        .slice(0, 5);
    }, [sales]);

  /* ========================================
     DERNIÈRES VENTES
  ======================================== */

  const recentSales =
    useMemo(() => {
      return sales.slice(0, 5);
    }, [sales]);

  /* ========================================
     ACTIONS
  ======================================== */

  const handlePrint =
    () => {
      printDashboard({
        todayRevenue,
        todaySalesCount,
        todayProductsSold,
        products,
        lowStockProducts,
        outOfStockProducts,
        bestSellingProducts,
        recentSales,
      });
    };

  const handleExcelExport =
    () => {
      exportDashboardToExcel({
        products,
        sales,
        bestSellingProducts,
        lowStockProducts,
        outOfStockProducts,
        todayRevenue,
        todaySalesCount,
        todayProductsSold,
      });
    };

  /* ========================================
     RENDU
  ======================================== */

  return (
    <main className="admin-dashboard">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-dashboard-header">

        <div className="container">

          <span className="admin-dashboard-kicker">
            SENÉPICERIE · ADMINISTRATION
          </span>

          <div className="admin-dashboard-title-row">

            <div>

              <h1>
                Tableau de bord
              </h1>

              <p>
                Gérez votre boutique et suivez
                votre activité en temps réel.
              </p>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >

              <button
                type="button"
                className="admin-dashboard-print-button"
                onClick={
                  handlePrint
                }
                title="Imprimer le tableau de bord"
              >
                🖨️ Imprimer
              </button>

              <button
                type="button"
                className="admin-dashboard-excel-button"
                onClick={
                  handleExcelExport
                }
                title="Exporter le tableau de bord en Excel"
              >
                📊 Excel
              </button>

              <Link
                to="/admin/products/add"
                className="admin-dashboard-add-button"
              >
                + Ajouter un produit
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          STATISTIQUES
      ===================================== */}

      <section className="admin-dashboard-content">

        <div className="container">

          <div className="admin-stat-grid">

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                💰
              </div>

              <div>

                <span>
                  Chiffre d'affaires du jour
                </span>

                <strong>
                  {formatPrice(
                    todayRevenue
                  )}
                </strong>

              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                🧾
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

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                📦
              </div>

              <div>

                <span>
                  Produits vendus
                </span>

                <strong>
                  {todayProductsSold}
                </strong>

              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                🛍️
              </div>

              <div>

                <span>
                  Produits en catalogue
                </span>

                <strong>
                  {products.length}
                </strong>

              </div>

            </div>

          </div>

          {/* =================================
              ALERTES STOCK
          ================================= */}

          <div className="admin-dashboard-grid">

            <section className="admin-dashboard-card">

              <div className="admin-card-header">

                <div>

                  <span className="admin-card-kicker">
                    INVENTAIRE
                  </span>

                  <h2>
                    État du stock
                  </h2>

                </div>

                <Link
                  to="/admin/products"
                  className="admin-card-link"
                >
                  Gérer →
                </Link>

              </div>

              <div className="stock-summary">

                <div className="stock-summary-item">

                  <strong>
                    {products.length}
                  </strong>

                  <span>
                    Produits
                  </span>

                </div>

                <div className="stock-summary-item warning">

                  <strong>
                    {
                      lowStockProducts.length
                    }
                  </strong>

                  <span>
                    Stock faible
                  </span>

                </div>

                <div className="stock-summary-item danger">

                  <strong>
                    {
                      outOfStockProducts.length
                    }
                  </strong>

                  <span>
                    Rupture
                  </span>

                </div>

              </div>

              <div className="stock-list">

                {[
                  ...outOfStockProducts,
                  ...lowStockProducts,
                ]
                  .slice(0, 5)
                  .map(
                    (product) => (

                      <div
                        className="stock-product"
                        key={
                          product.id
                        }
                      >

                        <div>

                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <span>
                            {
                              product.category
                            }
                          </span>

                        </div>

                        <span
                          className={
                            Number(
                              product.stock
                            ) <= 0
                              ? "stock-status danger"
                              : "stock-status warning"
                          }
                        >
                          {Number(
                            product.stock
                          ) <= 0
                            ? "Rupture"
                            : `${product.stock} ${
                                product.unit ||
                                ""
                              }`}
                        </span>

                      </div>

                    )
                  )}

                {!lowStockProducts.length &&
                  !outOfStockProducts.length && (

                    <div className="dashboard-empty">
                      ✅ Tous les stocks sont suffisants.
                    </div>

                  )}

              </div>

            </section>

            {/* =================================
                MEILLEURES VENTES
            ================================= */}

            <section className="admin-dashboard-card">

              <div className="admin-card-header">

                <div>

                  <span className="admin-card-kicker">
                    PERFORMANCE
                  </span>

                  <h2>
                    Produits les plus vendus
                  </h2>

                </div>

              </div>

              <div className="best-products-list">

                {bestSellingProducts.length >
                0 ? (

                  bestSellingProducts.map(
                    (
                      product,
                      index
                    ) => (

                      <div
                        className="best-product"
                        key={
                          product.id
                        }
                      >

                        <div className="best-product-rank">
                          {
                            index + 1
                          }
                        </div>

                        <div className="best-product-info">

                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <span>
                            {
                              formatPrice(
                                product.revenue
                              )
                            }
                          </span>

                        </div>

                        <strong className="best-product-quantity">
                          {
                            product.quantity
                          }
                        </strong>

                      </div>

                    )
                  )

                ) : (

                  <div className="dashboard-empty">
                    📊 Aucune vente enregistrée.
                  </div>

                )}

              </div>

            </section>

          </div>

          {/* =================================
              DERNIÈRES VENTES
          ================================= */}

          <section className="admin-dashboard-card admin-sales-card">

            <div className="admin-card-header">

              <div>

                <span className="admin-card-kicker">
                  ACTIVITÉ
                </span>

                <h2>
                  Dernières ventes
                </h2>

              </div>

              <Link
                to="/admin/sales"
                className="admin-card-link"
              >
                Voir toutes →
              </Link>

            </div>

            {recentSales.length >
            0 ? (

              <div className="admin-sales-table">

                <div className="admin-sales-table-head">

                  <span>
                    Vente
                  </span>

                  <span>
                    Client
                  </span>

                  <span>
                    Paiement
                  </span>

                  <span>
                    Total
                  </span>

                  <span>
                    Date
                  </span>

                </div>

                {recentSales.map(
                  (sale) => (

                    <div
                      className="admin-sales-row"
                      key={
                        sale.id
                      }
                    >

                      <strong>
                        {sale.id}
                      </strong>

                      <span>
                        {
                          sale.customer
                            ?.firstName
                        }{" "}
                        {
                          sale.customer
                            ?.lastName
                        }
                      </span>

                      <span>
                        {
                          sale.payment
                        }
                      </span>

                      <strong>
                        {
                          formatPrice(
                            sale.total
                          )
                        }
                      </strong>

                      <span>
                        {
                          formatDate(
                            sale.date
                          )
                        }
                      </span>

                    </div>
                  )
                )}

              </div>

            ) : (

              <div className="dashboard-empty">
                🧾 Aucune vente enregistrée pour le moment.
              </div>

            )}

          </section>

          {/* =================================
              VENTES DU JOUR
          ================================= */}

          <section className="admin-dashboard-card">

            <div className="admin-card-header">

              <div>

                <span className="admin-card-kicker">
                  AUJOURD'HUI
                </span>

                <h2>
                  Résumé de la journée
                </h2>

              </div>

            </div>

            <div className="today-summary">

              <div>

                <span>
                  Commandes
                </span>

                <strong>
                  {
                    todaySales.length
                  }
                </strong>

              </div>

              <div>

                <span>
                  Produits vendus
                </span>

                <strong>
                  {
                    todayProductsSold
                  }
                </strong>

              </div>

              <div>

                <span>
                  Chiffre d'affaires
                </span>

                <strong>
                  {
                    formatPrice(
                      todayRevenue
                    )
                  }
                </strong>

              </div>

            </div>

          </section>

        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;