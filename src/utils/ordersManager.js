import { supabase } from "./supabaseClient";
import {
  getProductById,
  updateStock,
} from "./productsManager";

/* =========================================================
   CONFIGURATION
========================================================= */

const ORDERS_TABLE = "orders";
const SALES_TABLE = "sales";

/* =========================================================
   OUTILS
========================================================= */

function normalizeCustomer(customer = {}) {
  return {
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    phone: customer.phone || "",
    address: customer.address || "",
    city: customer.city || "",
    zone: customer.zone || "",
  };
}

function normalizeItems(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    ...item,
    id: item.id || "",
    name: item.name || "",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    image: item.image || "",
    unit: item.unit || "unité",
  }));
}

/* =========================================================
   SUPABASE → APPLICATION
========================================================= */

function mapSupabaseOrder(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,

    customer: normalizeCustomer(row.customer),

    items: normalizeItems(row.items),

    subtotal: Number(row.subtotal || 0),

    shipping: Number(row.shipping || 0),

    total: Number(row.total || 0),

    payment:
      row.payment || "À la livraison",

    status:
      row.status || "en attente",

    date:
      row.date ||
      row.created_at ||
      new Date().toISOString(),

    stockRestored:
      Boolean(row.stock_restored),

    createdAt:
      row.created_at ||
      row.date ||
      null,

    updatedAt:
      row.updated_at || null,
  };
}

/* =========================================================
   APPLICATION → SUPABASE
========================================================= */

function mapOrderToSupabase(order) {
  return {
    id: order.id,

    customer:
      normalizeCustomer(order.customer),

    items:
      normalizeItems(order.items),

    subtotal:
      Number(order.subtotal || 0),

    shipping:
      Number(order.shipping || 0),

    total:
      Number(order.total || 0),

    payment:
      order.payment || "À la livraison",

    status:
      order.status || "en attente",

    date:
      order.date ||
      new Date().toISOString(),

    stock_restored:
      Boolean(order.stockRestored),

    updated_at:
      new Date().toISOString(),
  };
}

/* =========================================================
   CRÉER LES VENTES D'UNE COMMANDE
========================================================= */

async function createSalesForOrder(order) {
  if (!order || !order.id) {
    return [];
  }

  const items = normalizeItems(order.items);

  if (items.length === 0) {
    console.log(
      `ℹ️ Aucune vente à enregistrer pour ${order.id}.`
    );

    return [];
  }

  const salesRows = items.map(
    (item, index) => {
      const quantity =
        Number(item.quantity) || 0;

      const unitPrice =
        Number(item.price) || 0;

      return {
        id:
          `${order.id}-${item.id || "product"}-${index}`,

        order_id:
          order.id,

        product_id:
          item.id || null,

        product_name:
          item.name || "",

        quantity,

        unit_price:
          unitPrice,

        total:
          unitPrice * quantity,

        date:
          order.date ||
          new Date().toISOString(),
      };
    }
  );

  const { data, error } =
    await supabase
      .from(SALES_TABLE)
      .insert(salesRows)
      .select("*");

  if (error) {
    console.error(
      "❌ Erreur Supabase lors de l'enregistrement des ventes :",
      error
    );

    throw error;
  }

  console.log(
    `✅ ${salesRows.length} vente(s) enregistrée(s) pour ${order.id}`
  );

  window.dispatchEvent(
    new Event("salesUpdated")
  );

  return Array.isArray(data)
    ? data
    : [];
}

/* =========================================================
   SUPPRIMER LES VENTES D'UNE COMMANDE
========================================================= */

export async function deleteSaleByOrderId(
  orderId
) {
  if (!orderId) {
    return;
  }

  const { error } =
    await supabase
      .from(SALES_TABLE)
      .delete()
      .eq("order_id", orderId);

  if (error) {
    console.error(
      "❌ Erreur Supabase lors de la suppression des ventes :",
      error
    );

    throw error;
  }

  window.dispatchEvent(
    new Event("salesUpdated")
  );

  console.log(
    `✅ Ventes de la commande ${orderId} supprimées.`
  );
}

/* =========================================================
   RÉCUPÉRER TOUTES LES VENTES
========================================================= */

export async function getSales() {
  const { data, error } =
    await supabase
      .from(SALES_TABLE)
      .select("*")
      .order("date", {
        ascending: false,
      });

  if (error) {
    console.error(
      "❌ Erreur Supabase lors du chargement des ventes :",
      error
    );

    throw error;
  }

  const sales =
    Array.isArray(data)
      ? data.map((sale) => ({
          id: sale.id,

          orderId:
            sale.order_id || "",

          productId:
            sale.product_id || "",

          productName:
            sale.product_name || "",

          quantity:
            Number(sale.quantity || 0),

          unitPrice:
            Number(sale.unit_price || 0),

          total:
            Number(sale.total || 0),

          date:
            sale.date ||
            sale.created_at ||
            null,

          createdAt:
            sale.created_at || null,
        }))
      : [];

  console.log(
    `✅ ${sales.length} vente(s) chargée(s) depuis Supabase`
  );

  return sales;
}

/* =========================================================
   RÉCUPÉRER TOUTES LES COMMANDES
========================================================= */

export async function getOrders() {
  const { data, error } =
    await supabase
      .from(ORDERS_TABLE)
      .select("*")
      .order("date", {
        ascending: false,
      });

  if (error) {
    console.error(
      "❌ Erreur Supabase lors du chargement des commandes :",
      error
    );

    throw error;
  }

  const orders =
    Array.isArray(data)
      ? data
          .map(mapSupabaseOrder)
          .filter(Boolean)
      : [];

  console.log(
    `✅ ${orders.length} commande(s) chargée(s) depuis Supabase`
  );

  return orders;
}

/* =========================================================
   ENREGISTRER UNE LISTE DE COMMANDES
   Compatibilité avec l'ancien manager
========================================================= */

export async function saveOrders(
  orders = []
) {
  if (!Array.isArray(orders)) {
    throw new Error(
      "Les commandes doivent être fournies sous forme de tableau."
    );
  }

  if (orders.length === 0) {
    window.dispatchEvent(
      new Event("ordersUpdated")
    );

    return [];
  }

  const rows =
    orders.map(mapOrderToSupabase);

  const { data, error } =
    await supabase
      .from(ORDERS_TABLE)
      .upsert(rows, {
        onConflict: "id",
      })
      .select("*");

  if (error) {
    console.error(
      "❌ Erreur Supabase lors de l'enregistrement des commandes :",
      error
    );

    throw error;
  }

  window.dispatchEvent(
    new Event("ordersUpdated")
  );

  return Array.isArray(data)
    ? data
        .map(mapSupabaseOrder)
        .filter(Boolean)
    : [];
}

/* =========================================================
   AJOUTER UNE COMMANDE
========================================================= */

export async function addOrder(
  order = {}
) {
  const newOrder = {
    id:
      order.id ||
      `CMD-${Date.now()}`,

    customer:
      normalizeCustomer(order.customer),

    items:
      normalizeItems(order.items),

    subtotal:
      Number(order.subtotal || 0),

    shipping:
      Number(order.shipping || 0),

    total:
      Number(order.total || 0),

    payment:
      order.payment ||
      "À la livraison",

    status:
      order.status ||
      "en attente",

    date:
      order.date ||
      new Date().toISOString(),

    stockRestored:
      Boolean(order.stockRestored),
  };

  const row = {
    ...mapOrderToSupabase(
      newOrder
    ),

    created_at:
      order.createdAt ||
      newOrder.date ||
      new Date().toISOString(),
  };

  /* ---------------------------------------------
     CRÉER LA COMMANDE
  --------------------------------------------- */

  const { data, error } =
    await supabase
      .from(ORDERS_TABLE)
      .insert(row)
      .select("*")
      .single();

  if (error) {
    console.error(
      "❌ Erreur Supabase lors de la création de la commande :",
      error
    );

    throw error;
  }

  const createdOrder =
    mapSupabaseOrder(data);

  console.log(
    "✅ Commande créée dans Supabase :",
    createdOrder?.id
  );

  /* ---------------------------------------------
     CRÉER LES VENTES
  --------------------------------------------- */

  try {
    await createSalesForOrder(
      createdOrder
    );
  } catch (salesError) {
    console.error(
      "❌ Les ventes n'ont pas pu être enregistrées.",
      salesError
    );

    /*
      On tente de supprimer la commande
      afin d'éviter d'avoir une commande
      sans ses ventes.
    */

    const { error: rollbackError } =
      await supabase
        .from(ORDERS_TABLE)
        .delete()
        .eq(
          "id",
          createdOrder.id
        );

    if (rollbackError) {
      console.error(
        "❌ Impossible d'annuler la commande après l'échec des ventes :",
        rollbackError
      );
    }

    throw salesError;
  }

  window.dispatchEvent(
    new Event("ordersUpdated")
  );

  return createdOrder;
}

/* =========================================================
   RÉCUPÉRER UNE COMMANDE PAR ID
========================================================= */

export async function getOrderById(
  id
) {
  if (!id) {
    return null;
  }

  const { data, error } =
    await supabase
      .from(ORDERS_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    console.error(
      "❌ Erreur Supabase lors de la récupération de la commande :",
      error
    );

    throw error;
  }

  return mapSupabaseOrder(data);
}

/* =========================================================
   MODIFIER UNE COMMANDE
========================================================= */

export async function updateOrder(
  id,
  updates = {}
) {
  if (!id) {
    throw new Error(
      "L'identifiant de la commande est obligatoire."
    );
  }

  const updateData = {};

  if (
    updates.customer !==
    undefined
  ) {
    updateData.customer =
      normalizeCustomer(
        updates.customer
      );
  }

  if (
    updates.items !==
    undefined
  ) {
    updateData.items =
      normalizeItems(
        updates.items
      );
  }

  if (
    updates.subtotal !==
    undefined
  ) {
    updateData.subtotal =
      Number(
        updates.subtotal || 0
      );
  }

  if (
    updates.shipping !==
    undefined
  ) {
    updateData.shipping =
      Number(
        updates.shipping || 0
      );
  }

  if (
    updates.total !==
    undefined
  ) {
    updateData.total =
      Number(
        updates.total || 0
      );
  }

  if (
    updates.payment !==
    undefined
  ) {
    updateData.payment =
      updates.payment ||
      "À la livraison";
  }

  if (
    updates.status !==
    undefined
  ) {
    updateData.status =
      updates.status ||
      "en attente";
  }

  if (
    updates.date !==
    undefined
  ) {
    updateData.date =
      updates.date;
  }

  if (
    updates.stockRestored !==
    undefined
  ) {
    updateData.stock_restored =
      Boolean(
        updates.stockRestored
      );
  }

  updateData.updated_at =
    new Date().toISOString();

  const { data, error } =
    await supabase
      .from(ORDERS_TABLE)
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

  if (error) {
    console.error(
      "❌ Erreur Supabase lors de la modification de la commande :",
      error
    );

    throw error;
  }

  const updatedOrder =
    mapSupabaseOrder(data);

  window.dispatchEvent(
    new Event("ordersUpdated")
  );

  return updatedOrder;
}

/* =========================================================
   MODIFIER LE STATUT
========================================================= */

export async function updateOrderStatus(
  id,
  status
) {
  if (!id) {
    throw new Error(
      "L'identifiant de la commande est obligatoire."
    );
  }

  if (!status) {
    throw new Error(
      "Le statut de la commande est obligatoire."
    );
  }

  return await updateOrder(
    id,
    {
      status,
    }
  );
}

/* =========================================================
   RESTAURER LE STOCK D'UNE COMMANDE
========================================================= */

export async function restoreOrderStock(
  order
) {
  if (!order) {
    return {
      restored: false,
      restoredProducts: [],
      failedProducts: [],
    };
  }

  if (order.stockRestored) {
    console.log(
      `ℹ️ Le stock de ${order.id} a déjà été restauré.`
    );

    return {
      restored: true,
      alreadyRestored: true,
      restoredProducts: [],
      failedProducts: [],
    };
  }

  const items =
    normalizeItems(
      order.items
    );

  const restoredProducts = [];
  const failedProducts = [];

  for (const item of items) {
    try {
      if (!item.id) {
        failedProducts.push({
          id: null,
          name: item.name,
          quantity: item.quantity,
          reason:
            "Identifiant produit manquant.",
        });

        continue;
      }

      const quantity =
        Number(item.quantity) || 0;

      if (quantity <= 0) {
        continue;
      }

      const product =
        await getProductById(
          item.id
        );

      if (!product) {
        failedProducts.push({
          id: item.id,
          name: item.name,
          quantity,
          reason:
            "Produit introuvable.",
        });

        continue;
      }

      const result =
        await updateStock(
          item.id,
          quantity
        );

      if (
        result === false ||
        (result &&
          result.success === false)
      ) {
        failedProducts.push({
          id: item.id,
          name:
            product.name ||
            item.name,
          quantity,
          reason:
            "Impossible de mettre à jour le stock.",
        });

        continue;
      }

      restoredProducts.push({
        id: item.id,
        name:
          product.name ||
          item.name,
        quantity,
      });

      console.log(
        `✅ Stock restauré : ${product.name} +${quantity}`
      );
    } catch (error) {
      console.error(
        `❌ Erreur restauration stock pour ${item.name} :`,
        error
      );

      failedProducts.push({
        id: item.id,
        name: item.name,
        quantity:
          Number(item.quantity) || 0,
        reason:
          error?.message ||
          "Erreur inconnue.",
      });
    }
  }

  const stockRestored =
    failedProducts.length === 0;

  if (stockRestored) {
    await updateOrder(
      order.id,
      {
        stockRestored: true,
      }
    );
  }

  window.dispatchEvent(
    new Event("productsUpdated")
  );

  return {
    restored:
      stockRestored,

    restoredProducts,

    failedProducts,
  };
}

/* =========================================================
   SUPPRIMER UNE COMMANDE
========================================================= */

export async function deleteOrder(
  id
) {
  if (!id) {
    return {
      success: false,
      message:
        "Identifiant de commande manquant.",
    };
  }

  try {
    const order =
      await getOrderById(id);

    if (!order) {
      return {
        success: false,
        message:
          "Commande introuvable.",
      };
    }

    let stockResult = {
      restored: true,
      restoredProducts: [],
      failedProducts: [],
    };

    /* ---------------------------------------------
       RESTAURATION DU STOCK
    --------------------------------------------- */

    if (!order.stockRestored) {
      stockResult =
        await restoreOrderStock(
          order
        );

      if (
        stockResult.failedProducts
          .length > 0
      ) {
        console.warn(
          "⚠️ Certains stocks n'ont pas pu être restaurés.",
          stockResult.failedProducts
        );
      }
    }

    /* ---------------------------------------------
       SUPPRESSION DES VENTES
    --------------------------------------------- */

    await deleteSaleByOrderId(
      id
    );

    /* ---------------------------------------------
       SUPPRESSION DE LA COMMANDE
    --------------------------------------------- */

    const { error } =
      await supabase
        .from(ORDERS_TABLE)
        .delete()
        .eq("id", id);

    if (error) {
      console.error(
        "❌ Erreur Supabase lors de la suppression de la commande :",
        error
      );

      throw error;
    }

    window.dispatchEvent(
      new Event("ordersUpdated")
    );

    window.dispatchEvent(
      new Event("productsUpdated")
    );

    window.dispatchEvent(
      new Event("salesUpdated")
    );

    console.log(
      `✅ Commande supprimée : ${id}`
    );

    return {
      success: true,

      message:
        "Commande supprimée avec succès.",

      stockRestored:
        stockResult.restored,

      restoredProducts:
        stockResult.restoredProducts,

      failedProducts:
        stockResult.failedProducts,
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression de la commande :",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Impossible de supprimer la commande.",

      stockRestored: false,

      restoredProducts: [],

      failedProducts: [],
    };
  }
}

/* =========================================================
   SUPPRIMER PLUSIEURS COMMANDES
========================================================= */

export async function deleteOrders(
  ids = []
) {
  if (
    !Array.isArray(ids) ||
    ids.length === 0
  ) {
    return {
      success: false,
      message:
        "Aucune commande sélectionnée.",
      deletedCount: 0,
      restoredProducts: [],
      failedProducts: [],
    };
  }

  const restoredProducts = [];
  const failedProducts = [];
  const deletedIds = [];

  try {
    /* ---------------------------------------------
       RÉCUPÉRER LES COMMANDES
    --------------------------------------------- */

    const orders = [];

    for (const id of ids) {
      const order =
        await getOrderById(id);

      if (order) {
        orders.push(order);
      }
    }

    /* ---------------------------------------------
       RESTAURER LES STOCKS
    --------------------------------------------- */

    for (const order of orders) {
      if (!order.stockRestored) {
        const stockResult =
          await restoreOrderStock(
            order
          );

        restoredProducts.push(
          ...stockResult.restoredProducts
        );

        failedProducts.push(
          ...stockResult.failedProducts
        );
      }
    }

    /* ---------------------------------------------
       SUPPRIMER LES VENTES
    --------------------------------------------- */

    const { error: salesError } =
      await supabase
        .from(SALES_TABLE)
        .delete()
        .in(
          "order_id",
          ids
        );

    if (salesError) {
      console.error(
        "❌ Erreur Supabase lors de la suppression multiple des ventes :",
        salesError
      );

      throw salesError;
    }

    /* ---------------------------------------------
       SUPPRIMER LES COMMANDES
    --------------------------------------------- */

    const { error } =
      await supabase
        .from(ORDERS_TABLE)
        .delete()
        .in("id", ids);

    if (error) {
      console.error(
        "❌ Erreur Supabase lors de la suppression multiple :",
        error
      );

      throw error;
    }

    deletedIds.push(...ids);

    window.dispatchEvent(
      new Event("ordersUpdated")
    );

    window.dispatchEvent(
      new Event("productsUpdated")
    );

    window.dispatchEvent(
      new Event("salesUpdated")
    );

    console.log(
      `✅ ${deletedIds.length} commande(s) supprimée(s).`
    );

    return {
      success: true,

      message:
        `${deletedIds.length} commande(s) supprimée(s) avec succès.`,

      deletedCount:
        deletedIds.length,

      deletedIds,

      restoredProducts,

      failedProducts,
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression multiple :",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Impossible de supprimer les commandes.",

      deletedCount: 0,

      deletedIds: [],

      restoredProducts,

      failedProducts,
    };
  }
}

/* =========================================================
   NETTOYER LES VENTES ORPHELINES
========================================================= */

export async function cleanOrphanSales(
  orders = []
) {
  if (!Array.isArray(orders)) {
    return [];
  }

  const orderIds =
    new Set(
      orders.map(
        (order) => order.id
      )
    );

  const sales =
    await getSales();

  const orphanSales =
    sales.filter(
      (sale) =>
        !orderIds.has(
          sale.orderId
        )
    );

  for (const sale of orphanSales) {
    try {
      await supabase
        .from(SALES_TABLE)
        .delete()
        .eq(
          "id",
          sale.id
        );
    } catch (error) {
      console.error(
        "❌ Erreur lors du nettoyage d'une vente orpheline :",
        error
      );
    }
  }

  window.dispatchEvent(
    new Event("salesUpdated")
  );

  return sales.filter(
    (sale) =>
      orderIds.has(
        sale.orderId
      )
  );
}

/* =========================================================
   SUPPRIMER TOUTES LES COMMANDES
========================================================= */

export async function clearOrders() {
  try {
    const orders =
      await getOrders();

    /* ---------------------------------------------
       RESTAURATION DES STOCKS
    --------------------------------------------- */

    for (const order of orders) {
      if (!order.stockRestored) {
        await restoreOrderStock(
          order
        );
      }
    }

    /* ---------------------------------------------
       SUPPRESSION DES VENTES
    --------------------------------------------- */

    const {
      error: salesError,
    } = await supabase
      .from(SALES_TABLE)
      .delete()
      .neq(
        "id",
        ""
      );

    if (salesError) {
      console.error(
        "❌ Erreur Supabase lors de la suppression des ventes :",
        salesError
      );

      throw salesError;
    }

    /* ---------------------------------------------
       SUPPRESSION DES COMMANDES
    --------------------------------------------- */

    const { error } =
      await supabase
        .from(ORDERS_TABLE)
        .delete()
        .neq(
          "id",
          ""
        );

    if (error) {
      console.error(
        "❌ Erreur Supabase lors de la suppression de toutes les commandes :",
        error
      );

      throw error;
    }

    window.dispatchEvent(
      new Event("ordersUpdated")
    );

    window.dispatchEvent(
      new Event("productsUpdated")
    );

    window.dispatchEvent(
      new Event("salesUpdated")
    );

    console.log(
      "✅ Toutes les commandes et ventes ont été supprimées."
    );

    return {
      success: true,

      message:
        "Toutes les commandes ont été supprimées.",
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression de toutes les commandes.",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Impossible de supprimer les commandes.",
    };
  }
}