import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

import {
  isFavorite,
  toggleFavorite,
} from "../utils/favoritesManager";

import "../styles/ProductCard.css";

function ProductCard({ product }) {
  const {
    id,
    name,
    category,
    price,
    oldPrice,
    promo,
    promoPercent,
    stock,
    unit,
    image,
    alertStock = 5,
  } = product;

  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);

  const [favorite, setFavorite] =
    useState(() => isFavorite(id));

  // ========================================
  // PROMOTION
  // ========================================

  const numericPrice =
    Number(price) || 0;

  const numericOldPrice =
    Number(oldPrice) || 0;

  const isProductOnSale =
    promo === true &&
    numericOldPrice > numericPrice;

  const calculatedDiscount =
    isProductOnSale
      ? Math.round(
          ((numericOldPrice -
            numericPrice) /
            numericOldPrice) *
            100
        )
      : 0;

  const promotionPercent =
    isProductOnSale
      ? Number(promoPercent) > 0
        ? Number(promoPercent)
        : calculatedDiscount
      : 0;

  // ========================================
  // FAVORIS
  // ========================================

  useEffect(() => {
    const updateFavorite = () => {
      setFavorite(isFavorite(id));
    };

    window.addEventListener(
      "favoritesUpdated",
      updateFavorite
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        updateFavorite
      );
    };
  }, [id]);

  // ========================================
  // PANIER
  // ========================================

  const handleAddToCart = () => {
    const productForCart = {
      ...product,

      price: numericPrice,

      originalPrice:
        isProductOnSale
          ? numericOldPrice
          : numericPrice,

      promo:
        isProductOnSale,

      oldPrice:
        isProductOnSale
          ? numericOldPrice
          : null,

      promoPercent:
        promotionPercent,
    };

    const success =
      addToCart(productForCart);

    if (success) {
      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1200);
    }
  };

  // ========================================
  // FAVORI
  // ========================================

  const handleFavorite = () => {
    const newFavorite =
      toggleFavorite(product);

    setFavorite(newFavorite);
  };

  // ========================================
  // RENDU
  // ========================================

  return (
    <article
      className={`product-card ${
        isProductOnSale
          ? "is-promotion"
          : ""
      }`}
    >
      {/* =====================================
          IMAGE
      ===================================== */}

      <div className="product-image">

        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
          />
        ) : (
          <div className="product-placeholder">
            🛒
          </div>
        )}

        {/* =================================
            BADGE PROMOTION
        ================================= */}

        {isProductOnSale &&
          promotionPercent > 0 && (
            <span className="product-discount-badge">
              -{promotionPercent}%
            </span>
          )}

        {/* =================================
            FAVORI
        ================================= */}

        <button
          className={`favorite ${
            favorite
              ? "is-favorite"
              : ""
          }`}
          type="button"
          onClick={handleFavorite}
          aria-label={
            favorite
              ? `Retirer ${name} des favoris`
              : `Ajouter ${name} aux favoris`
          }
          aria-pressed={favorite}
        >
          {favorite ? "♥" : "♡"}
        </button>

      </div>

      {/* =====================================
          INFORMATIONS
      ===================================== */}

      <div className="product-info">

        <span className="product-category">
          {category}
        </span>

        <h3>
          {name}
        </h3>

        <p>
          Vendu par {unit}
        </p>

        <Link
          to={`/product/${id}`}
          className="product-detail-link"
        >
          Voir le détail →
        </Link>

        {/* =================================
            PRIX + STOCK
        ================================= */}

        <div className="product-bottom">

          <div className="product-price-area">

            {isProductOnSale ? (
              <>
                <span className="product-old-price">
                  {numericOldPrice.toLocaleString(
                    "fr-FR"
                  )}{" "}
                  FCFA
                </span>

                <strong className="product-sale-price">
                  {numericPrice.toLocaleString(
                    "fr-FR"
                  )}{" "}
                  FCFA
                </strong>
              </>
            ) : (
              <strong className="product-normal-price">
                {numericPrice.toLocaleString(
                  "fr-FR"
                )}{" "}
                FCFA
              </strong>
            )}

            <small
              className={
                Number(stock) === 0
                  ? "stock-out"
                  : Number(stock) <=
                    alertStock
                  ? "stock-low"
                  : ""
              }
            >
              {Number(stock) === 0
                ? "Rupture de stock"
                : `${stock} ${unit} disponible${
                    Number(stock) > 1
                      ? "s"
                      : ""
                  }`}
            </small>

          </div>

          {/* PANIER */}

          <button
            className={`add-cart ${
              added ? "added" : ""
            }`}
            type="button"
            disabled={
              Number(stock) === 0
            }
            onClick={
              handleAddToCart
            }
            aria-label={
              `Ajouter ${name} au panier`
            }
          >
            {added ? "✓" : "+"}
          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;