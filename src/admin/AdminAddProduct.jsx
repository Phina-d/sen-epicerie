import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { addProduct } from "../utils/productsManager";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

import "../styles/AdminAddProduct.css";

function AdminAddProduct() {
  const navigate = useNavigate();

  /* ========================================
     FORMULAIRE
  ======================================== */

  const [form, setForm] = useState({
    name: "",
    category: "Épicerie",
    description: "",
    price: "",
    salePrice: "",
    stock: "",
    unit: "unité",
    image: "",
    featured: false,
    onSale: false,
    discount: 0,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ========================================
     MODIFICATION DU FORMULAIRE
  ======================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ========================================
     IMAGE
  ======================================== */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    /* Vérification du type */

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    /* Vérification de la taille : 5 Mo */

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setError("");

    setSelectedFile(file);

    /* Aperçu local */

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  /* ========================================
     PROMOTION
  ======================================== */

  const handleSaleToggle = (event) => {
    const enabled = event.target.checked;

    setForm((previous) => ({
      ...previous,
      onSale: enabled,
      salePrice: enabled
        ? previous.salePrice
        : "",
      discount: enabled
        ? previous.discount
        : 0,
    }));
  };

  /* ========================================
     CALCUL AUTOMATIQUE DE LA RÉDUCTION
  ======================================== */

  const calculateDiscount = () => {
    const price = Number(form.price);
    const salePrice = Number(form.salePrice);

    if (
      !price ||
      price <= 0 ||
      !salePrice ||
      salePrice <= 0 ||
      salePrice >= price
    ) {
      return 0;
    }

    return Math.round(
      ((price - salePrice) / price) * 100
    );
  };

  const currentDiscount = calculateDiscount();

  /* ========================================
     ENREGISTREMENT
  ======================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /* Nom */

    if (!form.name.trim()) {
      setError("Veuillez saisir le nom du produit.");
      return;
    }

    /* Prix */

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    /* Stock */

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      setError("Veuillez saisir un stock valide.");
      return;
    }

    /* Image */

    if (!selectedFile) {
      setError(
        "Veuillez sélectionner une image du produit."
      );
      return;
    }

    /* ========================================
       VALIDATION PROMOTION
    ======================================== */

    if (form.onSale) {
      if (
        !form.salePrice ||
        Number(form.salePrice) <= 0
      ) {
        setError(
          "Veuillez saisir un prix promotionnel valide."
        );
        return;
      }

      if (
        Number(form.salePrice) >=
        Number(form.price)
      ) {
        setError(
          "Le prix promotionnel doit être inférieur au prix normal."
        );
        return;
      }
    }

    try {
      setLoading(true);

      /* ========================================
         UPLOAD CLOUDINARY
      ======================================== */

      const cloudinaryUrl =
        await uploadToCloudinary(selectedFile);

      /* ========================================
         DONNÉES DU PRODUIT
      ======================================== */

const productData = {
  name: form.name.trim(),

  category: form.category,

  description: form.description.trim(),

  // Prix actuellement affiché
  price: form.onSale
    ? Number(form.salePrice)
    : Number(form.price),

  // Ancien prix
  oldPrice: form.onSale
    ? Number(form.price)
    : null,

  // Promotion
  promo: Boolean(form.onSale),

  promoPercent: form.onSale
    ? currentDiscount
    : 0,

  stock: Number(form.stock),

  unit: form.unit,

  image: cloudinaryUrl,

  active: true,

  featured: Boolean(form.featured),
};

      /* ========================================
         ENREGISTREMENT
      ======================================== */

      addProduct(productData);

      /* ========================================
         REDIRECTION
      ======================================== */

      navigate("/admin/products");

    } catch (uploadError) {
      console.error(uploadError);

      setError(
        "Une erreur est survenue lors de l'envoi de l'image. Vérifiez votre configuration Cloudinary."
      );

    } finally {
      setLoading(false);
    }
  };

  /* ========================================
     RENDU
  ======================================== */

  return (
    <main className="admin-add-product-page">

      {/* =====================================
          EN-TÊTE
      ===================================== */}

      <section className="admin-add-product-header">

        <div className="container">

          <Link
            to="/admin/products"
            className="admin-back-link"
          >
            ← Retour aux produits
          </Link>

          <span className="admin-add-kicker">
            ADMINISTRATION
          </span>

          <h1>
            Ajouter un produit
          </h1>

          <p>
            Ajoutez un nouveau produit à votre boutique.
          </p>

        </div>

      </section>

      {/* =====================================
          CONTENU
      ===================================== */}

      <section className="admin-add-product-content">

        <div className="container">

          <form
            className="admin-product-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-form-main">

              {/* =====================================
                  INFORMATIONS
              ===================================== */}

              <div className="admin-form-card">

                <h2>
                  Informations du produit
                </h2>

                {/* NOM */}

                <div className="form-group">

                  <label htmlFor="name">
                    Nom du produit *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ex. Piment en poudre"
                  />

                </div>

                {/* CATÉGORIE + UNITÉ */}

                <div className="form-grid">

                  <div className="form-group">

                    <label htmlFor="category">
                      Catégorie *
                    </label>

                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >

                      <option value="Épicerie">
                        Épicerie
                      </option>

                      <option value="Épices">
                        Épices
                      </option>

                      <option value="Condiments">
                        Condiments
                      </option>

                      <option value="Boissons">
                        Boissons
                      </option>

                      <option value="Hygiène">
                        Hygiène
                      </option>

                      <option value="Entretien">
                        Entretien
                      </option>

                      <option value="Autres">
                        Autres
                      </option>

                    </select>

                  </div>

                  <div className="form-group">

                    <label htmlFor="unit">
                      Unité de vente *
                    </label>

                    <select
                      id="unit"
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                    >

                      <option value="unité">
                        Unité
                      </option>

                      <option value="sachet">
                        Sachet
                      </option>

                      <option value="paquet">
                        Paquet
                      </option>

                      <option value="boîte">
                        Boîte
                      </option>

                      <option value="bouteille">
                        Bouteille
                      </option>

                      <option value="kg">
                        Kilogramme
                      </option>

                      <option value="litre">
                        Litre
                      </option>

                    </select>

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div className="form-group">

                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Décrivez le produit..."
                  />

                </div>

                {/* PRODUIT POPULAIRE */}

                <div className="form-group">

                  <label className="checkbox-label">

                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          featured:
                            event.target.checked,
                        }))
                      }
                    />

                    <span>
                      Afficher ce produit dans les produits populaires
                    </span>

                  </label>

                </div>

              </div>

              {/* =====================================
                  PRIX ET STOCK
              ===================================== */}

              <div className="admin-form-card">

                <h2>
                  Prix et stock
                </h2>

                <div className="form-grid">

                  {/* PRIX NORMAL */}

                  <div className="form-group">

                    <label htmlFor="price">
                      Prix de vente *
                    </label>

                    <div className="price-input">

                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="1000"
                      />

                      <span>
                        FCFA
                      </span>

                    </div>

                  </div>

                  {/* STOCK */}

                  <div className="form-group">

                    <label htmlFor="stock">
                      Stock initial *
                    </label>

                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="50"
                    />

                  </div>

                </div>

                {/* =================================
                    PROMOTION
                ================================= */}

                <div className="promotion-admin-box">

                  <label className="checkbox-label promotion-toggle">

                    <input
                      type="checkbox"
                      checked={form.onSale}
                      onChange={handleSaleToggle}
                    />

                    <span>
                      🏷️ Mettre ce produit en promotion
                    </span>

                  </label>

                  {form.onSale && (

                    <div className="promotion-admin-content">

                      <div className="form-group">

                        <label htmlFor="salePrice">
                          Prix promotionnel *
                        </label>

                        <div className="price-input">

                          <input
                            id="salePrice"
                            name="salePrice"
                            type="number"
                            min="0"
                            value={form.salePrice}
                            onChange={handleChange}
                            placeholder="800"
                          />

                          <span>
                            FCFA
                          </span>

                        </div>

                      </div>

                      <div className="promotion-preview">

                        <span>
                          Réduction
                        </span>

                        <strong>
                          {currentDiscount > 0
                            ? `-${currentDiscount}%`
                            : "—"}
                        </strong>

                      </div>

                    </div>

                  )}

                </div>

              </div>

              {/* =====================================
                  IMAGE
              ===================================== */}

              <div className="admin-form-card">

                <h2>
                  Image du produit
                </h2>

                <div className="admin-image-upload">

                  <label
                    htmlFor="image"
                    className="image-upload-zone"
                  >

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt="Aperçu du produit"
                      />

                    ) : (

                      <>
                        <span className="upload-icon">
                          📷
                        </span>

                        <strong>
                          Ajouter une image
                        </strong>

                        <small>
                          Cliquez pour sélectionner une image
                        </small>
                      </>

                    )}

                  </label>

                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />

                </div>

                <p className="image-upload-info">
                  Formats acceptés : JPG, PNG, WEBP.
                  Taille maximale : 5 Mo.
                </p>

              </div>

              {/* =====================================
                  ERREUR
              ===================================== */}

              {error && (

                <div className="admin-form-error">
                  ⚠️ {error}
                </div>

              )}

              {/* =====================================
                  ACTIONS
              ===================================== */}

              <div className="admin-form-actions">

                <Link
                  to="/admin/products"
                  className="admin-cancel-button"
                >
                  Annuler
                </Link>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={loading}
                >

                  {loading
                    ? "☁️ Envoi de l'image..."
                    : "✓ Enregistrer le produit"}

                </button>

              </div>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}

export default AdminAddProduct;