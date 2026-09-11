import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import {
  loadProductsFromSupabase,
} from "../utils/productsManager";

import "../styles/Shop.css";

function Shop() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState(
    searchParams.get("category") || "Toutes"
  );

  const [sort, setSort] = useState("default");

  // ========================================
  // CHARGEMENT DES PRODUITS
  // ========================================

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const productsFromSupabase =
          await loadProductsFromSupabase();

        if (isMounted) {
          setProducts(productsFromSupabase);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des produits :",
          error
        );
      }
    };

    loadProducts();

    // ======================================
    // MISE À JOUR APRÈS MODIFICATION
    // ======================================

    const handleProductsUpdated = () => {
      loadProducts();
    };

    window.addEventListener(
      "productsUpdated",
      handleProductsUpdated
    );

    return () => {
      isMounted = false;

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
        .filter(
          (product) =>
            product.active !== false
        )
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean)
    ),
  ];

  // ========================================
  // FILTRAGE + TRI
  // ========================================

  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (product) => {
        // Ne montrer que les produits actifs
        if (product.active === false) {
          return false;
        }

        const productName =
          typeof product.name === "string"
            ? product.name
            : "";

        const productCategory =
          product.category || "";

        const matchesSearch =
          productName
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesCategory =
          category === "Toutes" ||
          productCategory === category;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );

    // Prix croissant
    if (sort === "price-asc") {
      result.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );
    }

    // Prix décroissant
    if (sort === "price-desc") {
      result.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      );
    }

    // Nom
    if (sort === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || ""),
          "fr",
          {
            sensitivity: "base",
          }
        )
      );
    }

    return result;
  }, [
    products,
    search,
    category,
    sort,
  ]);

  // ========================================
  // AFFICHAGE
  // ========================================

  return (
    <main className="shop-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="shop-header">

        <div className="container">

          <span className="shop-kicker">
            SENÉPICERIE
          </span>

          <h1>
            Notre boutique
          </h1>

          <p>
            Découvrez tous nos produits
            alimentaires et produits du
            quotidien.
          </p>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="shop-content">

        <div className="container">

          {/* RECHERCHE + TRI */}

          <div className="shop-toolbar">

            <div className="search-box">

              <span>
                🔎
              </span>

              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="clear-search"
                >
                  ×
                </button>
              )}

            </div>

            <div className="sort-box">

              <label htmlFor="sort">
                Trier :
              </label>

              <select
                id="sort"
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
              >

                <option value="default">
                  Pertinence
                </option>

                <option value="price-asc">
                  Prix croissant
                </option>

                <option value="price-desc">
                  Prix décroissant
                </option>

                <option value="name">
                  Nom
                </option>

              </select>

            </div>

          </div>

          {/* =================================
              CATÉGORIES
          ================================= */}

          <div className="category-filter">

            {categories.map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    category === item
                      ? "category-button active"
                      : "category-button"
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                >
                  {item}
                </button>
              )
            )}

          </div>

          {/* =================================
              RÉSULTATS
          ================================= */}

          <div className="shop-result-header">

            <div>

              <h2>
                Tous les produits
              </h2>

              <span>
                {filteredProducts.length} produit
                {filteredProducts.length > 1
                  ? "s"
                  : ""}
              </span>

            </div>

          </div>

          {/* =================================
              PRODUITS
          ================================= */}

          {filteredProducts.length > 0 ? (

            <div className="product-grid">

              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}

            </div>

          ) : (

            <div className="empty-products">

              <div>
                🔎
              </div>

              <h3>
                Aucun produit trouvé
              </h3>

              <p>
                Essayez une autre recherche
                ou sélectionnez une autre
                catégorie.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("Toutes");
                }}
              >
                Réinitialiser les filtres
              </button>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default Shop;