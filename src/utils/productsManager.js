// ========================================
// GESTION DES PRODUITS
// ========================================

import { addNotification } from "./notificationsManager";
import { supabase } from "./supabaseClient";

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

function normalizeProduct(product) {
  if (!product || typeof product !== "object") {
    return null;
  }

  // ======================================
  // PRIX DE BASE
  // ======================================

  let price = Number(product.price);

  if (!Number.isFinite(price) || price < 0) {
    price = 0;
  }

  let oldPrice = null;
  let promo = false;
  let promoPercent = 0;

  // ======================================
  // NOUVEAU SYSTÈME
  // promo / oldPrice / promoPercent
  // ======================================
  //
  // IMPORTANT :
  // Le nouveau système est prioritaire.
  // Il ne faut surtout pas reprendre
  // salePrice de l'ancien système si
  // celui-ci existe encore dans le produit.
  //
  // ======================================

  const hasNewPromotionData =
    product.promo !== undefined ||
    product.oldPrice !== undefined ||
    product.promoPercent !== undefined;

  if (hasNewPromotionData) {
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

      const possiblePercent =
        Number(product.promoPercent);

      if (
        Number.isFinite(possiblePercent) &&
        possiblePercent >= 0
      ) {
        promoPercent =
          Math.round(possiblePercent);
      } else {
        promoPercent =
          Math.round(
            ((oldPrice - price) /
              oldPrice) *
              100
          );
      }
    } else {
      oldPrice = null;
      promo = false;
      promoPercent = 0;
    }
  }

  // ======================================
  // ANCIEN SYSTÈME
  // onSale / salePrice / discount
  // ======================================
  //
  // Utilisé uniquement pour les anciens
  // produits qui n'ont pas encore les
  // propriétés du nouveau système.
  //
  // ======================================

  else {
    const oldSalePrice =
      Number(product.salePrice);

    const hasOldPromotion =
      product.onSale === true &&
      Number.isFinite(oldSalePrice) &&
      oldSalePrice > 0 &&
      oldSalePrice < price;

    if (hasOldPromotion) {
      oldPrice = price;

      price = oldSalePrice;

      promo = true;

      promoPercent =
        Math.round(
          ((oldPrice - price) /
            oldPrice) *
            100
        );
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
      product.category ||
      "Autres",

    description:
      typeof product.description ===
      "string"
        ? product.description
        : "",

    // ====================================
    // PRIX CANONIQUE
    // ====================================

    price,

    oldPrice,

    promo,

    promoPercent,

    // ====================================
    // STOCK
    // ====================================

    stock,

    unit:
      product.unit ||
      "unité",

    // ====================================
    // IMAGE
    // ====================================

    image:
      product.image ||
      "",

    // ====================================
    // STATUT
    // ====================================

    active:
      product.active !== false,

    featured:
      product.featured === true,

    // ====================================
    // COMPATIBILITÉ ANCIEN SYSTÈME
    // ====================================

    onSale:
      promo,

    salePrice:
      promo
        ? price
        : null,

    discount:
      promo
        ? promoPercent
        : 0,
  };
}

// ========================================
// CONVERTIR SUPABASE → PRODUIT REACT
// ========================================

function fromSupabaseProduct(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  return normalizeProduct({
    id: row.id,

    name: row.name,

    category: row.category,

    description: row.description,

    price: row.price,

    oldPrice: row.old_price,

    promo: row.promo,

    promoPercent: row.promo_percent,

    stock: row.stock,

    unit: row.unit,

    image: row.image,

    active: row.active,

    featured: row.featured,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  });
}

// ========================================
// CONVERTIR PRODUIT REACT → SUPABASE
// ========================================

function toSupabaseProduct(product) {
  const normalizedProduct =
    normalizeProduct(product);

  if (!normalizedProduct) {
    return null;
  }

  return {
    id: normalizedProduct.id,

    name: normalizedProduct.name,

    category: normalizedProduct.category,

    description: normalizedProduct.description,

    price: normalizedProduct.price,

    old_price: normalizedProduct.oldPrice,

    promo: normalizedProduct.promo,

    promo_percent: normalizedProduct.promoPercent,

    stock: normalizedProduct.stock,

    unit: normalizedProduct.unit,

    image: normalizedProduct.image,

    active: normalizedProduct.active,

    featured: normalizedProduct.featured,

    updated_at: new Date().toISOString(),
  };
}

// ========================================
// SAUVEGARDER LE CACHE LOCAL
// ========================================

function saveLocalCache(products) {
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

  return safeProducts;
}

// ========================================
// RÉCUPÉRER LES PRODUITS DU CACHE LOCAL
// ========================================
//
// Cette fonction reste SYNCHRONE volontairement.
// Cela permet de ne pas casser les pages existantes.
//
// ========================================

export function getProducts() {
  const storedProducts =
    localStorage.getItem(STORAGE_KEY);

  // ======================================
  // PREMIÈRE INSTALLATION
  // ======================================

  if (!storedProducts) {
    const initialProducts =
      defaultProducts
        .map(normalizeProduct)
        .filter(Boolean);

    saveLocalCache(initialProducts);

    return initialProducts;
  }

  // ======================================
  // LECTURE DU CACHE
  // ======================================

  try {
    const parsedProducts =
      JSON.parse(storedProducts);

    if (!Array.isArray(parsedProducts)) {
      return [];
    }

    const normalizedProducts =
      parsedProducts
        .map(normalizeProduct)
        .filter(Boolean);

    saveLocalCache(normalizedProducts);

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
// CHARGER LES PRODUITS DEPUIS SUPABASE
// ========================================
//
// Cette fonction est ASYNCHRONE.
//
// Elle sera utilisée progressivement par
// Home, Shop, ProductDetails et Admin.
//
// ========================================

export async function loadProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "❌ Erreur Supabase lors du chargement des produits :",
        error
      );

      return getProducts();
    }

    const products =
      Array.isArray(data)
        ? data
            .map(fromSupabaseProduct)
            .filter(Boolean)
        : [];

    // ====================================
    // METTRE À JOUR LE CACHE LOCAL
    // ====================================

    saveLocalCache(products);

    // ====================================
    // INFORMER LES COMPOSANTS
    // ====================================

    window.dispatchEvent(
      new Event("productsUpdated")
    );

    console.log(
      "✅ Produits chargés depuis Supabase :",
      products
    );

    return products;
  } catch (error) {
    console.error(
      "❌ Erreur inattendue Supabase :",
      error
    );

    return getProducts();
  }
}

// ========================================
// ENREGISTRER LES PRODUITS LOCAL + SUPABASE
// ========================================
//
// Cette fonction sera utilisée pour les
// opérations nécessitant plusieurs produits.
//
// ========================================

export async function saveProducts(products) {
  const safeProducts =
    Array.isArray(products)
      ? products
          .map(normalizeProduct)
          .filter(Boolean)
      : [];

  // ======================================
  // CACHE LOCAL
  // ======================================

  saveLocalCache(safeProducts);

  // ======================================
  // SYNCHRONISATION SUPABASE
  // ======================================

  try {
    if (safeProducts.length > 0) {
      const rows =
        safeProducts
          .map(toSupabaseProduct)
          .filter(Boolean);

      const { error } = await supabase
        .from("products")
        .upsert(rows, {
          onConflict: "id",
        });

      if (error) {
        console.error(
          "❌ Erreur Supabase lors de l'enregistrement :",
          error
        );
      }
    }
  } catch (error) {
    console.error(
      "❌ Erreur inattendue lors de la synchronisation :",
      error
    );
  }

  // ======================================
  // INFORMER L'APPLICATION
  // ======================================

  window.dispatchEvent(
    new Event("productsUpdated")
  );

  return safeProducts;
}

// ========================================
// AJOUTER UN PRODUIT
// ========================================

export async function addProduct(product) {
  const newProduct =
    normalizeProduct(product);

  if (!newProduct) {
    throw new Error(
      "Produit invalide."
    );
  }

  // ======================================
  // SAUVEGARDE LOCALE IMMÉDIATE
  // ======================================

  const products = getProducts();

  products.push(newProduct);

  saveLocalCache(products);

  window.dispatchEvent(
    new Event("productsUpdated")
  );

  // ======================================
  // SUPABASE
  // ======================================

  const supabaseProduct =
    toSupabaseProduct(newProduct);

  try {
    const { data, error } = await supabase
      .from("products")
      .insert(supabaseProduct)
      .select()
      .single();

    if (error) {
      console.error(
        "❌ Erreur Supabase lors de l'ajout :",
        error
      );

      throw error;
    }

    const savedProduct =
      fromSupabaseProduct(data);

    if (savedProduct) {
      const updatedProducts =
        getProducts().map((item) =>
          String(item.id) ===
          String(savedProduct.id)
            ? savedProduct
            : item
        );

      saveLocalCache(updatedProducts);

      window.dispatchEvent(
        new Event("productsUpdated")
      );

      return savedProduct;
    }
  } catch (error) {
    console.error(
      "❌ Le produit a été conservé localement mais n'a pas pu être envoyé à Supabase.",
      error
    );

    throw error;
  }

  return newProduct;
}

// ========================================
// MODIFIER UN PRODUIT
// ========================================

export async function updateProduct(id, updates) {
  try {
    // ======================================
    // 1. VÉRIFIER L'ID
    // ======================================

    if (!id) {
      throw new Error("Identifiant du produit manquant.");
    }

    // ======================================
    // 2. RÉCUPÉRER LE PRODUIT DIRECTEMENT
    //    DEPUIS SUPABASE
    // ======================================

    const {
      data: existingRow,
      error: fetchError,
    } = await supabase
      .from("products")
      .select("*")
      .eq("id", String(id))
      .single();

    if (fetchError) {
      console.error(
        "❌ Erreur lors de la récupération du produit avant modification :",
        fetchError
      );

      throw fetchError;
    }

    if (!existingRow) {
      throw new Error("Produit introuvable dans Supabase.");
    }

    // ======================================
    // 3. CONVERTIR SUPABASE → PRODUIT REACT
    // ======================================

    const existingProduct =
      fromSupabaseProduct(existingRow);

    if (!existingProduct) {
      throw new Error(
        "Impossible de convertir le produit existant."
      );
    }

    // ======================================
    // 4. CONSTRUIRE LE NOUVEAU PRODUIT
    //    À PARTIR DE SUPABASE
    // ======================================

    const updatedProduct =
      normalizeProduct({
        ...existingProduct,
        ...updates,
        id: existingProduct.id,
      });

    if (!updatedProduct) {
      throw new Error(
        "Les données du produit sont invalides."
      );
    }

    // ======================================
    // 5. CONVERTIR → SUPABASE
    // ======================================

    const supabaseProduct =
      toSupabaseProduct(updatedProduct);

    if (!supabaseProduct) {
      throw new Error(
        "Impossible de préparer le produit pour Supabase."
      );
    }

    console.log(
      "📤 Mise à jour Supabase :",
      supabaseProduct
    );

    // ======================================
    // 6. MODIFIER SUPABASE
    // ======================================

    const {
      data: savedRow,
      error: updateError,
    } = await supabase
      .from("products")
      .update(supabaseProduct)
      .eq("id", String(id))
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "❌ ERREUR SUPABASE UPDATE :",
        updateError
      );

      throw updateError;
    }

    if (!savedRow) {
      throw new Error(
        "Supabase n'a retourné aucun produit après la modification."
      );
    }

    console.log(
      "✅ Produit réellement enregistré dans Supabase :",
      savedRow
    );

    // ======================================
    // 7. CONVERTIR LE PRODUIT RETOURNÉ
    //    PAR SUPABASE
    // ======================================

    const savedProduct =
      fromSupabaseProduct(savedRow);

    if (!savedProduct) {
      throw new Error(
        "Impossible de convertir le produit sauvegardé."
      );
    }

    // ======================================
    // 8. METTRE À JOUR LE CACHE LOCAL
    //    AVEC LA VERSION SUPABASE
    // ======================================

    const cachedProducts =
      getProducts();

    const productAlreadyExists =
      cachedProducts.some(
        (product) =>
          String(product.id) ===
          String(savedProduct.id)
      );

    let finalProducts;

    if (productAlreadyExists) {
      finalProducts =
        cachedProducts.map((product) =>
          String(product.id) ===
          String(savedProduct.id)
            ? savedProduct
            : product
        );
    } else {
      finalProducts = [
        ...cachedProducts,
        savedProduct,
      ];
    }

    saveLocalCache(finalProducts);

    // ======================================
    // 9. INFORMER L'APPLICATION
    // ======================================

    window.dispatchEvent(
      new Event("productsUpdated")
    );

    console.log(
      "💾 Cache local synchronisé :",
      savedProduct
    );

    return savedProduct;

  } catch (error) {
    console.error(
      "❌ Erreur lors de la modification du produit :",
      error
    );

    throw error;
  }
}

// ========================================
// SUPPRIMER UN PRODUIT
// ========================================

export async function deleteProduct(id) {
  const products = getProducts();

  const productExists =
    products.some(
      (product) =>
        String(product.id) ===
        String(id)
    );

  if (!productExists) {
    return products;
  }

  // ======================================
  // SUPABASE
  // ======================================

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "❌ Erreur Supabase lors de la suppression :",
        error
      );

      throw error;
    }

    // ====================================
    // CACHE LOCAL
    // ====================================

    const filteredProducts =
      products.filter(
        (product) =>
          String(product.id) !==
          String(id)
      );

    saveLocalCache(filteredProducts);

    window.dispatchEvent(
      new Event("productsUpdated")
    );

    return filteredProducts;
  } catch (error) {
    console.error(
      "❌ Le produit n'a pas été supprimé.",
      error
    );

    throw error;
  }
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

export async function updateStock(
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

  // ======================================
  // MISE À JOUR LOCALE
  // ======================================

  product.stock = newStock;

  saveLocalCache(products);

  window.dispatchEvent(
    new Event("productsUpdated")
  );

  // ======================================
  // SUPABASE
  // ======================================

  try {
    const { data, error } = await supabase
      .from("products")
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "❌ Erreur Supabase lors de la mise à jour du stock :",
        error
      );

      throw error;
    }

    const updatedProduct =
      fromSupabaseProduct(data);

    if (updatedProduct) {
      const updatedProducts =
        getProducts().map((item) =>
          String(item.id) ===
          String(id)
            ? updatedProduct
            : item
        );

      saveLocalCache(updatedProducts);

      window.dispatchEvent(
        new Event("productsUpdated")
      );

      return updatedProduct;
    }
  } catch (error) {
    console.error(
      "❌ Le stock local a été modifié mais Supabase n'a pas été synchronisé.",
      error
    );

    throw error;
  }

  return product;
}

// ========================================
// DIMINUER LE STOCK APRÈS UNE VENTE
// ========================================

export async function decreaseStock(
  id,
  quantity
) {
  const requestedQuantity =
    Number(quantity);

  // ======================================
  // VALIDATION
  // ======================================

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

  // ======================================
  // SUPABASE RPC
  // ======================================

  try {
    const { data, error } =
      await supabase.rpc(
        "decrease_product_stock",
        {
          p_product_id: String(id),
          p_quantity: requestedQuantity,
        }
      );

    if (error) {
      console.error(
        "❌ Erreur Supabase lors de la diminution du stock :",
        error
      );

      return {
        success: false,
        message:
          "Impossible de mettre à jour le stock.",
        error,
      };
    }

    // ====================================
    // RÉSULTAT DE LA FONCTION SQL
    // ====================================

    if (!data?.success) {
      return {
        success: false,
        message:
          data?.message ||
          "Impossible de diminuer le stock.",
      };
    }

    // ====================================
    // RÉCUPÉRER LE PRODUIT À JOUR
    // ====================================

    const {
      data: productData,
      error: productError,
    } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (productError) {
      console.error(
        "❌ Erreur lors de la récupération du produit mis à jour :",
        productError
      );

      return {
        success: false,
        message:
          "Le stock a été modifié mais le produit n'a pas pu être récupéré.",
        error: productError,
      };
    }

    const updatedProduct =
      fromSupabaseProduct(productData);

    if (!updatedProduct) {
      return {
        success: false,
        message:
          "Produit invalide retourné par Supabase.",
      };
    }

    // ====================================
    // CACHE LOCAL
    // ====================================

    const products = getProducts();

    const updatedProducts =
      products.map((item) =>
        String(item.id) ===
        String(id)
          ? updatedProduct
          : item
      );

    saveLocalCache(updatedProducts);

    window.dispatchEvent(
      new Event("productsUpdated")
    );

    // ====================================
    // RUPTURE DE STOCK
    // ====================================

    if (updatedProduct.stock === 0) {
      addNotification({
        type: "error",

        title:
          "Rupture de stock",

        message:
          `Le produit "${updatedProduct.name}" est maintenant en rupture de stock.`,

        productId:
          updatedProduct.id,
      });
    }

    // ====================================
    // STOCK FAIBLE
    // ====================================

    else if (
      updatedProduct.stock <= 10 &&
      data.previous_stock > 10
    ) {
      addNotification({
        type: "warning",

        title:
          "Stock faible",

        message:
          `Le produit "${updatedProduct.name}" ne dispose plus que de ${updatedProduct.stock} ${updatedProduct.unit}.`,

        productId:
          updatedProduct.id,
      });
    }

    return {
      success: true,
      product: updatedProduct,
    };

  } catch (error) {
    console.error(
      "❌ Erreur inattendue lors de la diminution du stock :",
      error
    );

    return {
      success: false,
      message:
        "Une erreur est survenue lors de la mise à jour du stock.",
      error,
    };
  }
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
    Number.isFinite(
      requestedQuantity
    ) &&
    requestedQuantity > 0 &&
    Number(product.stock) >=
      requestedQuantity
  );
}

// ========================================
// RÉINITIALISER LES PRODUITS
// ========================================
//
// IMPORTANT : cette fonction reste
// volontairement locale.
//
// Elle ne supprime rien dans Supabase.
//
// ========================================

export function resetProducts() {
  const resetList =
    defaultProducts
      .map(normalizeProduct)
      .filter(Boolean);

  saveLocalCache(resetList);

  window.dispatchEvent(
    new Event("productsUpdated")
  );

  return resetList;
}