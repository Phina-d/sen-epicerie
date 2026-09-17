import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  loadProductsFromSupabase,
  updateProduct,
} from "../utils/productsManager";

import { uploadToCloudinary } from "../utils/cloudinaryUpload";

import "../styles/AdminEditProduct.css";

function AdminEditProduct() {
  const { id } = useParams();
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  /* ========================================
     CHARGER LE PRODUIT
  ======================================== */

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
       const products =
  await loadProductsFromSupabase();

const product =
  products.find(
    (item) =>
      String(item.id) ===
      String(id)
  );

        if (!isMounted) {
          return;
        }

        if (!product) {
          setNotFound(true);
          return;
        }

        /*
         * ------------------------------------
         * PRIX / PROMOTION
         * ------------------------------------
         *
         * Dans Supabase :
         *
         * price    = prix actuel
         * oldPrice = ancien prix
         * promo    = promotion active
         *
         * Pour le formulaire :
         *
         * prix normal     = oldPrice si promo
         * prix promotion  = price
         */

        const isPromo =
          product.promo === true &&
          Number(product.oldPrice || 0) >
            Number(product.price || 0);

        setForm({
          name: product.name || "",

          category:
            product.category || "Épicerie",

          description:
            product.description || "",

          /*
           * Le champ price du formulaire
           * représente toujours le prix normal.
           */
          price: isPromo
            ? product.oldPrice
            : product.price ?? "",

          /*
           * Le prix promotionnel est
           * le prix actuel enregistré dans
           * Supabase.
           */
          salePrice: isPromo
            ? product.price
            : "",

          stock:
            product.stock ?? "",

          unit:
            product.unit || "unité",

          image:
            product.image || "",

          featured:
            Boolean(product.featured),

          onSale:
            isPromo,

          discount:
            isPromo
              ? Number(product.promoPercent || 0)
              : 0,
        });

        setImagePreview(
          product.image || ""
        );
      } catch (loadError) {
        console.error(
          "❌ Erreur lors du chargement du produit :",
          loadError
        );

        if (isMounted) {
          setError(
            "Impossible de charger le produit."
          );
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  /* ========================================
     MODIFICATION DES CHAMPS
  ======================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ========================================
     PRODUIT POPULAIRE
  ======================================== */

  const handleFeaturedChange = (event) => {
    setForm((previous) => ({
      ...previous,
      featured: event.target.checked,
    }));
  };

  /* ========================================
     ACTIVATION PROMOTION
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
     CALCUL RÉDUCTION
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

  const currentDiscount =
    calculateDiscount();

  /* ========================================
     IMAGE
  ======================================== */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /* Type */

    if (!file.type.startsWith("image/")) {
      setError(
        "Veuillez sélectionner une image."
      );
      return;
    }

    /* Taille */

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "L'image ne doit pas dépasser 5 Mo."
      );
      return;
    }

    setError("");

    setSelectedFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  /* ========================================
     ENREGISTRER
  ======================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /* =====================================
       NOM
    ===================================== */

    if (!form.name.trim()) {
      setError(
        "Veuillez saisir le nom du produit."
      );
      return;
    }

    /* =====================================
       PRIX
    ===================================== */

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      setError(
        "Veuillez saisir un prix valide."
      );
      return;
    }

    /* =====================================
       STOCK
    ===================================== */

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      setError(
        "Veuillez saisir un stock valide."
      );
      return;
    }

    /* =====================================
       PROMOTION
    ===================================== */

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

      /* =====================================
         IMAGE
      ===================================== */

      let imageUrl = form.image;

      if (selectedFile) {
        imageUrl =
          await uploadToCloudinary(
            selectedFile
          );
      }

      /* =====================================
         DONNÉES DU PRODUIT
      ===================================== */

      const isPromo =
        Boolean(form.onSale);

      const normalPrice =
        Number(form.price);

      const promoPrice =
        Number(form.salePrice);

      const updatedProduct = {
        name: form.name.trim(),

        category: form.category,

        description:
          form.description.trim(),

        /* ==================================
           PRIX CANONIQUE
        ================================== */

        price: isPromo
          ? promoPrice
          : normalPrice,

        oldPrice: isPromo
          ? normalPrice
          : null,

        /* ==================================
           PROMOTION
        ================================== */

        promo: isPromo,

        promoPercent: isPromo
          ? currentDiscount
          : 0,

        /* ==================================
           STOCK
        ================================== */

        stock: Number(form.stock),

        unit: form.unit,

        /* ==================================
           IMAGE
        ================================== */

        image: imageUrl,

        /* ==================================
           PRODUIT ACTIF
        ================================== */

        active: true,

        /* ==================================
           PRODUIT POPULAIRE
        ================================== */

        featured:
          Boolean(form.featured),
      };

      console.log(
        "📦 Produit à modifier :",
        updatedProduct
      );

      /* =====================================
         MISE À JOUR SUPABASE
      ===================================== */

      await updateProduct(
        id,
        updatedProduct
      );

      console.log(
        "✅ Produit modifié avec succès dans Supabase"
      );

      /* =====================================
         REDIRECTION
      ===================================== */

      navigate(
        "/admin/products"
      );

    } catch (updateError) {
      console.error(
        "❌ Erreur lors de la modification du produit :",
        updateError
      );

      setError(
        updateError?.message ||
          "Une erreur est survenue lors de la modification du produit."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ========================================
     PRODUIT INTROUVABLE
  ======================================== */

  if (notFound) {
    return (
      <main className="admin-edit-product-page">

        <div className="container">

          <div className="admin-edit-not-found">

            <div>
              📦
            </div>

            <h1>
              Produit introuvable
            </h1>

            <p>
              Le produit que vous souhaitez
              modifier n'existe pas.
            </p>

            <Link
              to="/admin/products"
              className="admin-back-products-button"
            >
              ← Retour aux produits
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* ========================================
     PAGE
  ======================================== */

  return (
    <main className="admin-edit-product-page">

      {/* =====================================
          EN-TÊTE
      ===================================== */}

      <section
        className="admin-edit-product-header"
      >

        <div className="container">

          <Link
            to="/admin/products"
            className="admin-edit-back-link"
          >
            ← Retour aux produits
          </Link>

          <span className="admin-edit-kicker">
            ADMINISTRATION
          </span>

          <h1>
            Modifier le produit
          </h1>

          <p>
            Modifiez les informations,
            le stock et la promotion du produit.
          </p>

        </div>

      </section>

      {/* =====================================
          FORMULAIRE
      ===================================== */}

      <section
        className="admin-edit-product-content"
      >

        <div className="container">

          <form
            className="admin-edit-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-edit-main">

              {/* =================================
                  INFORMATIONS
              ================================= */}

              <div className="admin-edit-card">

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
                      checked={
                        form.featured
                      }
                      onChange={
                        handleFeaturedChange
                      }
                    />

                    <span>
                      Afficher ce produit
                      dans les produits populaires
                    </span>

                  </label>

                </div>

              </div>

              {/* =================================
                  PRIX / STOCK / PROMOTION
              ================================= */}

              <div className="admin-edit-card">

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
                      Stock *
                    </label>

                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                {/* =================================
                    PROMOTION
                ================================= */}

                <div className="promotion-admin-box">

                  <label
                    className="checkbox-label promotion-toggle"
                  >

                    <input
                      type="checkbox"
                      checked={
                        form.onSale
                      }
                      onChange={
                        handleSaleToggle
                      }
                    />

                    <span>
                      🏷️ Mettre ce produit
                      en promotion
                    </span>

                  </label>

                  {form.onSale && (

                    <div className="promotion-admin-content">

                      {/* PRIX PROMOTIONNEL */}

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
                            value={
                              form.salePrice
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="800"
                          />

                          <span>
                            FCFA
                          </span>

                        </div>

                      </div>

                      {/* APERÇU */}

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

              {/* =================================
                  IMAGE
              ================================= */}

              <div className="admin-edit-card">

                <h2>
                  Image du produit
                </h2>

                <div className="admin-edit-image-upload">

                  <label
                    htmlFor="edit-image"
                    className="edit-image-zone"
                  >

                    {imagePreview ? (

                      <img
                        src={imagePreview}
                        alt={form.name}
                      />

                    ) : (

                      <>
                        <span>
                          📷
                        </span>

                        <strong>
                          Ajouter une image
                        </strong>

                        <small>
                          Cliquez pour sélectionner
                          une image
                        </small>
                      </>

                    )}

                  </label>

                  <input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    hidden
                  />

                </div>

                <p className="edit-image-info">

                  Si vous ne choisissez pas
                  de nouvelle image, l'image actuelle
                  sera conservée.

                </p>

              </div>

              {/* =================================
                  ERREUR
              ================================= */}

              {error && (

                <div className="admin-edit-error">

                  ⚠️ {error}

                </div>

              )}

              {/* =================================
                  ACTIONS
              ================================= */}

              <div className="admin-edit-actions">

                <Link
                  to="/admin/products"
                  className="admin-edit-cancel"
                >
                  Annuler
                </Link>

                <button
                  type="submit"
                  className="admin-edit-save"
                  disabled={loading}
                >

                  {loading
                    ? "☁️ Enregistrement..."
                    : "✓ Enregistrer les modifications"}

                </button>

              </div>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}

export default AdminEditProduct;