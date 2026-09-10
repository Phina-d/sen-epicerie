// ========================================
// GESTION DES VENTES
// ========================================

const SALES_STORAGE_KEY =
  "senepicerie_sales";

// ========================================
// RÉCUPÉRER LES VENTES
// ========================================

export function getSales() {
  const storedSales =
    localStorage.getItem(
      SALES_STORAGE_KEY
    );

  if (!storedSales) {
    return [];
  }

  try {
    const sales =
      JSON.parse(storedSales);

    return Array.isArray(sales)
      ? sales
      : [];
  } catch (error) {
    console.error(
      "Erreur lors de la lecture des ventes :",
      error
    );

    return [];
  }
}

// ========================================
// ENREGISTRER LES VENTES
// ========================================

export function saveSales(sales) {
  localStorage.setItem(
    SALES_STORAGE_KEY,
    JSON.stringify(sales)
  );

  window.dispatchEvent(
    new Event("salesUpdated")
  );
}

// ========================================
// AJOUTER UNE VENTE
// ========================================

export function addSale(sale) {
  const sales = getSales();

  const newSale = {
    id:
      sale.id ||
      `VTE-${Date.now()}`,

    orderId:
      sale.orderId || "",

    date:
      sale.date ||
      new Date().toISOString(),

    customer:
      sale.customer || {},

    items:
      Array.isArray(sale.items)
        ? sale.items
        : [],

    subtotal:
      Number(sale.subtotal) || 0,

    shipping:
      Number(sale.shipping) || 0,

    total:
      Number(sale.total) || 0,

    payment:
      sale.payment || "",

    status:
      sale.status || "Enregistrée",
  };

  sales.unshift(newSale);

  saveSales(sales);

  return newSale;
}

// ========================================
// RECHERCHER UNE VENTE
// ========================================

export function getSaleById(id) {
  const sales = getSales();

  return sales.find(
    (sale) =>
      String(sale.id) === String(id)
  );
}

// ========================================
// VENTES D'UNE COMMANDE
// ========================================

export function getSalesByOrderId(
  orderId
) {
  const sales = getSales();

  return sales.filter(
    (sale) =>
      String(sale.orderId) ===
      String(orderId)
  );
}

// ========================================
// SUPPRIMER LES VENTES D'UNE COMMANDE
// ========================================

export function deleteSalesByOrderId(
  orderId
) {
  const sales = getSales();

  const filteredSales =
    sales.filter(
      (sale) =>
        String(sale.orderId) !==
        String(orderId)
    );

  saveSales(filteredSales);

  return filteredSales;
}

// ========================================
// VENTES DU JOUR
// ========================================

export function getTodaySales() {
  const sales = getSales();

  const today =
    new Date();

  return sales.filter(
    (sale) => {
      const saleDate =
        new Date(sale.date);

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

export function getTodayRevenue() {
  const sales =
    getTodaySales();

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

export function getTodaySalesCount() {
  return getTodaySales()
    .length;
}

// ========================================
// PRODUITS VENDUS AUJOURD'HUI
// ========================================

export function getTodayProductsSold() {
  const sales =
    getTodaySales();

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

export function getTotalRevenue() {
  const sales =
    getSales();

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

export function getTotalSalesCount() {
  return getSales().length;
}

// ========================================
// PRODUITS VENDUS AU TOTAL
// ========================================

export function getTotalProductsSold() {
  const sales =
    getSales();

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
// Cette fonction sera appelée par
// ordersManager.js.
//
// Elle supprime les ventes dont
// la commande n'existe plus.
// ========================================

export function cleanSalesByOrders(
  orders
) {
  const sales =
    getSales();

  const orderIds =
    new Set(
      (Array.isArray(orders)
        ? orders
        : []
      ).map(
        (order) =>
          String(order.id)
      )
    );

  const validSales =
    sales.filter(
      (sale) =>
        sale.orderId &&
        orderIds.has(
          String(sale.orderId)
        )
    );

  saveSales(validSales);

  return validSales;
}

// ========================================
// RÉINITIALISER LES VENTES
// ========================================

export function clearSales() {
  saveSales([]);

  return [];
}