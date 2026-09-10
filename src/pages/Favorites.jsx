import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard";

import {
  clearFavorites,
  getFavorites,
} from "../utils/favoritesManager";

import "../styles/Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  /* ========================================
     CHARGEMENT
  ======================================== */

  useEffect(() => {
    const loadFavorites = () => {
      setFavorites(getFavorites());
    };

    loadFavorites();

    window.addEventListener(
      "favoritesUpdated",
      loadFavorites
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        loadFavorites
      );
    };
  }, []);

  /* ========================================
     VIDER
  ======================================== */

  const handleClearFavorites = () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer tous vos favoris ?"
    );

    if (!confirmed) {
      return;
    }

    clearFavorites();
  };

  return (
    <main className="favorites-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="favorites-header">

        <div className="container">

          <span className="favorites-kicker">
            VOTRE SÉLECTION
          </span>

          <div className="favorites-title-row">

            <div>

              <h1>
                Mes favoris
              </h1>

              <p>
                Retrouvez ici les produits que
                vous souhaitez garder de côté.
              </p>

            </div>

            {favorites.length > 0 && (
              <button
                type="button"
                className="favorites-clear"
                onClick={handleClearFavorites}
              >
                🗑️ Vider les favoris
              </button>
            )}

          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="favorites-content">

        <div className="container">

          {favorites.length > 0 ? (

            <>

              <div className="favorites-summary">

                <strong>
                  {favorites.length}
                </strong>

                <span>
                  produit
                  {favorites.length > 1
                    ? "s"
                    : ""}{" "}
                  dans vos favoris
                </span>

              </div>

              <div className="product-grid favorites-grid">

                {favorites.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}

              </div>

            </>

          ) : (

            <div className="favorites-empty">

              <div className="favorites-empty-icon">
                ♡
              </div>

              <h2>
                Aucun favori pour le moment
              </h2>

              <p>
                Ajoutez vos produits préférés
                pour les retrouver facilement
                plus tard.
              </p>

              <Link
                to="/shop"
                className="favorites-shop-button"
              >
                Découvrir la boutique
              </Link>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default Favorites;