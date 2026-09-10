import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../utils/ordersManager";

import "../styles/AdminOrders.css";

// ========================================
// FORMAT PRIX
// ========================================

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString(
    "fr-FR"
  )} FCFA`;
}

// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {
  if (!date) {
    return "Date inconnue";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date inconnue";
  }

  return parsedDate.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ========================================
// NOM DU CLIENT
// ========================================

function getCustomerName(order) {
  return `${order.customer?.firstName || ""} ${
    order.customer?.lastName || ""
  }`.trim() || "Client inconnu";
}

// ========================================
// NOMBRE DE PRODUITS
// ========================================

function getProductsCount(order) {
  if (!Array.isArray(order.items)) {
    return 0;
  }

  return order.items.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );
}

// ========================================
// TEXTE DES PRODUITS
// ========================================

function getProductsText(order) {
  if (!Array.isArray(order.items)) {
    return "";
  }

  return order.items
    .map((item) => {
      const name = item.name || "Produit";
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      return `${name} x${quantity} (${formatPrice(price)})`;
    })
    .join(" | ");
}

// ========================================
// IMPRESSION D'UNE COMMANDE
// ========================================

function printOrder(order) {
  const customerName =
    getCustomerName(order);

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const itemsRows = items
    .map(
      (item) => `
        <tr>
          <td>${item.name || "Produit"}</td>
          <td>${Number(item.quantity || 0)}</td>
          <td>${formatPrice(item.price)}</td>
          <td>
            ${formatPrice(
              Number(item.price || 0) *
                Number(item.quantity || 0)
            )}
          </td>
        </tr>
      `
    )
    .join("");

  const printWindow = window.open(
    "",
    "_blank",
    "width=900,height=700"
  );

  if (!printWindow) {
    window.alert(
      "Impossible d'ouvrir la fenêtre d'impression. Vérifiez que les fenêtres pop-up sont autorisées."
    );

    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />

        <title>
          Commande ${order.id}
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

          .invoice {
            max-width: 850px;
            margin: 0 auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            gap: 30px;
            border-bottom: 2px solid #222;
            padding-bottom: 25px;
            margin-bottom: 30px;
          }

          .shop-name {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 1px;
          }

          .shop-info {
            margin-top: 8px;
            color: #666;
            line-height: 1.6;
          }

          .order-info {
            text-align: right;
          }

          .order-number {
            font-size: 22px;
            font-weight: 700;
          }

          .order-date {
            margin-top: 8px;
            color: #666;
          }

          .section {
            margin-bottom: 30px;
          }

          .section-title {
            font-size: 15px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .5px;
            margin-bottom: 12px;
          }

          .customer-box {
            padding: 18px;
            border: 1px solid #ddd;
            border-radius: 8px;
            line-height: 1.7;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }

          th {
            background: #f5f5f5;
            font-size: 13px;
          }

          td:last-child,
          th:last-child {
            text-align: right;
          }

          .totals {
            width: 350px;
            margin-left: auto;
            margin-top: 25px;
          }

          .total-line {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }

          .grand-total {
            display: flex;
            justify-content: space-between;
            padding-top: 15px;
            margin-top: 10px;
            border-top: 2px solid #222;
            font-size: 20px;
            font-weight: 800;
          }

          .payment {
            padding: 15px;
            background: #f7f7f7;
            border-radius: 8px;
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

            .invoice {
              max-width: none;
            }
          }
        </style>
      </head>

      <body>

        <div class="invoice">

          <div class="header">

            <div>
              <div class="shop-name">
                SENÉPICERIE
              </div>

              <div class="shop-info">
                Boutique en ligne<br />
                Dakar, Sénégal<br />
                Téléphone : 77 000 00 00
              </div>
            </div>

            <div class="order-info">

              <div class="order-number">
                ${order.id}
              </div>

              <div class="order-date">
                ${formatDate(order.date)}
              </div>

            </div>

          </div>

          <div class="section">

            <div class="section-title">
              Informations client
            </div>

            <div class="customer-box">

              <strong>
                ${customerName}
              </strong>

              <br />

              Téléphone :
              ${order.customer?.phone || "Non renseigné"}

              <br />

              Adresse :
              ${order.customer?.address || "Non renseignée"}

              <br />

              Zone :
              ${order.customer?.zone || "Non renseignée"}

            </div>

          </div>

          <div class="section">

            <div class="section-title">
              Produits commandés
            </div>

            <table>

              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                ${itemsRows}
              </tbody>

            </table>

          </div>

          <div class="totals">

            <div class="total-line">
              <span>Sous-total</span>
              <strong>
                ${formatPrice(order.subtotal)}
              </strong>
            </div>

            <div class="total-line">
              <span>Livraison</span>
              <strong>
                ${formatPrice(order.shipping)}
              </strong>
            </div>

            <div class="grand-total">
              <span>Total</span>
              <strong>
                ${formatPrice(order.total)}
              </strong>
            </div>

          </div>

          <div class="section">

            <div class="section-title">
              Paiement
            </div>

            <div class="payment">

              <strong>
                Mode de paiement :
              </strong>

              ${order.payment || "Non précisé"}

              <br />

              <strong>
                Statut :
              </strong>

              ${order.status || "En attente"}

            </div>

          </div>

          <div class="footer">
            Merci pour votre commande auprès de SENÉPICERIE.
          </div>

        </div>

        <script>
          window.onload = function () {
            window.print();

            window.onafterprint = function () {
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
// IMPRESSION DE PLUSIEURS COMMANDES
// ========================================

function printOrders(orders) {
  if (!Array.isArray(orders) || !orders.length) {
    window.alert(
      "Aucune commande à imprimer."
    );

    return;
  }

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

  const ordersHtml = orders
    .map((order) => {
      const customerName =
        getCustomerName(order);

      const items = Array.isArray(
        order.items
      )
        ? order.items
        : [];

      const itemsRows = items
        .map(
          (item) => `
            <tr>
              <td>${item.name || "Produit"}</td>
              <td>${Number(
                item.quantity || 0
              )}</td>
              <td>${formatPrice(
                item.price
              )}</td>
            </tr>
          `
        )
        .join("");

      return `
        <div class="order">

          <div class="order-header">

            <div>
              <h2>
                SENÉPICERIE
              </h2>

              <strong>
                ${order.id}
              </strong>
            </div>

            <div class="date">
              ${formatDate(order.date)}
            </div>

          </div>

          <div class="customer">

            <strong>
              Client :
            </strong>

            ${customerName}

            <br />

            <strong>
              Téléphone :
            </strong>

            ${order.customer?.phone || "Non renseigné"}

            <br />

            <strong>
              Adresse :
            </strong>

            ${order.customer?.address || "Non renseignée"}

            <br />

            <strong>
              Zone :
            </strong>

            ${order.customer?.zone || "Non renseignée"}

          </div>

          <table>

            <thead>
              <tr>
                <th>Produit</th>
                <th>Qté</th>
                <th>Prix</th>
              </tr>
            </thead>

            <tbody>
              ${itemsRows}
            </tbody>

          </table>

          <div class="summary">

            <div>
              Paiement :
              <strong>
                ${order.payment || "Non précisé"}
              </strong>
            </div>

            <div>
              Statut :
              <strong>
                ${order.status || "En attente"}
              </strong>
            </div>

            <div class="total">
              Total :
              ${formatPrice(order.total)}
            </div>

          </div>

        </div>
      `;
    })
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">

      <head>

        <meta charset="UTF-8" />

        <title>
          Liste des commandes
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            margin: 0;
            padding: 30px;
            color: #222;
          }

          .main-title {
            text-align: center;
            margin-bottom: 35px;
          }

          .main-title h1 {
            margin: 0 0 8px;
          }

          .main-title p {
            color: #666;
            margin: 0;
          }

          .order {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            page-break-inside: avoid;
          }

          .order-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }

          .order-header h2 {
            margin: 0 0 6px;
          }

          .date {
            color: #666;
          }

          .customer {
            line-height: 1.7;
            margin-bottom: 18px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 9px;
            border-bottom: 1px solid #eee;
            text-align: left;
          }

          th {
            background: #f5f5f5;
          }

          .summary {
            margin-top: 18px;
            display: flex;
            gap: 25px;
            flex-wrap: wrap;
          }

          .total {
            margin-left: auto;
            font-weight: 800;
            font-size: 18px;
          }

          @media print {
            body {
              padding: 0;
            }
          }

        </style>

      </head>

      <body>

        <div class="main-title">

          <h1>
            SENÉPICERIE
          </h1>

          <p>
            Liste des commandes
          </p>

          <p>
            ${orders.length} commande(s)
          </p>

        </div>

        ${ordersHtml}

        <script>

          window.onload = function () {

            window.print();

            window.onafterprint = function () {
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
// EXPORT EXCEL
// ========================================

function exportOrdersToExcel(orders) {
  if (!Array.isArray(orders) || !orders.length) {
    window.alert(
      "Aucune commande à exporter."
    );

    return;
  }

  // ======================================
  // FEUILLE COMMANDES
  // ======================================

  const ordersData = orders.map(
    (order) => ({
      "N° Commande":
        order.id || "",

      Date:
        formatDate(order.date),

      Client:
        getCustomerName(order),

      Téléphone:
        order.customer?.phone || "",

      Adresse:
        order.customer?.address || "",

      Zone:
        order.customer?.zone || "",

      "Nombre de produits":
        getProductsCount(order),

    Produits:
  getProductsText(order),

"Sous-total":
  Number(order.subtotal || 0),

Livraison:
  Number(order.shipping || 0),

Total:
  Number(order.total || 0),

Paiement:
  order.payment || "Non précisé",

Statut:
  order.status || "En attente",
    })
  );

  const ordersSheet =
    XLSX.utils.json_to_sheet(
      ordersData
    );

  // ======================================
  // LARGEUR DES COLONNES
  // ======================================

  ordersSheet["!cols"] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 30 },
    { wch: 18 },
    { wch: 18 },
    { wch: 60 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 18 },
  ];

  // ======================================
  // FEUILLE PRODUITS
  // ======================================

  const productsData = [];

  orders.forEach((order) => {
    if (!Array.isArray(order.items)) {
      return;
    }

    order.items.forEach((item) => {
      productsData.push({
        "N° Commande":
          order.id || "",

        Date:
          formatDate(order.date),

        Produit:
          item.name || "",

        "ID Produit":
          item.id || "",

        Quantité:
          Number(item.quantity || 0),

        "Prix unitaire":
          Number(item.price || 0),

        "Total ligne":
          Number(item.price || 0) *
          Number(item.quantity || 0),

        Client:
          getCustomerName(order),

        Paiement:
          order.payment || "Non précisé",

        Statut:
          order.status || "En attente",
      });
    });
  });

  const productsSheet =
    XLSX.utils.json_to_sheet(
      productsData
    );

  productsSheet["!cols"] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 30 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 25 },
    { wch: 25 },
    { wch: 18 },
  ];

  // ======================================
  // FEUILLE RÉSUMÉ
  // ======================================

  const totalOrders =
    orders.length;

  const totalSales =
    orders.reduce(
      (total, order) =>
        total +
        Number(order.total || 0),
      0
    );

  const totalShipping =
    orders.reduce(
      (total, order) =>
        total +
        Number(order.shipping || 0),
      0
    );

  const totalProducts =
    orders.reduce(
      (total, order) =>
        total +
        getProductsCount(order),
      0
    );

  const summaryData = [
    {
      Indicateur:
        "Nombre de commandes",
      Valeur:
        totalOrders,
    },

    {
      Indicateur:
        "Produits vendus",
      Valeur:
        totalProducts,
    },

    {
      Indicateur:
        "Frais de livraison",
      Valeur:
        totalShipping,
    },

    {
      Indicateur:
        "Chiffre d'affaires",
      Valeur:
        totalSales,
    },
  ];

  const summarySheet =
    XLSX.utils.json_to_sheet(
      summaryData
    );

  summarySheet["!cols"] = [
    { wch: 30 },
    { wch: 20 },
  ];

  // ======================================
  // CRÉER LE CLASSEUR
  // ======================================

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    "Résumé"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    ordersSheet,
    "Commandes"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    productsSheet,
    "Produits"
  );

  // ======================================
  // NOM DU FICHIER
  // ======================================

  const date =
    new Date()
      .toISOString()
      .slice(0, 10);

  const filename =
    `senepicerie-commandes-${date}.xlsx`;

  XLSX.writeFile(
    workbook,
    filename
  );
}

// ========================================
// ADMIN ORDERS
// ========================================

function AdminOrders() {
  const [orders, setOrders] =
    useState([]);

  const [statusFilter, setStatusFilter] =
    useState("Toutes");

  // ========================================
  // CHARGER LES COMMANDES
  // ========================================

  const loadOrders = () => {
    const currentOrders =
      getOrders();

    setOrders(
      Array.isArray(currentOrders)
        ? currentOrders
        : []
    );
  };

  // ========================================
  // CHARGEMENT INITIAL
  // ========================================

  useEffect(() => {
    loadOrders();

    const handleOrdersUpdated =
      () => {
        loadOrders();
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
  }, []);

  // ========================================
  // FILTRER
  // ========================================

  const filteredOrders =
    statusFilter === "Toutes"
      ? orders
      : orders.filter(
          (order) =>
            order.status ===
            statusFilter
        );

  // ========================================
  // CHANGER LE STATUT
  // ========================================

  const handleStatusChange = (
    orderId,
    status
  ) => {
    updateOrderStatus(
      orderId,
      status
    );

    loadOrders();
  };

  // ========================================
  // SUPPRIMER UNE COMMANDE
  // ========================================

  const handleDelete = (
    order
  ) => {
    const customerName =
      getCustomerName(order);

    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer la commande ${order.id}${
          customerName
            ? ` de ${customerName}`
            : ""
        } ?\n\nLe stock des produits sera restauré et la vente associée sera supprimée.`
      );

    if (!confirmed) {
      return;
    }

    const result =
      deleteOrder(
        order.id
      );

    if (!result.success) {
      window.alert(
        result.message ||
          "Impossible de supprimer la commande."
      );

      return;
    }

    loadOrders();

    window.alert(
      result.message
    );
  };

  // ========================================
  // CLASSE DU STATUT
  // ========================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "En attente":
        return "status-pending";

      case "Confirmée":
        return "status-confirmed";

      case "En livraison":
        return "status-delivery";

      case "Livrée":
        return "status-delivered";

      case "Annulée":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // ========================================
  // AFFICHAGE
  // ========================================

  return (
    <main className="admin-orders-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-orders-header">

        <div className="container">

          <span className="admin-orders-kicker">
            ADMINISTRATION
          </span>

          <div className="admin-orders-title-row">

            <div>

              <h1>
                Commandes
              </h1>

              <p>
                Consultez et gérez les commandes
                de vos clients.
              </p>

            </div>

            <Link
              to="/admin"
              className="admin-orders-back"
            >
              ← Tableau de bord
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="admin-orders-content">

        <div className="container">

          {/* =====================================
              TOOLBAR
          ===================================== */}

          <div className="admin-orders-toolbar">

            <div>

              <strong>
                {filteredOrders.length}
              </strong>

              <span>
                commande
                {filteredOrders.length > 1
                  ? "s"
                  : ""}
              </span>

            </div>

            <div
              className="admin-orders-toolbar-actions"
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >

              <button
                type="button"
                onClick={() =>
                  printOrders(
                    filteredOrders
                  )
                }
                disabled={
                  filteredOrders.length === 0
                }
                className="admin-order-print-all"
                title="Imprimer les commandes"
              >
                🖨️ Imprimer
              </button>

              <button
                type="button"
                onClick={() =>
                  exportOrdersToExcel(
                    filteredOrders
                  )
                }
                disabled={
                  filteredOrders.length === 0
                }
                className="admin-order-excel"
                title="Exporter en Excel"
              >
                📊 Excel
              </button>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="Toutes">
                  Toutes les commandes
                </option>

                <option value="En attente">
                  En attente
                </option>

                <option value="Confirmée">
                  Confirmées
                </option>

                <option value="En livraison">
                  En livraison
                </option>

                <option value="Livrée">
                  Livrées
                </option>

                <option value="Annulée">
                  Annulées
                </option>

              </select>

            </div>

          </div>

          {/* =====================================
              COMMANDES
          ===================================== */}

          {filteredOrders.length > 0 ? (

            <div className="admin-orders-table-wrapper">

              <table className="admin-orders-table">

                <thead>

                  <tr>

                    <th>
                      Commande
                    </th>

                    <th>
                      Client
                    </th>

                    <th>
                      Produits
                    </th>

                    <th>
                      Paiement
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Statut
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => (

                      <tr
                        key={
                          order.id
                        }
                      >

                        {/* COMMANDE */}

                        <td>

                          <strong>
                            {order.id}
                          </strong>

                        </td>

                        {/* CLIENT */}

                        <td>

                          <div className="admin-order-customer">

                            <strong>
                              {
                                order
                                  .customer
                                  ?.firstName
                              }{" "}
                              {
                                order
                                  .customer
                                  ?.lastName
                              }
                            </strong>

                            <small>
                              {
                                order
                                  .customer
                                  ?.phone
                              }
                            </small>

                          </div>

                        </td>

                        {/* PRODUITS */}

                        <td>

                          {getProductsCount(
                            order
                          )}

                        </td>

                        {/* PAIEMENT */}

                        <td>
                          {
                            order.payment ||
                            "Non précisé"
                          }
                        </td>

                        {/* TOTAL */}

                        <td>

                          <strong>
                            {formatPrice(
                              order.total
                            )}
                          </strong>

                        </td>

                        {/* DATE */}

                        <td>

                          {formatDate(
                            order.date
                          )}

                        </td>

                        {/* STATUT */}

                        <td>

                          <select
                            className={`admin-order-status ${getStatusClass(
                              order.status
                            )}`}
                            value={
                              order.status ||
                              "En attente"
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                order.id,
                                event.target
                                  .value
                              )
                            }
                          >

                            <option>
                              En attente
                            </option>

                            <option>
                              Confirmée
                            </option>

                            <option>
                              En livraison
                            </option>

                            <option>
                              Livrée
                            </option>

                            <option>
                              Annulée
                            </option>

                          </select>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="admin-order-actions">

                            <Link
                              to={`/order/${order.id}`}
                              state={{
                                order,
                              }}
                              className="admin-order-view"
                            >
                              Voir →
                            </Link>

                            {/* IMPRIMER */}

                            <button
                              type="button"
                              className="admin-order-print"
                              onClick={() =>
                                printOrder(
                                  order
                                )
                              }
                              title="Imprimer la commande"
                            >
                              🖨️
                            </button>

                            {/* SUPPRIMER */}

                            <button
                              type="button"
                              className="admin-order-delete"
                              onClick={() =>
                                handleDelete(
                                  order
                                )
                              }
                              title="Supprimer la commande"
                            >
                              🗑️
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="admin-orders-empty">

              <div>
                🧾
              </div>

              <h2>
                Aucune commande
              </h2>

              <p>
                Les commandes validées par vos
                clients apparaîtront ici.
              </p>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default AdminOrders;