import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getProducts,
  deleteProduct,
} from "../utils/productsManager";

import "../styles/AdminProducts.css";

// ========================================
// FORMAT PRIX
// ========================================

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}

// ========================================
// ADMIN PRODUCTS
// ========================================

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");

  // ========================================
  // CHARGER LES PRODUITS
  // ========================================

  const loadProducts = async () => {
    try {
      const currentProducts = await getProducts();

      setProducts(
        Array.isArray(currentProducts)
          ? currentProducts
          : []
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement des produits :",
        error
      );

      setProducts([]);
    }
  };

  // ========================================
  // CHARGEMENT INITIAL
  // ========================================

  useEffect(() => {
    loadProducts();

    const handleProductsUpdated = () => {
      loadProducts();
    };

    window.addEventListener(
      "productsUpdated",
      handleProductsUpdated
    );

    return () => {
      window.removeEventListener(
        "productsUpdated",
        handleProductsUpdated
      );
    };
  }, []);

  // ========================================
  // CATÉGORIES
  // ========================================

  const categories = [
    "Toutes",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // ========================================
  // FILTRAGE
  // ========================================

  const filteredProducts = products.filter(
    (product) => {
      const searchValue =
        search.toLowerCase().trim();

      const productName =
        String(product.name || "").toLowerCase();

      const productCategory =
        String(
          product.category || ""
        ).toLowerCase();

      const matchesSearch =
        productName.includes(searchValue) ||
        productCategory.includes(searchValue);

      const matchesCategory =
        category === "Toutes" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  // ========================================
  // SUPPRIMER UN PRODUIT
  // ========================================

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${product.name}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(product.id);

      // Recharger depuis Supabase
      await loadProducts();

      console.log(
        "✅ Produit supprimé avec succès :",
        product.name
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression du produit :",
        error
      );

      alert(
        "Impossible de supprimer ce produit. Veuillez réessayer."
      );
    }
  };

  // ========================================
  // CLASSE STOCK
  // ========================================

  const getStockClass = (stock) => {
    const quantity =
      Number(stock) || 0;

    if (quantity === 0) {
      return "stock-out";
    }

    if (quantity <= 5) {
      return "stock-low";
    }

    return "stock-ok";
  };

  // ========================================
  // LABEL STOCK
  // ========================================

  const getStockLabel = (stock) => {
    const quantity =
      Number(stock) || 0;

    if (quantity === 0) {
      return "Rupture";
    }

    if (quantity <= 5) {
      return "Stock faible";
    }

    return "Disponible";
  };

  // ========================================
  // AFFICHAGE
  // ========================================

  return (
    <main className="admin-products-page">

      {/* =====================================
          EN-TÊTE
      ===================================== */}

      <section className="admin-products-header">

        <div className="container">

          <span className="admin-products-kicker">
            ADMINISTRATION
          </span>

          <div className="admin-products-title-row">

            <div>

              <h1>
                Produits
              </h1>

              <p>
                Gérez les produits et les stocks
                de votre boutique.
              </p>

            </div>

            <Link
              to="/admin/products/add"
              className="admin-add-product-button"
            >
              + Ajouter un produit
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="admin-products-content">

        <div className="container">

          {/* =====================================
              FILTRES
          ===================================== */}

          <div className="admin-products-toolbar">

            <div className="admin-products-search">

              <span>
                🔎
              </span>

              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="admin-category-select"
            >

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

          </div>

          {/* =====================================
              RÉSULTATS
          ===================================== */}

          <div className="admin-products-result">

            <strong>
              {filteredProducts.length}
            </strong>

            <span>
              produit
              {filteredProducts.length > 1
                ? "s"
                : ""}
            </span>

          </div>

          {/* =====================================
              TABLEAU
          ===================================== */}

          {filteredProducts.length > 0 ? (

            <div className="admin-products-table-wrapper">

              <table className="admin-products-table">

                <thead>

                  <tr>

                    <th>
                      Produit
                    </th>

                    <th>
                      Catégorie
                    </th>

                    <th>
                      Prix
                    </th>

                    <th>
                      Stock
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

                  {filteredProducts.map(
                    (product) => {

                      const stock =
                        Number(
                          product.stock
                        ) || 0;

                      return (

                        <tr
                          key={product.id}
                        >

                          {/* PRODUIT */}

                          <td>

                            <div className="admin-product-cell">

                              <div className="admin-product-image">

                                {product.image ? (

                                  <img
                                    src={
                                      product.image
                                    }
                                    alt={
                                      product.name
                                    }
                                  />

                                ) : (

                                  <span>
                                    📦
                                  </span>

                                )}

                              </div>

                              <div>

                                <strong>
                                  {
                                    product.name
                                  }
                                </strong>

                                <small>
                                  {
                                    product.unit ||
                                    "unité"
                                  }
                                </small>

                              </div>

                            </div>

                          </td>

                          {/* CATÉGORIE */}

                          <td>

                            <span className="admin-category">
                              {
                                product.category ||
                                "Autres"
                              }
                            </span>

                          </td>

                          {/* PRIX */}

                          <td>

                            <strong>
                              {formatPrice(
                                product.price
                              )}
                            </strong>

                            {product.promo &&
                              Number(
                                product.oldPrice || 0
                              ) >
                                Number(
                                  product.price || 0
                                ) && (
                                  <small className="admin-old-price">
                                    {formatPrice(
                                      product.oldPrice
                                    )}
                                  </small>
                                )}

                          </td>

                          {/* STOCK */}

                          <td>

                            <strong>
                              {stock}
                            </strong>{" "}

                            <small>
                              {
                                product.unit ||
                                "unité"
                              }
                            </small>

                          </td>

                          {/* STATUT */}

                          <td>

                            <span
                              className={`admin-stock-badge ${getStockClass(
                                stock
                              )}`}
                            >
                              {getStockLabel(
                                stock
                              )}
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="admin-product-actions">

                              <Link
                                to={`/admin/products/edit/${product.id}`}
                                className="admin-edit-button"
                                title="Modifier"
                              >
                                ✏️
                              </Link>

                              <button
                                type="button"
                                className="admin-delete-button"
                                title="Supprimer"
                                onClick={() =>
                                  handleDelete(
                                    product
                                  )
                                }
                              >
                                🗑️
                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            /* =====================================
               AUCUN PRODUIT
            ===================================== */

            <div className="admin-products-empty">

              <div>
                📦
              </div>

              <h2>
                Aucun produit trouvé
              </h2>

              <p>
                Aucun produit ne correspond
                à votre recherche.
              </p>

              {(search ||
                category !== "Toutes") && (

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("Toutes");
                  }}
                >
                  Réinitialiser les filtres
                </button>

              )}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default AdminProducts;