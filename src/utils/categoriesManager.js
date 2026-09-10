// ========================================
// GESTION DES CATÉGORIES
// ========================================

const CATEGORIES_STORAGE_KEY = "senepicerie_categories";

// ========================================
// CATÉGORIES PAR DÉFAUT
// ========================================

const DEFAULT_CATEGORIES = [
  {
    id: "cat-boissons",
    name: "Boissons",
    description: "Eaux, jus, boissons et rafraîchissements.",
    active: true,
  },
  {
    id: "cat-epicerie",
    name: "Épicerie",
    description: "Produits alimentaires du quotidien.",
    active: true,
  },
  {
    id: "cat-condiments",
    name: "Condiments",
    description: "Épices, sauces et produits d'assaisonnement.",
    active: true,
  },
  {
    id: "cat-menage",
    name: "Entretien",
    description: "Produits pour la maison et l'entretien.",
    active: true,
  },
  {
    id: "cat-autres",
    name: "Autres",
    description: "Autres produits disponibles en boutique.",
    active: true,
  },
];

// ========================================
// RÉCUPÉRER LES CATÉGORIES
// ========================================

export function getCategories() {
  const storedCategories = localStorage.getItem(
    CATEGORIES_STORAGE_KEY
  );

  if (!storedCategories) {
    localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(DEFAULT_CATEGORIES)
    );

    return DEFAULT_CATEGORIES;
  }

  try {
    return JSON.parse(storedCategories);
  } catch (error) {
    console.error(
      "Erreur lors de la lecture des catégories :",
      error
    );

    return DEFAULT_CATEGORIES;
  }
}

// ========================================
// ENREGISTRER LES CATÉGORIES
// ========================================

export function saveCategories(categories) {
  localStorage.setItem(
    CATEGORIES_STORAGE_KEY,
    JSON.stringify(categories)
  );

  window.dispatchEvent(
    new Event("categoriesUpdated")
  );
}

// ========================================
// AJOUTER UNE CATÉGORIE
// ========================================

export function addCategory(category) {
  const categories = getCategories();

  const newCategory = {
    id:
      category.id ||
      `cat-${Date.now()}`,

    name:
      category.name?.trim() || "Nouvelle catégorie",

    description:
      category.description?.trim() || "",

    active:
      category.active !== false,
  };

  categories.unshift(newCategory);

  saveCategories(categories);

  return newCategory;
}

// ========================================
// MODIFIER UNE CATÉGORIE
// ========================================

export function updateCategory(id, updates) {
  const categories = getCategories();

  const updatedCategories = categories.map(
    (category) =>
      category.id === id
        ? {
            ...category,
            ...updates,
            name:
              updates.name !== undefined
                ? updates.name.trim()
                : category.name,
            description:
              updates.description !== undefined
                ? updates.description.trim()
                : category.description,
          }
        : category
  );

  saveCategories(updatedCategories);

  return updatedCategories.find(
    (category) => category.id === id
  );
}

// ========================================
// SUPPRIMER UNE CATÉGORIE
// ========================================

export function deleteCategory(id) {
  const categories = getCategories();

  const updatedCategories = categories.filter(
    (category) => category.id !== id
  );

  saveCategories(updatedCategories);

  return updatedCategories;
}

// ========================================
// RECHERCHER UNE CATÉGORIE
// ========================================

export function getCategoryById(id) {
  return getCategories().find(
    (category) => category.id === id
  );
}

// ========================================
// RÉINITIALISER LES CATÉGORIES
// ========================================

export function resetCategories() {
  saveCategories(DEFAULT_CATEGORIES);

  return DEFAULT_CATEGORIES;
}