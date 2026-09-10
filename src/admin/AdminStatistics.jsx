import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  getSales,
  getTodayRevenue,
  getTodaySalesCount,
  getTodayProductsSold,
} from "../utils/salesManager";

import "../styles/AdminStatistics.css";

/* ========================================
   FORMATAGE
======================================== */

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

function getDateKey(date) {
  const current = new Date(date);

  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatShortDate(dateKey) {
  const [year, month, day] = dateKey.split("-");

  return `${day}/${month}`;
}

// ========================================
// IMPRESSION DES STATISTIQUES
// ========================================

function printStatistics({
  totalRevenue,
  totalSales,
  totalProductsSold,
  averageSale,
  todayRevenue,
  todaySalesCount,
  todayProductsSold,
  last7Days,
  bestSellingProducts,
  paymentStatistics,
}) {
  const printWindow = window.open(
    "",
    "_blank",
    "width=1000,height=800"
  );

  if (!printWindow) {
    window.alert(
      "Impossible d'ouvrir la fenêtre d'impression. Vérifiez que les fenêtres pop-up sont autorisées."
    );

    return;
  }

  const daysRows = last7Days
    .map(
      (day) => `
        <tr>
          <td>${day.label}</td>
          <td>${formatPrice(day.revenue)}</td>
          <td>${day.sales}</td>
          <td>${day.products}</td>
        </tr>
      `
    )
    .join("");

  const productsRows = bestSellingProducts
    .map(
      (product, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${product.name || "Produit"}</td>
          <td>${product.quantity}</td>
          <td>${formatPrice(product.revenue)}</td>
        </tr>
      `
    )
    .join("");

  const paymentsRows = paymentStatistics
    .map(
      (payment) => `
        <tr>
          <td>${payment.name}</td>
          <td>${payment.count}</td>
          <td>${formatPrice(payment.revenue)}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">

      <head>

        <meta charset="UTF-8" />

        <title>
          Statistiques SENÉPICERIE
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 40px;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            color: #222;
            background: #fff;
          }

          .report {
            max-width: 1000px;
            margin: 0 auto;
          }

          header {
            border-bottom: 2px solid #222;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }

          .subtitle {
            color: #666;
          }

          .date {
            margin-top: 10px;
            color: #777;
            font-size: 13px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns:
              repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 35px;
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
            font-size: 20px;
          }

          section {
            margin-bottom: 35px;
          }

          h2 {
            font-size: 19px;
            margin-bottom: 15px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }

          th {
            background: #f3f3f3;
          }

          td:last-child,
          th:last-child {
            text-align: right;
          }

          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #777;
            font-size: 13px;
          }

          @media print {

            body {
              padding: 0;
            }

            .report {
              max-width: none;
            }

            section {
              page-break-inside: avoid;
            }

          }

        </style>

      </head>

      <body>

        <div class="report">

          <header>

            <h1>
              SENÉPICERIE
            </h1>

            <div class="subtitle">
              Rapport des statistiques
              commerciales
            </div>

            <div class="date">
              Rapport généré le
              ${new Date().toLocaleString(
                "fr-FR"
              )}
            </div>

          </header>

          <section>

            <h2>
              Statistiques générales
            </h2>

            <div class="stats-grid">

              <div class="stat">
                <span>
                  Chiffre d'affaires
                </span>

                <strong>
                  ${formatPrice(totalRevenue)}
                </strong>
              </div>

              <div class="stat">
                <span>
                  Total des ventes
                </span>

                <strong>
                  ${totalSales}
                </strong>
              </div>

              <div class="stat">
                <span>
                  Produits vendus
                </span>

                <strong>
                  ${totalProductsSold}
                </strong>
              </div>

              <div class="stat">
                <span>
                  Panier moyen
                </span>

                <strong>
                  ${formatPrice(averageSale)}
                </strong>
              </div>

            </div>

          </section>

          <section>

            <h2>
              Activité du jour
            </h2>

            <table>

              <thead>
                <tr>
                  <th>Indicateur</th>
                  <th>Valeur</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>Chiffre d'affaires</td>
                  <td>${formatPrice(
                    todayRevenue
                  )}</td>
                </tr>

                <tr>
                  <td>Ventes</td>
                  <td>${todaySalesCount}</td>
                </tr>

                <tr>
                  <td>Produits vendus</td>
                  <td>${todayProductsSold}</td>
                </tr>

              </tbody>

            </table>

          </section>

          <section>

            <h2>
              Évolution des 7 derniers jours
            </h2>

            <table>

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Chiffre d'affaires</th>
                  <th>Ventes</th>
                  <th>Produits</th>
                </tr>
              </thead>

              <tbody>
                ${daysRows}
              </tbody>

            </table>

          </section>

          <section>

            <h2>
              Produits les plus vendus
            </h2>

            <table>

              <thead>
                <tr>
                  <th>#</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Chiffre d'affaires</th>
                </tr>
              </thead>

              <tbody>
                ${productsRows}
              </tbody>

            </table>

          </section>

          <section>

            <h2>
              Modes de paiement
            </h2>

            <table>

              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Nombre de ventes</th>
                  <th>Chiffre d'affaires</th>
                </tr>
              </thead>

              <tbody>
                ${paymentsRows}
              </tbody>

            </table>

          </section>

          <div class="footer">
            Rapport généré depuis
            l'administration SENÉPICERIE.
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

// ========================================
// EXPORT EXCEL DES STATISTIQUES
// ========================================

function exportStatisticsToExcel({
  totalRevenue,
  totalSales,
  totalProductsSold,
  averageSale,
  todayRevenue,
  todaySalesCount,
  todayProductsSold,
  last7Days,
  bestSellingProducts,
  paymentStatistics,
}) {
  const summaryData = [
    {
      Indicateur: "Chiffre d'affaires",
      Valeur: totalRevenue,
    },
    {
      Indicateur: "Total des ventes",
      Valeur: totalSales,
    },
    {
      Indicateur: "Produits vendus",
      Valeur: totalProductsSold,
    },
    {
      Indicateur: "Panier moyen",
      Valeur: averageSale,
    },
    {
      Indicateur: "CA aujourd'hui",
      Valeur: todayRevenue,
    },
    {
      Indicateur: "Ventes aujourd'hui",
      Valeur: todaySalesCount,
    },
    {
      Indicateur: "Produits vendus aujourd'hui",
      Valeur: todayProductsSold,
    },
  ];

  const sevenDaysData = last7Days.map(
    (day) => ({
      Date: day.label,
      "Chiffre d'affaires":
        day.revenue,
      Ventes:
        day.sales,
      "Produits vendus":
        day.products,
    })
  );

  const productsData =
    bestSellingProducts.map(
      (product, index) => ({
        Rang: index + 1,
        Produit:
          product.name || "",
        Quantité:
          product.quantity,
        "Chiffre d'affaires":
          product.revenue,
      })
    );

  const paymentsData =
    paymentStatistics.map(
      (payment) => ({
        "Mode de paiement":
          payment.name,
        "Nombre de ventes":
          payment.count,
        "Chiffre d'affaires":
          payment.revenue,
      })
    );

  const summarySheet =
    XLSX.utils.json_to_sheet(
      summaryData
    );

  const sevenDaysSheet =
    XLSX.utils.json_to_sheet(
      sevenDaysData
    );

  const productsSheet =
    XLSX.utils.json_to_sheet(
      productsData
    );

  const paymentsSheet =
    XLSX.utils.json_to_sheet(
      paymentsData
    );

  summarySheet["!cols"] = [
    {
      wch: 35,
    },
    {
      wch: 20,
    },
  ];

  sevenDaysSheet["!cols"] = [
    {
      wch: 15,
    },
    {
      wch: 25,
    },
    {
      wch: 12,
    },
    {
      wch: 20,
    },
  ];

  productsSheet["!cols"] = [
    {
      wch: 10,
    },
    {
      wch: 35,
    },
    {
      wch: 15,
    },
    {
      wch: 25,
    },
  ];

  paymentsSheet["!cols"] = [
    {
      wch: 25,
    },
    {
      wch: 20,
    },
    {
      wch: 25,
    },
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
    sevenDaysSheet,
    "7 jours"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    productsSheet,
    "Produits"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    paymentsSheet,
    "Paiements"
  );

  const date =
    new Date()
      .toISOString()
      .slice(0, 10);

  XLSX.writeFile(
    workbook,
    `senepicerie-statistiques-${date}.xlsx`
  );
}

/* ========================================
   COMPOSANT
======================================== */

function AdminStatistics() {
  const [sales, setSales] = useState([]);

  const loadStatistics = () => {
    setSales(getSales());
  };

  useEffect(() => {
    loadStatistics();

    window.addEventListener(
      "salesUpdated",
      loadStatistics
    );

    window.addEventListener(
      "ordersUpdated",
      loadStatistics
    );

    return () => {
      window.removeEventListener(
        "salesUpdated",
        loadStatistics
      );

      window.removeEventListener(
        "ordersUpdated",
        loadStatistics
      );
    };
  }, []);

  /* ========================================
     STATISTIQUES GÉNÉRALES
  ======================================== */

  const totalRevenue = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total + Number(sale.total || 0),
      0
    );
  }, [sales]);

  const totalSales = sales.length;

  const totalProductsSold = useMemo(() => {
    return sales.reduce(
      (total, sale) => {
        return (
          total +
          (sale.items || []).reduce(
            (sum, item) =>
              sum + Number(item.quantity || 0),
            0
          )
        );
      },
      0
    );
  }, [sales]);

  const averageSale = totalSales
    ? totalRevenue / totalSales
    : 0;

  /* ========================================
     STATISTIQUES DU JOUR
  ======================================== */

  const todayRevenue = getTodayRevenue();
  const todaySalesCount = getTodaySalesCount();
  const todayProductsSold = getTodayProductsSold();

  /* ========================================
     ÉVOLUTION SUR 7 JOURS
  ======================================== */

  const last7Days = useMemo(() => {
    const days = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - i);

      const key = getDateKey(date);

      days.push({
        key,
        label: formatShortDate(key),
        revenue: 0,
        sales: 0,
        products: 0,
      });
    }

    sales.forEach((sale) => {
      const key = getDateKey(sale.date);

      const day = days.find(
        (item) => item.key === key
      );

      if (!day) return;

      day.revenue += Number(
        sale.total || 0
      );

      day.sales += 1;

      day.products += (
        sale.items || []
      ).reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0
      );
    });

    return days;
  }, [sales]);

  const maxRevenue = Math.max(
    ...last7Days.map(
      (day) => day.revenue
    ),
    1
  );

  const maxSales = Math.max(
    ...last7Days.map(
      (day) => day.sales
    ),
    1
  );

  /* ========================================
     PRODUITS LES PLUS VENDUS
  ======================================== */

  const bestSellingProducts = useMemo(() => {
    const products = {};

    sales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        if (!products[item.id]) {
          products[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
        }

        products[item.id].quantity +=
          Number(item.quantity || 0);

        products[item.id].revenue +=
          Number(item.price || 0) *
          Number(item.quantity || 0);
      });
    });

    return Object.values(products)
      .sort(
        (a, b) =>
          b.quantity - a.quantity
      )
      .slice(0, 5);
  }, [sales]);

  /* ========================================
     MODES DE PAIEMENT
  ======================================== */

  const paymentStatistics = useMemo(() => {
    const payments = {};

    sales.forEach((sale) => {
      const payment =
        sale.payment || "Non renseigné";

      if (!payments[payment]) {
        payments[payment] = {
          name: payment,
          count: 0,
          revenue: 0,
        };
      }

      payments[payment].count += 1;

      payments[payment].revenue +=
        Number(sale.total || 0);
    });

    return Object.values(payments).sort(
      (a, b) =>
        b.count - a.count
    );
  }, [sales]);

  /* ========================================
     RENDU
  ======================================== */

  return (
    <main className="admin-statistics-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-statistics-header">

        <div className="container">

          <span className="admin-statistics-kicker">
            ADMINISTRATION · ANALYSE
          </span>

          <div className="admin-statistics-title-row">

            <div>

              <h1>
                Graphiques & Statistiques
              </h1>

              <p>
                Analysez les performances de
                votre boutique et l'évolution
                de vos ventes.
              </p>

            </div>

            <div
  className="admin-statistics-header-actions"
  style={{
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  }}
>

  <button
    type="button"
    className="statistics-print-button"
    onClick={() =>
      printStatistics({
        totalRevenue,
        totalSales,
        totalProductsSold,
        averageSale,
        todayRevenue,
        todaySalesCount,
        todayProductsSold,
        last7Days,
        bestSellingProducts,
        paymentStatistics,
      })
    }
  >
    🖨️ Imprimer
  </button>

<button
  type="button"
  className="statistics-excel-button"
  onClick={() =>
    exportStatisticsToExcel({
      totalRevenue,
      totalSales,
      totalProductsSold,
      averageSale,
      todayRevenue,
      todaySalesCount,
      todayProductsSold,
      last7Days,
      bestSellingProducts,
      paymentStatistics,
    })
  }
>
  📊 Excel
</button>

  <Link
    to="/admin"
    className="admin-statistics-back"
  >
    ← Tableau de bord
  </Link>

</div>

          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="admin-statistics-content">

        <div className="container">

          {/* =================================
              STATISTIQUES PRINCIPALES
          ================================= */}

          <div className="statistics-stat-grid">

            <div className="statistics-stat-card">

              <div className="statistics-stat-icon">
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

            <div className="statistics-stat-card">

              <div className="statistics-stat-icon">
                🧾
              </div>

              <div>

                <span>
                  Total des ventes
                </span>

                <strong>
                  {totalSales}
                </strong>

              </div>

            </div>

            <div className="statistics-stat-card">

              <div className="statistics-stat-icon">
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

            <div className="statistics-stat-card">

              <div className="statistics-stat-icon">
                📊
              </div>

              <div>

                <span>
                  Panier moyen
                </span>

                <strong>
                  {formatPrice(averageSale)}
                </strong>

              </div>

            </div>

          </div>

          {/* =================================
              ACTIVITÉ DU JOUR
          ================================= */}

          <section className="statistics-card">

            <div className="statistics-card-header">

              <div>

                <span>
                  AUJOURD'HUI
                </span>

                <h2>
                  Activité du jour
                </h2>

              </div>

            </div>

            <div className="today-statistics">

              <div>
                <span>
                  Chiffre d'affaires
                </span>

                <strong>
                  {formatPrice(todayRevenue)}
                </strong>
              </div>

              <div>
                <span>
                  Ventes
                </span>

                <strong>
                  {todaySalesCount}
                </strong>
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

          </section>

          {/* =================================
              GRAPHIQUES
          ================================= */}

          <div className="statistics-chart-grid">

            {/* CHIFFRE D'AFFAIRES */}

            <section className="statistics-card">

              <div className="statistics-card-header">

                <div>

                  <span>
                    ÉVOLUTION
                  </span>

                  <h2>
                    Chiffre d'affaires
                  </h2>

                </div>

                <small>
                  7 derniers jours
                </small>

              </div>

              <div className="statistics-chart">

                {last7Days.map((day) => {

                  const height =
                    day.revenue > 0
                      ? Math.max(
                          (day.revenue /
                            maxRevenue) *
                            100,
                          5
                        )
                      : 3;

                  return (
                    <div
                      className="chart-column"
                      key={day.key}
                    >

                      <div className="chart-value">
                        {day.revenue > 0
                          ? `${(
                              day.revenue /
                              1000
                            ).toFixed(0)}k`
                          : "0"}
                      </div>

                      <div className="chart-bar-container">

                        <div
                          className="chart-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                      </div>

                      <span className="chart-label">
                        {day.label}
                      </span>

                    </div>
                  );
                })}

              </div>

            </section>

            {/* VENTES */}

            <section className="statistics-card">

              <div className="statistics-card-header">

                <div>

                  <span>
                    ACTIVITÉ
                  </span>

                  <h2>
                    Nombre de ventes
                  </h2>

                </div>

                <small>
                  7 derniers jours
                </small>

              </div>

              <div className="statistics-chart">

                {last7Days.map((day) => {

                  const height =
                    day.sales > 0
                      ? Math.max(
                          (day.sales /
                            maxSales) *
                            100,
                          5
                        )
                      : 3;

                  return (
                    <div
                      className="chart-column"
                      key={day.key}
                    >

                      <div className="chart-value">
                        {day.sales}
                      </div>

                      <div className="chart-bar-container">

                        <div
                          className="chart-bar chart-bar-sales"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                      </div>

                      <span className="chart-label">
                        {day.label}
                      </span>

                    </div>
                  );
                })}

              </div>

            </section>

          </div>

          {/* =================================
              PRODUITS + PAIEMENTS
          ================================= */}

          <div className="statistics-bottom-grid">

            {/* PRODUITS */}

            <section className="statistics-card">

              <div className="statistics-card-header">

                <div>

                  <span>
                    PERFORMANCE
                  </span>

                  <h2>
                    Produits les plus vendus
                  </h2>

                </div>

                <Link
                  to="/admin/products"
                  className="statistics-card-link"
                >
                  Produits →
                </Link>

              </div>

              {bestSellingProducts.length > 0 ? (

                <div className="statistics-products-list">

                  {bestSellingProducts.map(
                    (product, index) => {

                      const maxQuantity =
                        bestSellingProducts[0]
                          ?.quantity || 1;

                      const percentage =
                        (product.quantity /
                          maxQuantity) *
                        100;

                      return (
                        <div
                          className="statistics-product"
                          key={product.id}
                        >

                          <div className="statistics-product-top">

                            <div className="statistics-product-rank">
                              {index + 1}
                            </div>

                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              {product.quantity} vendu
                              {product.quantity > 1
                                ? "s"
                                : ""}
                            </span>

                          </div>

                          <div className="statistics-progress">

                            <div
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <small>
                            {formatPrice(
                              product.revenue
                            )}
                          </small>

                        </div>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="statistics-empty">
                  📊 Aucune vente enregistrée.
                </div>

              )}

            </section>

            {/* PAIEMENTS */}

            <section className="statistics-card">

              <div className="statistics-card-header">

                <div>

                  <span>
                    PAIEMENT
                  </span>

                  <h2>
                    Modes de paiement
                  </h2>

                </div>

              </div>

              {paymentStatistics.length > 0 ? (

                <div className="payment-statistics-list">

                  {paymentStatistics.map(
                    (payment) => {

                      const percentage =
                        totalSales
                          ? (payment.count /
                              totalSales) *
                            100
                          : 0;

                      return (
                        <div
                          className="payment-statistics-item"
                          key={payment.name}
                        >

                          <div className="payment-statistics-top">

                            <strong>
                              {payment.name}
                            </strong>

                            <span>
                              {payment.count} vente
                              {payment.count > 1
                                ? "s"
                                : ""}
                            </span>

                          </div>

                          <div className="payment-progress">

                            <div
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <small>
                            {formatPrice(
                              payment.revenue
                            )}
                          </small>

                        </div>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="statistics-empty">
                  💳 Aucun paiement enregistré.
                </div>

              )}

            </section>

          </div>

          {/* =================================
              LIENS RAPIDES
          ================================= */}

          <div className="statistics-actions">

            <Link
              to="/admin/sales"
              className="statistics-action"
            >
              💰
              <span>
                Voir toutes les ventes
              </span>
            </Link>

            <Link
              to="/admin/orders"
              className="statistics-action"
            >
              🧾
              <span>
                Voir les commandes
              </span>
            </Link>

            <Link
              to="/admin"
              className="statistics-action"
            >
              📊
              <span>
                Retour au tableau de bord
              </span>
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default AdminStatistics;