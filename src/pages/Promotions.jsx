import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProducts } from "../utils/productsManager";

import ProductCard from "../components/ProductCard";

import "../styles/Promotions.css";

function Promotions() {
  const [products, setProducts] =
    useState([]);

  // ========================================
  // CHARGER LES PRODUITS
  // ========================================

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

  // ========================================
  // PRODUITS EN PROMOTION
  // ========================================

  const promotionProducts =
    products.filter(
      (product) =>
        product.active !== false &&
        product.promo === true &&
        Number(product.oldPrice || 0) >
          Number(product.price || 0)
    );

  // ========================================
  // RENDU
  // ========================================

  return (
    <main className="promotions-page">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="promotions-hero">

        <div className="container">

          <span className="promotions-kicker">
            SENÉPICERIE · BONNES AFFAIRES
          </span>

          <h1>
            Nos promotions
          </h1>

          <p>
            Profitez de nos meilleures offres
            et faites vos courses à prix réduit.
          </p>

          <div className="promotions-hero-badge">
            🏷️ Des prix avantageux toute l'année
          </div>

        </div>

      </section>

      {/* =====================================
          PRODUITS
      ===================================== */}

      <section className="promotions-section">

        <div className="container">

          <div className="promotions-heading">

            <div>

              <span>
                OFFRES DU MOMENT
              </span>

              <h2>
                Produits en promotion
              </h2>

            </div>

            {promotionProducts.length >
              0 && (
              <strong>
                {promotionProducts.length} offre
                {promotionProducts.length >
                1
                  ? "s"
                  : ""}
              </strong>
            )}

          </div>

          {promotionProducts.length >
          0 ? (
            <div className="promotions-grid">

              {promotionProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}

            </div>
          ) : (
            <div className="promotions-empty">

              <div className="promotions-empty-icon">
                🏷️
              </div>

              <h2>
                Aucune promotion pour le moment
              </h2>

              <p>
                Nos prochaines offres
                apparaîtront ici.
              </p>

              <Link
                to="/shop"
                className="promotions-button"
              >
                Découvrir la boutique →
              </Link>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}

export default Promotions;