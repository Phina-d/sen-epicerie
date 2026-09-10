import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getProducts } from "../utils/productsManager";

import "../styles/Categories.css";

function Categories() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = () => {
      setProducts(getProducts());
    };

    loadProducts();

    window.addEventListener(
      "productsUpdated",
      loadProducts
    );

    return () => {
      window.removeEventListener(
        "productsUpdated",
        loadProducts
      );
    };
  }, []);

  const categories = useMemo(() => {
    const activeProducts = products.filter(
      (product) => product.active !== false
    );

    const categoryMap = {};

    activeProducts.forEach((product) => {
      const category = product.category || "Autres";

      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          count: 0,
          image: "",
        };
      }

      categoryMap[category].count += 1;

      // Première image disponible de la catégorie
      if (
        !categoryMap[category].image &&
        product.image
      ) {
        categoryMap[category].image = product.image;
      }
    });

    return Object.values(categoryMap);
  }, [products]);

  return (
    <main className="categories-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="categories-header">

        <div className="container">

          <span className="categories-kicker">
            SENÉPICERIE
          </span>

          <h1>
            Nos catégories
          </h1>

          <p>
            Retrouvez facilement les produits
            dont vous avez besoin.
          </p>

        </div>

      </section>

      {/* =====================================
          CATÉGORIES
      ===================================== */}

      <section className="categories-content">

        <div className="container">

          {categories.length > 0 ? (

            <div className="categories-grid">

              {categories.map((category) => (

                <Link
                  key={category.name}
                  to={`/shop?category=${encodeURIComponent(
                    category.name
                  )}`}
                  className="category-card"
                >

                  {/* IMAGE */}

                  <div className="category-image">

                    {category.image ? (

                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                      />

                    ) : (

                      <span>
                        🛒
                      </span>

                    )}

                  </div>

                  {/* INFORMATIONS */}

                  <div className="category-info">

                    <h2>
                      {category.name}
                    </h2>

                    <span>
                      {category.count} produit
                      {category.count > 1 ? "s" : ""}
                    </span>

                    <strong>
                      Voir les produits →
                    </strong>

                  </div>

                </Link>

              ))}

            </div>

          ) : (

            <div className="categories-empty">

              <div>
                📦
              </div>

              <h2>
                Aucune catégorie disponible
              </h2>

              <p>
                Ajoutez des produits depuis
                l'administration pour voir
                apparaître les catégories.
              </p>

              <Link
                to="/admin/products/add"
                className="primary-button"
              >
                Ajouter un produit
              </Link>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default Categories;