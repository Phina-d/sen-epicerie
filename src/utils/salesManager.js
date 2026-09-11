// ========================================
// GESTION DES VENTES
// ========================================
//
// Les commandes Supabase sont la source
// de vérité pour l'affichage des ventes.
//
// La table "sales" peut continuer à servir
// au suivi détaillé des lignes de vente,
// mais l'interface admin utilise les commandes.
// ========================================

import { supabase } from "./supabaseClient";

const ORDERS_TABLE = "orders";

// ========================================
// NORMALISER UNE VENTE
// ========================================

function normalizeSale(order) {
  if (!order) {
    return null;
  }

  const customer =
    order.customer &&
    typeof order.customer === "object"
      ? order.customer
      : {};

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  return {
    id:
      order.id || "",

    orderId:
      order.id || "",

    date:
      order.date ||
      order.created_at ||
      new Date().toISOString(),

    customer,

    items,

    subtotal:
      Number(order.subtotal) || 0,

    shipping:
      Number(order.shipping) || 0,

    total:
      Number(order.total) || 0,

    payment:
      order.payment || "",

    status:
      order.status || "Enregistrée",
  };
}

// ========================================
// RÉCUPÉRER TOUTES LES VENTES
// ========================================

export async function getSales() {
  try {
    const { data, error } = await supabase
      .from(ORDERS_TABLE)
      .select("*")
      .order("date", {
        ascending: false,
      });

    if (error) {
      console.error(
        "❌ Erreur Supabase lors du chargement des ventes :",
        error
      );

      return [];
    }

    const sales = Array.isArray(data)
      ? data
          .map(normalizeSale)
          .filter(Boolean)
      : [];

    return sales;
  } catch (error) {
    console.error(
      "❌ Erreur lors du chargement des ventes :",
      error
    );

    return [];
  }
}

// ========================================
// ENREGISTRER UNE VENTE
// ========================================
//
// Compatibilité avec l'ancien Checkout.
//
// La commande est désormais enregistrée
// dans Supabase par ordersManager.
//
// Cette fonction ne crée donc pas une
// deuxième vente dans localStorage.
//
// ========================================

export async function addSale(sale) {
  const newSale = normalizeSale({
    id:
      sale?.orderId ||
      sale?.id ||
      `VTE-${Date.now()}`,

    date:
      sale?.date ||
      new Date().toISOString(),

    customer:
      sale?.customer || {},

    items:
      Array.isArray(sale?.items)
        ? sale.items
        : [],

    subtotal:
      Number(sale?.subtotal) || 0,

    shipping:
      Number(sale?.shipping) || 0,

    total:
      Number(sale?.total) || 0,

    payment:
      sale?.payment || "",

    status:
      sale?.status || "Enregistrée",
  });

  window.dispatchEvent(
    new Event("salesUpdated")
  );

  return newSale;
}

// ========================================
// RECHERCHER UNE VENTE
// ========================================

export async function getSaleById(id) {
  const sales = await getSales();

  return (
    sales.find(
      (sale) =>
        String(sale.id) ===
        String(id)
    ) || null
  );
}

// ========================================
// VENTES D'UNE COMMANDE
// ========================================

export async function getSalesByOrderId(
  orderId
) {
  const sales = await getSales();

  return sales.filter(
    (sale) =>
      String(sale.orderId) ===
      String(orderId)
  );
}

// ========================================
// SUPPRIMER LES VENTES D'UNE COMMANDE
// ========================================
//
// Comme les ventes affichées sont dérivées
// des commandes, supprimer la commande
// suffit à les faire disparaître.
//
// On déclenche simplement l'événement
// pour actualiser les écrans Admin.
// ========================================

export async function deleteSalesByOrderId(
  orderId
) {
  window.dispatchEvent(
    new Event("salesUpdated")
  );

  return [];
}

// ========================================
// VENTES DU JOUR
// ========================================

export async function getTodaySales() {
  const sales = await getSales();

  const today =
    new Date();

  return sales.filter(
    (sale) => {
      const saleDate =
        new Date(sale.date);

      if (
        Number.isNaN(
          saleDate.getTime()
        )
      ) {
        return false;
      }

      return (
        saleDate.getFullYear() ===
          today.getFullYear() &&
        saleDate.getMonth() ===
          today.getMonth() &&
        saleDate.getDate() ===
          today.getDate()
      );
    }
  );
}

// ========================================
// CHIFFRE D'AFFAIRES DU JOUR
// ========================================

export async function getTodayRevenue() {
  const sales =
    await getTodaySales();

  return sales.reduce(
    (total, sale) =>
      total +
      Number(sale.total || 0),
    0
  );
}

// ========================================
// NOMBRE DE VENTES DU JOUR
// ========================================

export async function getTodaySalesCount() {
  const sales =
    await getTodaySales();

  return sales.length;
}

// ========================================
// PRODUITS VENDUS AUJOURD'HUI
// ========================================

export async function getTodayProductsSold() {
  const sales =
    await getTodaySales();

  return sales.reduce(
    (total, sale) => {
      const items =
        Array.isArray(
          sale.items
        )
          ? sale.items
          : [];

      return (
        total +
        items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.quantity || 0
            ),
          0
        )
      );
    },
    0
  );
}

// ========================================
// CHIFFRE D'AFFAIRES TOTAL
// ========================================

export async function getTotalRevenue() {
  const sales =
    await getSales();

  return sales.reduce(
    (total, sale) =>
      total +
      Number(sale.total || 0),
    0
  );
}

// ========================================
// NOMBRE TOTAL DE VENTES
// ========================================

export async function getTotalSalesCount() {
  const sales =
    await getSales();

  return sales.length;
}

// ========================================
// PRODUITS VENDUS AU TOTAL
// ========================================

export async function getTotalProductsSold() {
  const sales =
    await getSales();

  return sales.reduce(
    (total, sale) => {
      const items =
        Array.isArray(
          sale.items
        )
          ? sale.items
          : [];

      return (
        total +
        items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.quantity || 0
            ),
          0
        )
      );
    },
    0
  );
}

// ========================================
// NETTOYER LES VENTES ORPHELINES
// ========================================
//
// Les ventes affichées étant dérivées
// des commandes Supabase, les commandes
// supprimées disparaissent automatiquement.
//
// Cette fonction force simplement
// l'actualisation de l'interface.
// ========================================

export async function cleanSalesByOrders(
  orders
) {
  window.dispatchEvent(
    new Event("salesUpdated")
  );

  return await getSales();
}

// ========================================
// RÉINITIALISER LES VENTES
// ========================================
//
// IMPORTANT : on ne supprime pas les
// commandes ici.
//
// Cette fonction est conservée pour
// compatibilité avec l'ancien code.
// ========================================

export async function clearSales() {
  window.dispatchEvent(
    new Event("salesUpdated")
  );

  return [];
}