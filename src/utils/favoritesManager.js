/* ========================================
   GESTION DES FAVORIS
======================================== */

const STORAGE_KEY = "senepicerie_favorites";

/* ========================================
   RÉCUPÉRER LES FAVORIS
======================================== */

export function getFavorites() {
  try {
    const favorites =
      JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      ) || [];

    return Array.isArray(favorites)
      ? favorites
      : [];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des favoris :",
      error
    );

    return [];
  }
}

/* ========================================
   VÉRIFIER SI UN PRODUIT EST FAVORI
======================================== */

export function isFavorite(productId) {
  return getFavorites().some(
    (product) =>
      String(product.id) === String(productId)
  );
}

/* ========================================
   AJOUTER UN FAVORI
======================================== */

export function addFavorite(product) {
  if (!product?.id) {
    return false;
  }

  const favorites = getFavorites();

  const alreadyExists = favorites.some(
    (item) =>
      String(item.id) === String(product.id)
  );

  if (alreadyExists) {
    return false;
  }

  favorites.push(product);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(favorites)
  );

  window.dispatchEvent(
    new Event("favoritesUpdated")
  );

  return true;
}

/* ========================================
   SUPPRIMER UN FAVORI
======================================== */

export function removeFavorite(productId) {
  const favorites = getFavorites();

  const updatedFavorites =
    favorites.filter(
      (product) =>
        String(product.id) !==
        String(productId)
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedFavorites)
  );

  window.dispatchEvent(
    new Event("favoritesUpdated")
  );

  return true;
}

/* ========================================
   AJOUTER / SUPPRIMER
======================================== */

export function toggleFavorite(product) {
  if (!product?.id) {
    return false;
  }

  if (isFavorite(product.id)) {
    removeFavorite(product.id);
    return false;
  }

  addFavorite(product);

  return true;
}

/* ========================================
   VIDER LES FAVORIS
======================================== */

export function clearFavorites() {
  localStorage.removeItem(STORAGE_KEY);

  window.dispatchEvent(
    new Event("favoritesUpdated")
  );
}