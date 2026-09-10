// ========================================
// GESTION DES COMMANDES
// ========================================

import {
  getProductById,
  updateStock,
} from "./productsManager";

const STORAGE_KEY =
  "senepicerie_orders";

const SALES_STORAGE_KEY =
  "senepicerie_sales";

// ========================================
// RÉCUPÉRER LES COMMANDES
// ========================================

export function getOrders() {
  const storedOrders =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!storedOrders) {
    return [];
  }

  try {
    const orders =
      JSON.parse(storedOrders);

    return Array.isArray(orders)
      ? orders
      : [];
  } catch (error) {
    console.error(
      "Erreur lors de la lecture des commandes :",
      error
    );

    return [];
  }
}

// ========================================
// ENREGISTRER LES COMMANDES
// ========================================

export function saveOrders(
  orders
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(orders)
  );

  window.dispatchEvent(
    new Event("ordersUpdated")
  );
}

// ========================================
// AJOUTER UNE COMMANDE
// ========================================

export function addOrder(order) {
  const orders =
    getOrders();

  const newOrder = {
    id:
      order.id ||
      `CMD-${Date.now()}`,

    customer:
      order.customer || {
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        zone: "",
      },

    items:
      Array.isArray(
        order.items
      )
        ? order.items
        : [],

    subtotal:
      Number(
        order.subtotal
      ) || 0,

    shipping:
      Number(
        order.shipping
      ) || 0,

    total:
      Number(
        order.total
      ) || 0,

    payment:
      order.payment ||
      "Non précisé",

    status:
      order.status ||
      "En attente",

    date:
      order.date ||
      new Date().toISOString(),

    // Cette information permet de savoir
    // si le stock de cette commande a déjà
    // été restauré.
    stockRestored:
      Boolean(
        order.stockRestored
      ),
  };

  orders.unshift(
    newOrder
  );

  saveOrders(orders);

  return newOrder;
}

// ========================================
// RECHERCHER UNE COMMANDE
// ========================================

export function getOrderById(
  id
) {
  const orders =
    getOrders();

  return orders.find(
    (order) =>
      String(order.id) ===
      String(id)
  );
}

// ========================================
// MODIFIER UNE COMMANDE
// ========================================

export function updateOrder(
  id,
  updates
) {
  const orders =
    getOrders();

  const updatedOrders =
    orders.map(
      (order) => {
        if (
          String(order.id) !==
          String(id)
        ) {
          return order;
        }

        return {
          ...order,
          ...updates,
        };
      }
    );

  saveOrders(
    updatedOrders
  );

  return updatedOrders.find(
    (order) =>
      String(order.id) ===
      String(id)
  );
}

// ========================================
// MODIFIER LE STATUT
// ========================================

export function updateOrderStatus(
  id,
  status
) {
  return updateOrder(
    id,
    {
      status,
    }
  );
}

// ========================================
// SUPPRIMER LA VENTE ASSOCIÉE
// ========================================

function deleteSaleByOrderId(
  orderId
) {
  try {
    const storedSales =
      localStorage.getItem(
        SALES_STORAGE_KEY
      );

    if (!storedSales) {
      return;
    }

    const sales =
      JSON.parse(
        storedSales
      );

    if (!Array.isArray(sales)) {
      return;
    }

    const filteredSales =
      sales.filter(
        (sale) =>
          String(
            sale.orderId
          ) !==
          String(orderId)
      );

    localStorage.setItem(
      SALES_STORAGE_KEY,
      JSON.stringify(
        filteredSales
      )
    );

    window.dispatchEvent(
      new Event("salesUpdated")
    );
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la vente :",
      error
    );
  }
}

// ========================================
// RESTAURER LE STOCK
// ========================================

function restoreOrderStock(
  order
) {
  if (
    !order ||
    !Array.isArray(
      order.items
    )
  ) {
    return {
      success: true,
      restored: [],
      failed: [],
    };
  }

  const restored = [];
  const failed = [];

  for (
    const item of order.items
  ) {
    const quantity =
      Number(
        item.quantity
      ) || 0;

    if (
      !item.id ||
      quantity <= 0
    ) {
      continue;
    }

    // Vérifier que le produit
    // existe toujours.
    const product =
      getProductById(
        item.id
      );

    if (!product) {
      failed.push({
        id: item.id,
        name:
          item.name || "",
        quantity,
        reason:
          "Produit introuvable",
      });

      continue;
    }

    // Ajouter la quantité
    // au stock actuel.
    const updatedProduct =
      updateStock(
        item.id,
        quantity
      );

    if (updatedProduct) {
      restored.push({
        id:
          item.id,

        name:
          item.name ||
          updatedProduct.name,

        quantity,

        stock:
          updatedProduct.stock,
      });
    } else {
      failed.push({
        id:
          item.id,

        name:
          item.name ||
          product.name,

        quantity,

        reason:
          "Impossible de modifier le stock",
      });
    }
  }

  return {
    success:
      failed.length === 0,

    restored,

    failed,
  };
}

// ========================================
// SUPPRIMER UNE COMMANDE
// + RESTAURER LE STOCK
// + SUPPRIMER LA VENTE
// ========================================

export function deleteOrder(
  id
) {
  const orders =
    getOrders();

  // ======================================
  // TROUVER LA COMMANDE
  // ======================================

  const orderToDelete =
    orders.find(
      (order) =>
        String(order.id) ===
        String(id)
    );

  if (!orderToDelete) {
    return {
      success: false,

      message:
        "Commande introuvable.",

      orders,
    };
  }

  // ======================================
  // RESTAURER LE STOCK
  // ======================================

  let stockResult = {
    success: true,
    restored: [],
    failed: [],
  };

  // Une commande déjà restaurée
  // ne doit jamais être restaurée
  // une deuxième fois.
  if (
    !orderToDelete.stockRestored
  ) {
    stockResult =
      restoreOrderStock(
        orderToDelete
      );
  }

  // ======================================
  // SUPPRIMER LA COMMANDE
  // ======================================

  const filteredOrders =
    orders.filter(
      (order) =>
        String(order.id) !==
        String(id)
    );

  saveOrders(
    filteredOrders
  );

  // ======================================
  // SUPPRIMER LA VENTE
  // ======================================

  deleteSaleByOrderId(
    id
  );

  // ======================================
  // ACTUALISER LES PRODUITS
  // ======================================

  window.dispatchEvent(
    new Event(
      "productsUpdated"
    )
  );

  // ======================================
  // ACTUALISER LES VENTES
  // ======================================

  window.dispatchEvent(
    new Event(
      "salesUpdated"
    )
  );

  // ======================================
  // MESSAGE
  // ======================================

  let message =
    "Commande supprimée et stock restauré avec succès.";

  if (
    !stockResult.success
  ) {
    message =
      "Commande supprimée, mais certains stocks n'ont pas pu être restaurés.";
  }

  // ======================================
  // RÉSULTAT
  // ======================================

  return {
    success: true,

    message,

    orders:
      filteredOrders,

    stockRestored:
      stockResult.success,

    restoredProducts:
      stockResult.restored,

    failedProducts:
      stockResult.failed,
  };
}

// ========================================
// SUPPRIMER PLUSIEURS COMMANDES
// ========================================

export function deleteOrders(
  ids
) {
  const orders =
    getOrders();

  const idsToDelete =
    Array.isArray(ids)
      ? ids.map(
          (id) =>
            String(id)
        )
      : [];

  const ordersToDelete =
    orders.filter(
      (order) =>
        idsToDelete.includes(
          String(order.id)
        )
    );

  const restoredProducts = [];
  const failedProducts = [];

  // ======================================
  // RESTAURER LES STOCKS
  // ======================================

  for (
    const order of
      ordersToDelete
  ) {
    if (
      order.stockRestored
    ) {
      continue;
    }

    const result =
      restoreOrderStock(
        order
      );

    restoredProducts.push(
      ...result.restored
    );

    failedProducts.push(
      ...result.failed
    );
  }

  // ======================================
  // SUPPRIMER LES COMMANDES
  // ======================================

  const filteredOrders =
    orders.filter(
      (order) =>
        !idsToDelete.includes(
          String(order.id)
        )
    );

  saveOrders(
    filteredOrders
  );

  // ======================================
  // SUPPRIMER LES VENTES
  // ======================================

  try {
    const storedSales =
      localStorage.getItem(
        SALES_STORAGE_KEY
      );

    if (storedSales) {
      const sales =
        JSON.parse(
          storedSales
        );

      if (
        Array.isArray(sales)
      ) {
        const filteredSales =
          sales.filter(
            (sale) =>
              !idsToDelete.includes(
                String(
                  sale.orderId
                )
              )
          );

        localStorage.setItem(
          SALES_STORAGE_KEY,
          JSON.stringify(
            filteredSales
          )
        );

        window.dispatchEvent(
          new Event(
            "salesUpdated"
          )
        );
      }
    }
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des ventes :",
      error
    );
  }

  // ======================================
  // ACTUALISER LES PRODUITS
  // ======================================

  window.dispatchEvent(
    new Event(
      "productsUpdated"
    )
  );

  return {
    success: true,

    orders:
      filteredOrders,

    stockRestored:
      failedProducts.length === 0,

    restoredProducts,

    failedProducts,
  };
}

// ========================================
// NETTOYER LES VENTES ORPHELINES
// ========================================

export function cleanOrphanSales() {
  const orders =
    getOrders();

  const orderIds =
    new Set(
      orders.map(
        (order) =>
          String(order.id)
      )
    );

  try {
    const storedSales =
      localStorage.getItem(
        SALES_STORAGE_KEY
      );

    if (!storedSales) {
      return [];
    }

    const sales =
      JSON.parse(
        storedSales
      );

    if (
      !Array.isArray(sales)
    ) {
      return [];
    }

    const validSales =
      sales.filter(
        (sale) =>
          sale.orderId &&
          orderIds.has(
            String(
              sale.orderId
            )
          )
      );

    localStorage.setItem(
      SALES_STORAGE_KEY,
      JSON.stringify(
        validSales
      )
    );

    window.dispatchEvent(
      new Event(
        "salesUpdated"
      )
    );

    return validSales;
  } catch (error) {
    console.error(
      "Erreur lors du nettoyage des ventes orphelines :",
      error
    );

    return [];
  }
}

// ========================================
// VIDER LES COMMANDES
// ========================================

export function clearOrders() {
  saveOrders([]);

  // Supprimer également
  // toutes les ventes.
  try {
    localStorage.removeItem(
      SALES_STORAGE_KEY
    );

    window.dispatchEvent(
      new Event(
        "salesUpdated"
      )
    );
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des ventes :",
      error
    );
  }

  return [];
}