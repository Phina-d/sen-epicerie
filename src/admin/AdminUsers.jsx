import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/AdminUsers.css";

const USERS_STORAGE_KEY = "senepicerie_users";

const defaultUsers = [
    {
        id: "USR-001",
        firstName: "Vincent",
        lastName: "MENDY",
        phone: "77 000 00 00",
        email: "vincent@example.com",
        role: "Client",
        status: "Actif",
        date: new Date().toISOString(),
        avatar: "/images/users/vincent.jpg",
    },
];

function getUsers() {
    const storedUsers = localStorage.getItem(
        USERS_STORAGE_KEY
    );

    if (!storedUsers) {
        return [];
    }

    try {
        return JSON.parse(storedUsers);
    } catch (error) {
        console.error(
            "Erreur lors de la lecture des utilisateurs :",
            error
        );

        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(users)
    );

    window.dispatchEvent(
        new Event("usersUpdated")
    );
}

function formatDate(date) {
    return new Date(date).toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
    );
}

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        role: "Client",
        status: "Actif",
        avatar: "",
    });

    const loadUsers = () => {
        const storedUsers = getUsers();

        if (!storedUsers.length) {
            saveUsers(defaultUsers);
            setUsers(defaultUsers);
            return;
        }

     const updatedUsers = storedUsers.map((user) => ({
    ...user,
    avatar:
        user.avatar ||
        (user.id === "USR-001"
            ? "/images/users/vincent.jpg"
            : ""),
}));

setUsers(updatedUsers);
    };

    useEffect(() => {
        loadUsers();

        window.addEventListener(
            "usersUpdated",
            loadUsers
        );

        return () => {
            window.removeEventListener(
                "usersUpdated",
                loadUsers
            );
        };
    }, []);

    const filteredUsers = users.filter(
        (user) => {
            const searchValue =
                search.toLowerCase().trim();

            if (!searchValue) {
                return true;
            }

            return (
                `${user.firstName} ${user.lastName}`
                    .toLowerCase()
                    .includes(searchValue) ||
                user.phone
                    ?.toLowerCase()
                    .includes(searchValue) ||
                user.email
                    ?.toLowerCase()
                    .includes(searchValue)
            );
        }
    );

    const handleAvatarChange = (userId, event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        // Vérifier le type
        if (!file.type.startsWith("image/")) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        // Limite 2 Mo
        if (file.size > 2 * 1024 * 1024) {
            alert("La photo ne doit pas dépasser 2 Mo.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const updatedUsers = users.map((user) => {
                if (user.id !== userId) {
                    return user;
                }

                return {
                    ...user,
                    avatar: reader.result,
                };
            });

            saveUsers(updatedUsers);
            setUsers(updatedUsers);
        };

        reader.readAsDataURL(file);
    };

    const openAddUser = () => {
        setEditingUser(null);

        setFormData({
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            role: "Client",
            status: "Actif",
            avatar: "",
        });

        setShowUserForm(true);
    };

    const openEditUser = (user) => {
        setEditingUser(user);

        setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: user.phone || "",
            email: user.email || "",
            role: user.role || "Client",
            status: user.status || "Actif",
            avatar: user.avatar || "",
        });

        setShowUserForm(true);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleFormAvatar = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("La photo ne doit pas dépasser 2 Mo.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setFormData((current) => ({
                ...current,
                avatar: reader.result,
            }));
        };

        reader.readAsDataURL(file);
    };

    const removeFormAvatar = () => {
        setFormData((current) => ({
            ...current,
            avatar: "",
        }));
    };

    const handleUserSubmit = (event) => {
        event.preventDefault();

        if (!formData.firstName.trim() ||
            !formData.lastName.trim()) {
            alert("Le prénom et le nom sont obligatoires.");
            return;
        }

        let updatedUsers;

        if (editingUser) {
            updatedUsers = users.map((user) =>
                user.id === editingUser.id
                    ? {
                        ...user,
                        ...formData,
                    }
                    : user
            );
        } else {
            const newUser = {
                id: `USR-${Date.now()}`,
                ...formData,
                date: new Date().toISOString(),
            };

            updatedUsers = [
                newUser,
                ...users,
            ];
        }

        saveUsers(updatedUsers);
        setUsers(updatedUsers);

        setShowUserForm(false);
        setEditingUser(null);
    };

    const toggleUserStatus = (userId) => {
        const updatedUsers = users.map(
            (user) => {
                if (user.id !== userId) {
                    return user;
                }

                return {
                    ...user,
                    status:
                        user.status === "Actif"
                            ? "Inactif"
                            : "Actif",
                };
            }
        );

        saveUsers(updatedUsers);
        setUsers(updatedUsers);
    };

    const deleteUser = (userId) => {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cet utilisateur ?"
        );

        if (!confirmed) {
            return;
        }

        const updatedUsers = users.filter(
            (user) => user.id !== userId
        );

        saveUsers(updatedUsers);
        setUsers(updatedUsers);
    };

    const activeUsers = users.filter(
        (user) => user.status === "Actif"
    ).length;

    const inactiveUsers =
        users.length - activeUsers;

    return (
        <main className="admin-users-page">

            {/* =====================================
          HEADER
      ===================================== */}

            <section className="admin-users-header">

                <div className="container">

                    <span className="admin-users-kicker">
                        ADMINISTRATION
                    </span>

                    <div className="admin-users-title-row">

                        <div>

                            <h1>
                                Utilisateurs
                            </h1>

                            <p>
                                Consultez et gérez les utilisateurs
                                de votre boutique.
                            </p>

                        </div>

                        <div className="admin-users-header-actions">

                            <button
                                type="button"
                                className="admin-users-add-button"
                                onClick={openAddUser}
                            >
                                + Ajouter un utilisateur
                            </button>

                            <Link
                                to="/admin"
                                className="admin-users-back"
                            >
                                ← Tableau de bord
                            </Link>

                        </div>

                    </div>

                </div>

            </section>

            {/* =====================================
          CONTENU
      ===================================== */}

            <section className="admin-users-content">

                <div className="container">

                    {/* =================================
              STATISTIQUES
          ================================= */}

                    <div className="admin-users-stats">

                        <div className="admin-user-stat-card">

                            <div className="admin-user-stat-icon">
                                👥
                            </div>

                            <div>

                                <span>
                                    Total utilisateurs
                                </span>

                                <strong>
                                    {users.length}
                                </strong>

                            </div>

                        </div>

                        <div className="admin-user-stat-card">

                            <div className="admin-user-stat-icon">
                                ✅
                            </div>

                            <div>

                                <span>
                                    Utilisateurs actifs
                                </span>

                                <strong>
                                    {activeUsers}
                                </strong>

                            </div>

                        </div>

                        <div className="admin-user-stat-card">

                            <div className="admin-user-stat-icon">
                                ⏸️
                            </div>

                            <div>

                                <span>
                                    Utilisateurs inactifs
                                </span>

                                <strong>
                                    {inactiveUsers}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* =================================
              LISTE
          ================================= */}

                    <section className="admin-users-card">

                        <div className="admin-users-card-header">

                            <div>

                                <span className="admin-users-card-kicker">
                                    CLIENTS
                                </span>

                                <h2>
                                    Liste des utilisateurs
                                </h2>

                            </div>

                            <strong>
                                {filteredUsers.length} utilisateur
                                {filteredUsers.length > 1
                                    ? "s"
                                    : ""}
                            </strong>

                        </div>

                        {/* RECHERCHE */}

                        <div className="admin-users-toolbar">

                            <input
                                type="search"
                                placeholder="Rechercher un utilisateur..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        {/* TABLEAU */}

                        {filteredUsers.length > 0 ? (

                            <div className="admin-users-table-wrapper">

                                <table className="admin-users-table">

                                    <thead>

                                        <tr>
                                            <th>Utilisateur</th>
                                            <th>Téléphone</th>
                                            <th>Email</th>
                                            <th>Rôle</th>
                                            <th>Inscription</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredUsers.map(
                                            (user) => (

                                                <tr key={user.id}>

                                                    {/* UTILISATEUR */}

                                                    <td>

                                                        <div className="admin-user-name">

                                                            <div className="admin-user-avatar-wrapper">

                                                                <div className="admin-user-avatar">

                                                                    {user.avatar ? (
                                                                        <img
                                                                            src={user.avatar}
                                                                            alt={`${user.firstName} ${user.lastName}`}
                                                                        />
                                                                    ) : (
                                                                        <>
                                                                            {user.firstName
                                                                                ?.charAt(0)
                                                                                .toUpperCase()}
                                                                            {user.lastName
                                                                                ?.charAt(0)
                                                                                .toUpperCase()}
                                                                        </>
                                                                    )}

                                                                </div>

                                                                <label
                                                                    htmlFor={`avatar-${user.id}`}
                                                                    className="admin-user-avatar-upload"
                                                                    title="Modifier la photo"
                                                                >
                                                                    📷
                                                                </label>

                                                                <input
                                                                    id={`avatar-${user.id}`}
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(event) =>
                                                                        handleAvatarChange(user.id, event)
                                                                    }
                                                                    hidden
                                                                />

                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {user.firstName}{" "}
                                                                    {user.lastName}
                                                                </strong>

                                                                <small>
                                                                    {user.id}
                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* TÉLÉPHONE */}

                                                    <td>
                                                        {user.phone || "—"}
                                                    </td>

                                                    {/* EMAIL */}

                                                    <td>
                                                        {user.email || "—"}
                                                    </td>

                                                    {/* RÔLE */}

                                                    <td>
                                                        <span className="admin-user-role">
                                                            {user.role}
                                                        </span>
                                                    </td>

                                                    {/* DATE */}

                                                    <td>
                                                        {formatDate(
                                                            user.date
                                                        )}
                                                    </td>

                                                    {/* STATUT */}

                                                    <td>

                                                        <span
                                                            className={
                                                                user.status ===
                                                                    "Actif"
                                                                    ? "admin-user-status active"
                                                                    : "admin-user-status inactive"
                                                            }
                                                        >
                                                            {user.status}
                                                        </span>

                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div className="admin-user-actions">

  <button
    type="button"
    onClick={() => openEditUser(user)}
    title="Modifier"
  >
    ✏️
  </button>

  <button
    type="button"
    onClick={() =>
      toggleUserStatus(user.id)
    }
    title={
      user.status === "Actif"
        ? "Désactiver"
        : "Activer"
    }
  >
    {user.status === "Actif"
      ? "⏸️"
      : "▶️"}
  </button>

  <button
    type="button"
    onClick={() =>
      deleteUser(user.id)
    }
    title="Supprimer"
  >
    🗑️
  </button>

</div>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        ) : (

                            <div className="admin-users-empty">

                                <div>
                                    👥
                                </div>

                                <h2>
                                    Aucun utilisateur
                                </h2>

                                <p>
                                    Aucun utilisateur ne correspond
                                    à votre recherche.
                                </p>

                            </div>

                        )}

                    </section>

                </div>

            </section>

{showUserForm && (
  <div className="admin-user-modal-overlay">

    <div className="admin-user-modal">

      <div className="admin-user-modal-header">

        <div>
          <span>
            UTILISATEUR
          </span>

          <h2>
            {editingUser
              ? "Modifier l'utilisateur"
              : "Ajouter un utilisateur"}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowUserForm(false)}
          className="admin-user-modal-close"
        >
          ×
        </button>

      </div>

      <form onSubmit={handleUserSubmit}>

        {/* PHOTO */}

        <div className="admin-user-form-photo">

          <div className="admin-user-form-avatar">

            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Photo utilisateur"
              />
            ) : (
              <>
                {formData.firstName
                  ?.charAt(0)
                  .toUpperCase() || "?"}

                {formData.lastName
                  ?.charAt(0)
                  .toUpperCase()}
              </>
            )}

          </div>

          <div className="admin-user-photo-actions">

            <label
              htmlFor="user-avatar"
              className="admin-user-photo-button"
            >
              📷{" "}
              {formData.avatar
                ? "Modifier la photo"
                : "Ajouter une photo"}
            </label>

            <input
              id="user-avatar"
              type="file"
              accept="image/*"
              onChange={handleFormAvatar}
              hidden
            />

            {formData.avatar && (
              <button
                type="button"
                onClick={removeFormAvatar}
                className="admin-user-photo-remove"
              >
                🗑️ Supprimer
              </button>
            )}

          </div>

        </div>

        {/* INFORMATIONS */}

        <div className="admin-user-form-grid">

          <div className="admin-user-form-group">

            <label>
              Prénom
            </label>

            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleFormChange}
              placeholder="Prénom"
              required
            />

          </div>

          <div className="admin-user-form-group">

            <label>
              Nom
            </label>

            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleFormChange}
              placeholder="Nom"
              required
            />

          </div>

          <div className="admin-user-form-group">

            <label>
              Téléphone
            </label>

            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="77 000 00 00"
            />

          </div>

          <div className="admin-user-form-group">

            <label>
              Adresse e-mail
            </label>

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="email@example.com"
            />

          </div>

          <div className="admin-user-form-group">

            <label>
              Rôle
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleFormChange}
            >
              <option value="Client">
                Client
              </option>

              <option value="Administrateur">
                Administrateur
              </option>

              <option value="Gestionnaire">
                Gestionnaire
              </option>
            </select>

          </div>

          <div className="admin-user-form-group">

            <label>
              Statut
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
            >
              <option value="Actif">
                Actif
              </option>

              <option value="Inactif">
                Inactif
              </option>
            </select>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="admin-user-modal-actions">

          <button
            type="button"
            className="admin-user-cancel"
            onClick={() =>
              setShowUserForm(false)
            }
          >
            Annuler
          </button>

          <button
            type="submit"
            className="admin-user-save"
          >
            {editingUser
              ? "Enregistrer les modifications"
              : "Ajouter l'utilisateur"}
          </button>

        </div>

      </form>

    </div>

  </div>
)}

        </main>
    );
}

export default AdminUsers;