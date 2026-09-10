import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProductById } from "../utils/productsManager";
import { useCart } from "../context/CartContext";

import "../styles/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  /* ========================================
     CHARGER LE PRODUIT
  ======================================== */

  useEffect(() => {
    const loadProduct = () => {
      const foundProduct = getProductById(id);

      setProduct(foundProduct || null);
    };

    loadProduct();

    const handleProductsUpdated = () => {
      loadProduct();
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
  }, [id]);

  /* ========================================
     PRODUIT INTROUVABLE
  ======================================== */

  if (!product) {
    return (
      <main className="product-details-page">

        <div className="container">

          <div className="product-not-found">

            <div className="product-not-found-icon">
              📦
            </div>

            <h1>
              Produit introuvable
            </h1>

            <p>
              Ce produit n'existe pas ou n'est plus
              disponible.
            </p>

            <Link
              to="/shop"
              className="primary-button"
            >
              Retourner à la boutique
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* ========================================
     CALCULS
  ======================================== */

  const stock = Number(product.stock || 0);
  const price = Number(product.price || 0);

  const total = price * quantity;

  const maxQuantity = Math.max(stock, 1);

  /* ========================================
     QUANTITÉ
  ======================================== */

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(maxQuantity, current + 1)
    );
  };

  /* ========================================
     AJOUT PANIER
  ======================================== */

 const handleAddToCart = () => {
  if (stock <= 0) {
    return;
  }

  for (let i = 0; i < quantity; i++) {
    const success = addToCart(product);

    if (!success) {
      return;
    }
  }

  setAdded(true);

  setTimeout(() => {
    setAdded(false);
  }, 1500);
};

  /* ========================================
     ACHETER MAINTENANT
  ======================================== */

  const handleBuyNow = () => {
  if (stock <= 0) {
    return;
  }

  for (let i = 0; i < quantity; i++) {
    const success = addToCart(product);

    if (!success) {
      return;
    }
  }

  navigate("/checkout");
};

  return (
    <main className="product-details-page">

      <div className="container">

        {/* =====================================
            FIL D'ARIANE
        ===================================== */}

        <div className="product-breadcrumb">

          <Link to="/">
            Accueil
          </Link>

          <span>›</span>

          <Link to="/shop">
            Boutique
          </Link>

          <span>›</span>

          <strong>
            {product.name}
          </strong>

        </div>

        {/* =====================================
            PRODUIT
        ===================================== */}

        <section className="product-details">

          {/* IMAGE */}

          <div className="product-details-image">

            {product.image ? (

              <img
                src={product.image}
                alt={product.name}
              />

            ) : (

              <div className="product-details-placeholder">
                🛒
              </div>

            )}

          </div>

          {/* INFORMATIONS */}

          <div className="product-details-info">

            <span className="product-details-category">
              {product.category}
            </span>

            <h1>
              {product.name}
            </h1>

            {product.description && (

              <p className="product-details-description">
                {product.description}
              </p>

            )}

            {/* PRIX */}

            <div className="product-details-price">

              {price.toLocaleString("fr-FR")} FCFA

              <span>
                / {product.unit}
              </span>

            </div>

            {/* STOCK */}

            <div
              className={
                stock > 0
                  ? "product-details-stock available"
                  : "product-details-stock unavailable"
              }
            >

              {stock > 0
                ? `✓ ${stock} ${product.unit} disponible${
                    stock > 1 ? "s" : ""
                  }`
                : "✕ Rupture de stock"}

            </div>

            {/* QUANTITÉ */}

            {stock > 0 && (

              <div className="product-quantity">

                <span>
                  Quantité
                </span>

                <div className="quantity-control">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <strong>
                    {quantity}
                  </strong>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= stock}
                  >
                    +
                  </button>

                </div>

              </div>

            )}

            {/* TOTAL */}

            {stock > 0 && (

              <div className="product-details-total">

                <span>
                  Total
                </span>

                <strong>
                  {total.toLocaleString("fr-FR")} FCFA
                </strong>

              </div>

            )}

            {/* ACTIONS */}

            <div className="product-details-actions">

              <button
                type="button"
                className={`product-add-cart ${
                  added ? "added" : ""
                }`}
                disabled={stock <= 0}
                onClick={handleAddToCart}
              >
                {added
                  ? "✓ Ajouté au panier"
                  : "Ajouter au panier"}
              </button>

              <button
                type="button"
                className="product-buy-now"
                disabled={stock <= 0}
                onClick={handleBuyNow}
              >
                Acheter maintenant
              </button>

            </div>

            {/* RETOUR */}

            <Link
              to="/shop"
              className="product-back-shop"
            >
              ← Continuer mes achats
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}

export default ProductDetails;