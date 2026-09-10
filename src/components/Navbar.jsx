import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/Navbar.css";

function Navbar() {
  const { cartCount } = useCart();

  return (
    <header className="site-navbar">

      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🛒</span>

          <span>
            Sen<span>Épicerie</span>
          </span>
        </Link>

        {/* MENU */}
        <nav className="navbar-menu">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Accueil
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Boutique
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Catégories
          </NavLink>

            <NavLink
    to="/promotions"
    className={({ isActive }) =>
      isActive ? "navbar-link active" : "navbar-link"
    }
  >
    Promotions
  </NavLink>

        </nav>

        {/* ACTIONS */}
        <div className="navbar-actions">

          <Link
            to="/cart"
            className="navbar-cart"
            aria-label="Voir le panier"
          >
            <span className="navbar-cart-icon">
              🛒
            </span>

            <span className="navbar-cart-text">
              Panier
            </span>

            {cartCount > 0 && (
              <span className="navbar-cart-badge">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ADMIN */}
          <Link
            to="/admin"
            className="navbar-admin-link"
          >
            Administration
          </Link>

        </div>

      </div>

    </header>
  );
}

export default Navbar;