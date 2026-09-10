import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../utils/categoriesManager";

import "../styles/AdminCategories.css";

function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
  });

  /* ========================================
     CHARGER LES CATÉGORIES
  ======================================== */

  const loadCategories = () => {
    setCategories(getCategories());
  };

  useEffect(() => {
    loadCategories();

    const handleCategoriesUpdated = () => {
      loadCategories();
    };

    window.addEventListener(
      "categoriesUpdated",
      handleCategoriesUpdated
    );

    return () => {
      window.removeEventListener(
        "categoriesUpdated",
        handleCategoriesUpdated
      );
    };
  }, []);

  /* ========================================
     OUVRIR LE FORMULAIRE
  ======================================== */

  const openAddForm = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      description: "",
      active: true,
    });

    setShowForm(true);
  };

  /* ========================================
     MODIFIER
  ======================================== */

  const openEditForm = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      description: category.description || "",
      active: category.active !== false,
    });

    setShowForm(true);
  };

  /* ========================================
     FERMER
  ======================================== */

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  /* ========================================
     CHANGEMENT FORMULAIRE
  ======================================== */

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* ========================================
     ENREGISTRER
  ======================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      alert(
        "Veuillez saisir le nom de la catégorie."
      );

      return;
    }

    const duplicate = categories.find(
      (category) =>
        category.name.toLowerCase() ===
          name.toLowerCase() &&
        category.id !==
          editingCategory?.id
    );

    if (duplicate) {
      alert(
        "Cette catégorie existe déjà."
      );

      return;
    }

    if (editingCategory) {
      updateCategory(
        editingCategory.id,
        {
          name,
          description:
            formData.description,
          active:
            formData.active,
        }
      );
    } else {
      addCategory({
        name,
        description:
          formData.description,
        active:
          formData.active,
      });
    }

    closeForm();
    loadCategories();
  };

  /* ========================================
     SUPPRIMER
  ======================================== */

  const handleDelete = (category) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la catégorie "${category.name}" ?`
    );

    if (!confirmed) {
      return;
    }

    deleteCategory(category.id);

    loadCategories();
  };

  /* ========================================
     ACTIVER / DÉSACTIVER
  ======================================== */

  const handleToggleActive = (category) => {
    updateCategory(category.id, {
      active: !category.active,
    });

    loadCategories();
  };

  /* ========================================
     RENDU
  ======================================== */

  return (
    <main className="admin-categories-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-categories-header">

        <div className="container">

          <span className="admin-categories-kicker">
            ADMINISTRATION
          </span>

          <div className="admin-categories-title-row">

            <div>

              <h1>
                Catégories
              </h1>

              <p>
                Organisez les produits de votre
                boutique par catégorie.
              </p>

            </div>

            <Link
              to="/admin"
              className="admin-categories-back"
            >
              ← Tableau de bord
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="admin-categories-content">

        <div className="container">

          {/* =================================
              BARRE D'ACTIONS
          ================================= */}

          <div className="admin-categories-toolbar">

            <div>

              <strong>
                {categories.length}
              </strong>

              <span>
                catégorie
                {categories.length > 1
                  ? "s"
                  : ""}
              </span>

            </div>

            <button
              type="button"
              className="admin-category-add-button"
              onClick={openAddForm}
            >
              + Ajouter une catégorie
            </button>

          </div>

          {/* =================================
              FORMULAIRE
          ================================= */}

          {showForm && (

            <section className="admin-category-form-card">

              <div className="admin-category-form-header">

                <div>

                  <span>
                    {editingCategory
                      ? "MODIFICATION"
                      : "NOUVELLE CATÉGORIE"}
                  </span>

                  <h2>
                    {editingCategory
                      ? "Modifier la catégorie"
                      : "Ajouter une catégorie"}
                  </h2>

                </div>

                <button
                  type="button"
                  className="admin-category-close"
                  onClick={closeForm}
                  aria-label="Fermer"
                >
                  ×
                </button>

              </div>

              <form
                className="admin-category-form"
                onSubmit={handleSubmit}
              >

                <div className="admin-category-field">

                  <label htmlFor="category-name">
                    Nom de la catégorie
                  </label>

                  <input
                    id="category-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex : Boissons"
                    required
                  />

                </div>

                <div className="admin-category-field">

                  <label htmlFor="category-description">
                    Description
                  </label>

                  <textarea
                    id="category-description"
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    placeholder="Décrivez cette catégorie..."
                    rows="4"
                  />

                </div>

                <label className="admin-category-checkbox">

                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />

                  <span>
                    Catégorie active
                  </span>

                </label>

                <div className="admin-category-form-actions">

                  <button
                    type="button"
                    className="admin-category-cancel"
                    onClick={closeForm}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="admin-category-submit"
                  >
                    {editingCategory
                      ? "Enregistrer les modifications"
                      : "Ajouter la catégorie"}
                  </button>

                </div>

              </form>

            </section>

          )}

          {/* =================================
              LISTE
          ================================= */}

          <section className="admin-categories-section">

            <div className="admin-categories-section-header">

              <div>

                <span>
                  CATALOGUE
                </span>

                <h2>
                  Toutes les catégories
                </h2>

              </div>

            </div>

            {categories.length > 0 ? (

              <div className="admin-categories-grid">

                {categories.map(
                  (category) => (

                    <article
                      className="admin-category-card"
                      key={category.id}
                    >

                      <div className="admin-category-card-top">

                        <div className="admin-category-icon">
                          🏷️
                        </div>

                        <span
                          className={
                            category.active
                              ? "admin-category-status active"
                              : "admin-category-status inactive"
                          }
                        >
                          {category.active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </div>

                      <div className="admin-category-card-body">

                        <h3>
                          {category.name}
                        </h3>

                        <p>
                          {category.description ||
                            "Aucune description."}
                        </p>

                      </div>

                      <div className="admin-category-card-actions">

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleActive(
                              category
                            )
                          }
                          className="category-action-toggle"
                        >
                          {category.active
                            ? "Désactiver"
                            : "Activer"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              category
                            )
                          }
                          className="category-action-edit"
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              category
                            )
                          }
                          className="category-action-delete"
                        >
                          Supprimer
                        </button>

                      </div>

                    </article>

                  )
                )}

              </div>

            ) : (

              <div className="admin-categories-empty">

                <div>
                  🏷️
                </div>

                <h2>
                  Aucune catégorie
                </h2>

                <p>
                  Commencez par créer votre
                  première catégorie.
                </p>

                <button
                  type="button"
                  onClick={openAddForm}
                >
                  + Ajouter une catégorie
                </button>

              </div>

            )}

          </section>

        </div>

      </section>

    </main>
  );
}

export default AdminCategories;