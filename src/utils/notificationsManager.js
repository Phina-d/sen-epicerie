// ========================================
// GESTION DES NOTIFICATIONS
// ========================================

const NOTIFICATIONS_STORAGE_KEY =
  "senepicerie_notifications";

// ========================================
// RÉCUPÉRER LES NOTIFICATIONS
// ========================================

export function getNotifications() {
  const storedNotifications = localStorage.getItem(
    NOTIFICATIONS_STORAGE_KEY
  );

  if (!storedNotifications) {
    return [];
  }

  try {
    return JSON.parse(storedNotifications);
  } catch (error) {
    console.error(
      "Erreur lors de la lecture des notifications :",
      error
    );

    return [];
  }
}

// ========================================
// ENREGISTRER LES NOTIFICATIONS
// ========================================

export function saveNotifications(notifications) {
  localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(notifications)
  );

  window.dispatchEvent(
    new Event("notificationsUpdated")
  );
}

// ========================================
// AJOUTER UNE NOTIFICATION
// ========================================

export function addNotification(notification) {
  const notifications = getNotifications();

  const newNotification = {
    id:
      notification.id ||
      `NOTIF-${Date.now()}`,

    type:
      notification.type ||
      "info",

    title:
      notification.title ||
      "Notification",

    message:
      notification.message ||
      "",

    // ====================================
    // COMMANDE ASSOCIÉE
    // ====================================

    orderId:
      notification.orderId ||
      null,

    // ====================================
    // PRODUIT ASSOCIÉ
    // ====================================

    productId:
      notification.productId ||
      null,

    // ====================================
    // DATE
    // ====================================

    date:
      notification.date ||
      new Date().toISOString(),

    // ====================================
    // LECTURE
    // ====================================

    read:
      notification.read || false,
  };

  notifications.unshift(newNotification);

  saveNotifications(notifications);

  return newNotification;
}

// ========================================
// MARQUER COMME LUE
// ========================================

export function markNotificationAsRead(id) {
  const notifications = getNotifications();

  const updatedNotifications =
    notifications.map((notification) =>
      notification.id === id
        ? {
            ...notification,
            read: true,
          }
        : notification
    );

  saveNotifications(updatedNotifications);
}

// ========================================
// MARQUER TOUTES COMME LUES
// ========================================

export function markAllNotificationsAsRead() {
  const notifications = getNotifications();

  const updatedNotifications =
    notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

  saveNotifications(updatedNotifications);
}

// ========================================
// NOTIFICATIONS NON LUES
// ========================================

export function getUnreadNotifications() {
  return getNotifications().filter(
    (notification) =>
      notification.read !== true
  );
}

// ========================================
// NOMBRE DE NOTIFICATIONS NON LUES
// ========================================

export function getUnreadNotificationsCount() {
  return getUnreadNotifications().length;
}

// ========================================
// SUPPRIMER UNE NOTIFICATION
// ========================================

export function deleteNotification(id) {
  const notifications = getNotifications();

  const updatedNotifications =
    notifications.filter(
      (notification) =>
        notification.id !== id
    );

  saveNotifications(updatedNotifications);
}

// ========================================
// SUPPRIMER TOUTES LES NOTIFICATIONS
// ========================================

export function clearNotifications() {
  saveNotifications([]);
}