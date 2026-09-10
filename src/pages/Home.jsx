import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getProducts,
} from "../utils/productsManager";

import ProductCard from "../components/ProductCard";
import "../styles/Home.css";

function Home() {
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

  const featuredProducts = products.filter(
    (product) =>
      product.active !== false &&
      product.featured
  );

  return (
    <main>

      {/* HERO */}

      <section className="home-hero">
        <div className="container">

          <span className="hero-badge">
            🇸🇳 Votre épicerie en ligne
          </span>

          <h1>
            Les produits du quotidien,
            <br />
            simplement chez vous.
          </h1>

          <p>
            Retrouvez vos produits alimentaires,
            épices, boissons et produits ménagers
            au meilleur prix.
          </p>

          <Link
            to="/shop"
            className="primary-button"
          >
            Découvrir la boutique
          </Link>

        </div>
      </section>

      {/* PRODUITS */}

      <section className="home-section">
        <div className="container">

          <div className="section-heading">

            <div>
              <span>
                Découvrez notre sélection
              </span>

              <h2>
                Produits populaires
              </h2>
            </div>

          </div>

          {featuredProducts.length > 0 ? (

            <div className="product-grid">

              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}

            </div>

          ) : (

            <div className="empty-products">

              <div>📦</div>

              <h3>
                Aucun produit populaire
              </h3>

              <p>
                Les produits mis en avant
                apparaîtront ici.
              </p>

            </div>

          )}

        </div>
      </section>

    </main>
  );
}

export default Home;