import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

import {
  getUnreadNotificationsCount,
} from "../utils/notificationsManager";

import { useAuth } from "../context/AuthContext";

import "../styles/AdminSidebar.css";

function AdminSidebar() {
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  const loadNotifications = () => {
    setUnreadCount(
      getUnreadNotificationsCount()
    );
  };

  useEffect(() => {
    loadNotifications();

    window.addEventListener(
      "notificationsUpdated",
      loadNotifications
    );

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        loadNotifications
      );
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la déconnexion :",
        error
      );
    }
  };

  return (
    <aside className="admin-sidebar">

      {/* =====================================
          LOGO
      ===================================== */}

      <div className="admin-sidebar-logo">

        <div className="admin-sidebar-logo-icon">
          🛒
        </div>

        <div>
          <strong>
            SENÉPICERIE
          </strong>

          <span>
            Administration
          </span>
        </div>

      </div>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="admin-sidebar-nav">

        <span className="admin-sidebar-label">
          MENU
        </span>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>📊</span>
          Tableau de bord
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>📦</span>
          Produits
        </NavLink>

        <NavLink
          to="/admin/sales"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>💰</span>
          Ventes
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>🧾</span>
          Commandes
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>👥</span>
          Utilisateurs
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>🗂️</span>
          Catégories
        </NavLink>

        <NavLink
          to="/admin/statistics"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>📈</span>
          Graphiques / Statistiques
        </NavLink>

        <NavLink
          to="/admin/notifications"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>🔔</span>

          <span className="admin-sidebar-notification-text">
            Notifications
          </span>

          {unreadCount > 0 && (
            <span className="admin-sidebar-notification-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar-link active"
              : "admin-sidebar-link"
          }
        >
          <span>⚙️</span>
          Paramètres
        </NavLink>

      </nav>

      {/* =====================================
          BAS
      ===================================== */}

      <div className="admin-sidebar-bottom">

        {/* UTILISATEUR CONNECTÉ */}

        {user && (
          <div className="admin-sidebar-user">

            <div className="admin-sidebar-user-icon">
              👤
            </div>

            <div className="admin-sidebar-user-info">

              <strong>
                Administrateur
              </strong>

              <span>
                {user.email}
              </span>

            </div>

          </div>
        )}

        {/* VOIR LA BOUTIQUE */}

        <Link
          to="/"
          className="admin-sidebar-shop-link"
        >
          <span>🏪</span>
          Voir la boutique
        </Link>

        {/* DÉCONNEXION */}

         <button
    type="button"
    className="admin-logout-button"
    onClick={handleLogout}
  >
    🚪 Déconnexion
  </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;