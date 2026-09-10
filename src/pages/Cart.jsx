import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";

function Cart() {
  const {
    cart,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (cart.length === 0) {
    return (
      <main className="cart-page">

        <div className="container">

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h1>
              Votre panier est vide
            </h1>

            <p>
              Découvrez nos produits et ajoutez
              vos articles préférés au panier.
            </p>

            <Link
              to="/shop"
              className="primary-button"
            >
              Découvrir la boutique
            </Link>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="cart-page">

      <div className="container">

        <div className="cart-title">

          <div>
            <span>VOTRE COMMANDE</span>

            <h1>
              Mon panier
            </h1>
          </div>

          <span>
            {cartCount} article
            {cartCount > 1 ? "s" : ""}
          </span>

        </div>

        <div className="cart-layout">

          <section className="cart-items">

            {cart.map((item) => (

              <article
                className="cart-item"
                key={item.id}
              >

                <div className="cart-item-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  ) : (
                    <span>🛒</span>
                  )}

                </div>

                <div className="cart-item-info">

                  <span>
                    {item.category}
                  </span>

                  <h2>
                    {item.name}
                  </h2>

                  <p>
                    {item.price.toLocaleString(
                      "fr-FR"
                    )} FCFA / {item.unit}
                  </p>

                  <div className="quantity-control">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(item.id)
                      }
                    >
                      −
                    </button>

                    <strong>
                      {item.quantity}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(item.id)
                      }
                      disabled={
                        item.quantity >= item.stock
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="cart-item-price">

                  <strong>
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString("fr-FR")} FCFA
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                  >
                    Supprimer
                  </button>

                </div>

              </article>

            ))}

            <button
              type="button"
              className="clear-cart"
              onClick={clearCart}
            >
              Vider le panier
            </button>

          </section>

          <aside className="cart-summary">

            <h2>
              Résumé
            </h2>

            <div className="summary-line">
              <span>
                Sous-total
              </span>

              <strong>
                {cartTotal.toLocaleString(
                  "fr-FR"
                )} FCFA
              </strong>
            </div>

            <div className="summary-line">
              <span>
                Livraison
              </span>

              <span>
                À calculer
              </span>
            </div>

            <div className="summary-total">
              <span>
                Total
              </span>

              <strong>
                {cartTotal.toLocaleString(
                  "fr-FR"
                )} FCFA
              </strong>
            </div>

            <Link
              to="/checkout"
              className="checkout-button"
            >
              Passer la commande
            </Link>

            <Link
              to="/shop"
              className="continue-shopping"
            >
              ← Continuer mes achats
            </Link>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Cart;