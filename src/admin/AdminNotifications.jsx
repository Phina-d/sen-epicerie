import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} from "../utils/notificationsManager";

import "../styles/AdminNotifications.css";

function formatDate(date) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminNotifications() {
  const [notifications, setNotifications] =
    useState([]);

  const loadNotifications = () => {
    setNotifications(getNotifications());
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

  const unreadCount = notifications.filter(
    (notification) =>
      notification.read !== true
  ).length;

  const handleMarkAsRead = (id) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleDelete = (id) => {
    deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    if (notifications.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer toutes les notifications ?"
    );

    if (!confirmed) {
      return;
    }

    clearNotifications();
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return "🧾";

      case "stock":
        return "📦";

      case "warning":
        return "⚠️";

      case "success":
        return "✅";

      case "error":
        return "❌";

      default:
        return "🔔";
    }
  };

  const getNotificationClass = (notification) => {
    let className =
      "admin-notification";

    if (!notification.read) {
      className += " unread";
    }

    if (notification.type) {
      className += ` type-${notification.type}`;
    }

    return className;
  };

  return (
    <main className="admin-notifications-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-notifications-header">

        <div className="container">

          <span className="admin-notifications-kicker">
            ADMINISTRATION
          </span>

          <div className="admin-notifications-title-row">

            <div>

              <h1>
                Notifications
              </h1>

              <p>
                Consultez les notifications et
                les événements importants de votre
                boutique.
              </p>

            </div>

            <Link
              to="/admin"
              className="admin-notifications-back"
            >
              ← Tableau de bord
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="admin-notifications-content">

        <div className="container">

          {/* =================================
              BARRE D'ACTIONS
          ================================= */}

          <div className="admin-notifications-toolbar">

            <div>

              <strong>
                {notifications.length}
              </strong>

              <span>
                notification
                {notifications.length > 1
                  ? "s"
                  : ""}
              </span>

              {unreadCount > 0 && (
                <span className="unread-counter">
                  {unreadCount} non lue
                  {unreadCount > 1
                    ? "s"
                    : ""}
                </span>
              )}

            </div>

            <div className="notification-actions">

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notification-action-button"
                  onClick={handleMarkAllAsRead}
                >
                  ✓ Tout marquer comme lu
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  className="notification-delete-all"
                  onClick={handleClearAll}
                >
                  🗑️ Tout supprimer
                </button>
              )}

            </div>

          </div>

          {/* =================================
              LISTE
          ================================= */}

          {notifications.length > 0 ? (

            <div className="admin-notifications-list">

              {notifications.map(
                (notification) => (

                  <article
                    key={notification.id}
                    className={getNotificationClass(
                      notification
                    )}
                  >

                    {/* ICÔNE */}

                    <div className="notification-icon">

                      {getNotificationIcon(
                        notification.type
                      )}

                    </div>

                    {/* CONTENU */}

                    <div className="notification-content">

                      <div className="notification-top">

                        <div>

                          <h2>
                            {notification.title}
                          </h2>

                          {!notification.read && (
                            <span className="notification-new">
                              NOUVEAU
                            </span>
                          )}

                        </div>

                        <span className="notification-date">
                          {formatDate(
                            notification.date
                          )}
                        </span>

                      </div>

                      <p>
                        {notification.message}
                      </p>

           {/* COMMANDE */}

{notification.orderId && (
  <Link
    to="/admin/orders"
    className="notification-order-link"
  >
    Voir la commande →
  </Link>
)}

{/* PRODUIT */}

{notification.productId && (
  <Link
    to="/admin/products"
    className="notification-product-link"
  >
    Voir le produit →
  </Link>
)}
                      {/* ACTIONS */}

                      <div className="notification-footer">

                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(
                                notification.id
                              )
                            }
                            className="notification-read-button"
                          >
                            ✓ Marquer comme lue
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              notification.id
                            )
                          }
                          className="notification-delete-button"
                        >
                          Supprimer
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          ) : (

            /* =================================
               VIDE
            ================================= */

            <div className="admin-notifications-empty">

              <div className="admin-notifications-empty-icon">
                🔔
              </div>

              <h2>
                Aucune notification
              </h2>

              <p>
                Les nouvelles commandes et les
                événements importants apparaîtront
                ici.
              </p>

              <Link
                to="/admin"
                className="admin-notifications-empty-button"
              >
                Retour au tableau de bord
              </Link>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

export default AdminNotifications;