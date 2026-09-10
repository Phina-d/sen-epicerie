// ========================================
// GESTION DES PRODUITS
// ========================================

import { addNotification } from "./notificationsManager";

const STORAGE_KEY = "senepicerie_products";

// ========================================
// PRODUITS INITIAUX
// ========================================

const defaultProducts = [
  {
    id: "prod-001",
    name: "Piment en poudre",
    category: "Épices",
    description: "Piment en poudre de qualité.",

    price: 800,
    oldPrice: 1000,

    promo: true,
    promoPercent: 20,

    stock: 25,
    unit: "sachet",

    image: "",

    active: true,
    featured: false,
  },

  {
    id: "prod-002",
    name: "Poivre noir",
    category: "Épices",
    description: "Poivre noir moulu.",

    price: 1200,
    oldPrice: 1500,

    promo: true,
    promoPercent: 20,

    stock: 20,
    unit: "sachet",

    image: "",

    active: true,
    featured: false,
  },

  {
    id: "prod-003",
    name: "Sel fin",
    category: "Épicerie",
    description: "Sel fin de cuisine.",

    price: 500,
    oldPrice: null,

    promo: false,
    promoPercent: 0,

    stock: 40,
    unit: "sachet",

    image: "",

    active: true,
    featured: false,
  },

  {
    id: "prod-004",
    name: "Maggi",
    category: "Épicerie",
    description: "Cube d'assaisonnement.",

    price: 100,
    oldPrice: null,

    promo: false,
    promoPercent: 0,

    stock: 100,
    unit: "unité",

    image: "",

    active: true,
    featured: false,
  },
];

// ========================================
// NORMALISER UN PRODUIT
// ========================================
//
// Cette fonction permet de gérer :
//
// 1. Les anciens produits
// 2. Les nouveaux produits
// 3. Les anciennes promotions
// 4. Les nouvelles promotions
//
// IMPORTANT : elle ne supprime aucun produit.
// ========================================

function normalizeProduct(product) {
  if (!product || typeof product !== "object") {
    return null;
  }

  let price = Number(product.price);

  if (!Number.isFinite(price) || price < 0) {
    price = 0;
  }

  let oldPrice = null;

  let promo = false;

  let promoPercent = 0;

  // ======================================
  // ANCIEN SYSTÈME
  // onSale / salePrice / discount
  // ======================================

  const hasOldPromotion =
    product.onSale === true &&
    Number(product.salePrice) > 0 &&
    Number(product.salePrice) <
      Number(product.price);

  if (hasOldPromotion) {
    oldPrice = price;

    price = Number(product.salePrice);

    promo = true;

    promoPercent = Math.round(
      ((oldPrice - price) / oldPrice) * 100
    );
  }

  // ======================================
  // NOUVEAU SYSTÈME
  // promo / oldPrice / promoPercent
  // ======================================

  else {
    const possibleOldPrice =
      Number(product.oldPrice);

    const validOldPrice =
      Number.isFinite(possibleOldPrice) &&
      possibleOldPrice > price;

    promo =
      product.promo === true &&
      validOldPrice;

    if (promo) {
      oldPrice = possibleOldPrice;

      promoPercent = Math.round(
        ((oldPrice - price) / oldPrice) * 100
      );
    } else {
      oldPrice = null;
      promo = false;
      promoPercent = 0;
    }
  }

  // ======================================
  // STOCK
  // ======================================

  const stockNumber =
    Number(product.stock);

  const stock =
    Number.isFinite(stockNumber) &&
    stockNumber >= 0
      ? stockNumber
      : 0;

  // ======================================
  // PRODUIT FINAL
  // ======================================

  return {
    ...product,

    id:
      product.id ||
      `prod-${Date.now()}`,

    name:
      typeof product.name === "string"
        ? product.name
        : "",

    category:
      product.category || "Autres",

    description:
      typeof product.description === "string"
        ? product.description
        : "",

    price,

    oldPrice,

    promo,

    promoPercent,

    stock,

    unit:
      product.unit || "unité",

    image:
      product.image || "",

    active:
      product.active !== false,

    featured:
      product.featured === true,

    // ====================================
    // ANCIENNES PROPRIÉTÉS CONSERVÉES
    // ====================================
    //
    // On les garde temporairement pour éviter
    // de casser d'éventuels anciens composants.
    //

    onSale: promo,

    salePrice: promo
      ? price
      : null,

    discount: promo
      ? promoPercent
      : 0,
  };
}

// ========================================
// RÉCUPÉRER LES PRODUITS
// ========================================

export function getProducts() {
  const storedProducts =
    localStorage.getItem(STORAGE_KEY);

  // ======================================
  // PREMIÈRE INSTALLATION
  // ======================================

  if (!storedProducts) {
    const initialProducts =
      defaultProducts.map(
        normalizeProduct
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialProducts)
    );

    return initialProducts;
  }

  try {
    const parsedProducts =
      JSON.parse(storedProducts);

    if (!Array.isArray(parsedProducts)) {
      return [];
    }

    // ====================================
    // NORMALISATION
    // ====================================

    const normalizedProducts =
      parsedProducts
        .map(normalizeProduct)
        .filter(Boolean);

    // ====================================
    // MIGRATION AUTOMATIQUE
    // ====================================
    //
    // Les anciennes promotions sont converties
    // dans le nouveau système.
    //

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizedProducts)
    );

    return normalizedProducts;
  } catch (error) {
    console.error(
      "Erreur lors de la lecture des produits :",
      error
    );

    return [];
  }
}

// ========================================
// ENREGISTRER LES PRODUITS
// ========================================

export function saveProducts(products) {
  const safeProducts =
    Array.isArray(products)
      ? products
          .map(normalizeProduct)
          .filter(Boolean)
      : [];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(safeProducts)
  );

  window.dispatchEvent(
    new Event("productsUpdated")
  );

  return safeProducts;
}

// ========================================
// AJOUTER UN PRODUIT
// ========================================

export function addProduct(product) {
  const products = getProducts();

  const newProduct =
    normalizeProduct(product);

  if (!newProduct) {
    throw new Error(
      "Produit invalide."
    );
  }

  products.push(newProduct);

  saveProducts(products);

  return newProduct;
}

// ========================================
// MODIFIER UN PRODUIT
// ========================================

export function updateProduct(
  id,
  updates
) {
  const products = getProducts();

  const updatedProducts =
    products.map((product) => {
      if (
        String(product.id) !==
        String(id)
      ) {
        return product;
      }

      return normalizeProduct({
        ...product,
        ...updates,
      });
    });

  saveProducts(updatedProducts);

  return updatedProducts.find(
    (product) =>
      String(product.id) ===
      String(id)
  );
}

// ========================================
// SUPPRIMER UN PRODUIT
// ========================================

export function deleteProduct(id) {
  const products = getProducts();

  const filteredProducts =
    products.filter(
      (product) =>
        String(product.id) !==
        String(id)
    );

  saveProducts(filteredProducts);

  return filteredProducts;
}

// ========================================
// RECHERCHER UN PRODUIT
// ========================================

export function getProductById(id) {
  const products = getProducts();

  return products.find(
    (product) =>
      String(product.id) ===
      String(id)
  );
}

// ========================================
// MODIFIER LE STOCK
// ========================================

export function updateStock(
  id,
  quantity
) {
  const products = getProducts();

  const product = products.find(
    (item) =>
      String(item.id) ===
      String(id)
  );

  if (!product) {
    console.error(
      `Produit introuvable : ${id}`
    );

    return null;
  }

  const amount =
    Number(quantity);

  if (!Number.isFinite(amount)) {
    return null;
  }

  const currentStock =
    Number(product.stock) || 0;

  const newStock =
    currentStock + amount;

  if (newStock < 0) {
    return null;
  }

  product.stock = newStock;

  saveProducts(products);

  return product;
}

// ========================================
// DIMINUER LE STOCK APRÈS UNE VENTE
// ========================================

export function decreaseStock(
  id,
  quantity
) {
  const products = getProducts();

  const product = products.find(
    (item) =>
      String(item.id) ===
      String(id)
  );

  if (!product) {
    return {
      success: false,
      message:
        "Produit introuvable.",
    };
  }

  const requestedQuantity =
    Number(quantity);

  if (
    !Number.isFinite(
      requestedQuantity
    ) ||
    requestedQuantity <= 0
  ) {
    return {
      success: false,
      message:
        "Quantité invalide.",
    };
  }

  const currentStock =
    Number(product.stock) || 0;

  if (
    currentStock <
    requestedQuantity
  ) {
    return {
      success: false,
      message:
        `Stock insuffisant pour ${product.name}. Stock disponible : ${currentStock}.`,
    };
  }

  const previousStock =
    currentStock;

  product.stock =
    previousStock -
    requestedQuantity;

  saveProducts(products);

  // ======================================
  // RUPTURE DE STOCK
  // ======================================

  if (product.stock === 0) {
    addNotification({
      type: "error",

      title:
        "Rupture de stock",

      message:
        `Le produit "${product.name}" est maintenant en rupture de stock.`,

      productId:
        product.id,
    });
  }

  // ======================================
  // STOCK FAIBLE
  // ======================================

  else if (
    previousStock > 10 &&
    product.stock <= 10
  ) {
    addNotification({
      type: "warning",

      title:
        "Stock faible",

      message:
        `Le produit "${product.name}" ne dispose plus que de ${product.stock} ${product.unit}.`,

      productId:
        product.id,
    });
  }

  return {
    success: true,
    product,
  };
}

// ========================================
// VÉRIFIER LE STOCK
// ========================================

export function hasEnoughStock(
  id,
  quantity
) {
  const product =
    getProductById(id);

  if (!product) {
    return false;
  }

  const requestedQuantity =
    Number(quantity);

  return (
    Number.isFinite(requestedQuantity) &&
    requestedQuantity > 0 &&
    Number(product.stock) >=
      requestedQuantity
  );
}

// ========================================
// RÉINITIALISER LES PRODUITS
// ========================================
//
// ATTENTION : cette fonction supprime
// volontairement les produits ajoutés.
// Elle ne doit donc PAS être appelée
// automatiquement.
// ========================================

export function resetProducts() {
  const resetList =
    defaultProducts.map(
      (product) => ({
        ...product,
      })
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(resetList)
  );

  window.dispatchEvent(
    new Event("productsUpdated")
  );

  return resetList;
}