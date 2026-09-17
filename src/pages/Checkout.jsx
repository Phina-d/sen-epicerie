import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";

import { supabase } from "../utils/supabaseClient";

import { addNotification } from "../utils/notificationsManager";

import "../styles/Checkout.css";

/* ========================================
   FRAIS DE LIVRAISON
======================================== */

const shippingFees = {
  Dakar: 2000,
  Guediawaye: 2500,
  Pikine: 2500,
  Rufisque: 3000,
  Thies: 5000,
  SaintLouis: 7000,
};


/* ========================================
   PARAMÈTRES DE LA BOUTIQUE
======================================== */

const SETTINGS_STORAGE_KEY =
  "senepicerie_settings";


function getShopSettings() {
  const defaultSettings = {
    shopName: "SENÉPICERIE",
    phone: "77 000 00 00",
    email: "contact@senepicerie.com",
    address: "Dakar, Sénégal",

    currency: "FCFA",

    defaultShipping: 2000,

    wave: true,
    orangeMoney: true,
    cashOnDelivery: true,

    notifications: true,
  };

  const storedSettings =
    localStorage.getItem(
      SETTINGS_STORAGE_KEY
    );

  if (!storedSettings) {
    return defaultSettings;
  }

  try {
    const parsedSettings =
      JSON.parse(storedSettings);

    return {
      ...defaultSettings,
      ...parsedSettings,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la lecture des paramètres :",
      error
    );

    return defaultSettings;
  }
}


/* ========================================
   FORMATAGE PRIX
======================================== */

function formatPrice(
  value,
  currency = "FCFA"
) {
  return `${Number(value || 0).toLocaleString(
    "fr-FR"
  )} ${currency}`;
}


/* ========================================
   CHECKOUT
======================================== */

function Checkout() {
  const navigate = useNavigate();


  /* ======================================
     PARAMÈTRES
  ====================================== */

  const shopSettings =
    getShopSettings();


  /* ======================================
     PANIER
  ====================================== */

  const {
    cart,
    cartTotal,
    clearCart,
  } = useCart();


  /* ======================================
     MOYEN DE PAIEMENT PAR DÉFAUT
  ====================================== */

  const getDefaultPayment = () => {
    if (shopSettings.wave) {
      return "Wave";
    }

    if (shopSettings.orangeMoney) {
      return "Orange Money";
    }

    if (shopSettings.cashOnDelivery) {
      return "Paiement à la livraison";
    }

    return "";
  };


  /* ======================================
     FORMULAIRE
  ====================================== */

  const [form, setForm] = useState({
    firstName: "Vincent",
    lastName: "MENDY",
    phone: "77 000 00 00",
    address: "Keur Massar",
    zone: "Dakar",
    payment: getDefaultPayment(),
  });


  /* ======================================
     ERREUR
  ====================================== */

  const [error, setError] =
    useState("");


  /* ======================================
     TRAITEMENT
  ====================================== */

  const [processing, setProcessing] =
    useState(false);


  /* ======================================
     FRAIS DE LIVRAISON
  ====================================== */

  const shipping = cart.length
    ? shippingFees[form.zone] ??
      Number(
        shopSettings.defaultShipping || 2000
      )
    : 0;


  /* ======================================
     TOTAL
  ====================================== */

  const grandTotal =
    Number(cartTotal || 0) +
    Number(shipping || 0);


  /* ======================================
     MOYENS DE PAIEMENT
  ====================================== */

  const paymentOptions = [
    {
      value: "Wave",
      label: "Wave",
      icon: "💙",
      enabled: Boolean(
        shopSettings.wave
      ),
    },

    {
      value: "Orange Money",
      label: "Orange Money",
      icon: "🟠",
      enabled: Boolean(
        shopSettings.orangeMoney
      ),
    },

    {
      value:
        "Paiement à la livraison",

      label:
        "Paiement à la livraison",

      icon: "💵",

      enabled: Boolean(
        shopSettings.cashOnDelivery
      ),
    },
  ];


  const availablePayments =
    paymentOptions.filter(
      (payment) => payment.enabled
    );


  const noPaymentAvailable =
    availablePayments.length === 0;


  /* ======================================
     CHANGEMENT DU FORMULAIRE
  ====================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };


  /* ======================================
     ENREGISTRER LA COMMANDE
     
     IMPORTANT :
     Le stock, orders et sales sont
     maintenant gérés par Supabase
     dans UNE transaction atomique.
  ====================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (processing) {
      return;
    }

    setError("");
    setProcessing(true);


    try {

      /* ====================================
         INFORMATIONS CLIENT
      ==================================== */

      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.phone.trim() ||
        !form.address.trim()
      ) {
        setError(
          "Veuillez remplir tous les champs obligatoires."
        );

        setProcessing(false);

        return;
      }


      /* ====================================
         PANIER
      ==================================== */

      if (!cart.length) {
        setError(
          "Votre panier est vide."
        );

        setProcessing(false);

        return;
      }


      /* ====================================
         PAIEMENT
      ==================================== */

      if (noPaymentAvailable) {
        setError(
          "Aucun mode de paiement n'est actuellement disponible. Veuillez contacter la boutique."
        );

        setProcessing(false);

        return;
      }


      /* ====================================
         VÉRIFIER LE PAIEMENT
      ==================================== */

      const selectedPayment =
        availablePayments.find(
          (payment) =>
            payment.value ===
            form.payment
        );


      if (!selectedPayment) {
        setError(
          "Veuillez sélectionner un mode de paiement disponible."
        );

        setProcessing(false);

        return;
      }


      /* ====================================
         ID + DATE
      ==================================== */

      const orderId =
        `CMD-${Date.now()}`;

      const orderDate =
        new Date().toISOString();


      /* ====================================
         DONNÉES DE LA COMMANDE
         
         IMPORTANT :
         Le prix envoyé ici sert seulement
         de donnée initiale.
         
         La fonction SQL vérifie elle-même
         le vrai prix dans Supabase.
      ==================================== */

      const order = {
        id: orderId,

        date: orderDate,

        customer: {
          firstName:
            form.firstName.trim(),

          lastName:
            form.lastName.trim(),

          phone:
            form.phone.trim(),

          address:
            form.address.trim(),

          zone:
            form.zone,
        },

        payment:
          form.payment,

        items: cart.map(
          (item) => ({
            id: item.id,

            productId:
              item.id,

            name:
              item.name,

            price:
              Number(
                item.price || 0
              ),

            quantity:
              Number(
                item.quantity || 0
              ),

            unit:
              item.unit ||
              "unité",

            image:
              item.image || "",
          })
        ),

        subtotal:
          Number(
            cartTotal || 0
          ),

        shipping:
          Number(
            shipping || 0
          ),

        total:
          Number(
            grandTotal || 0
          ),

        status:
          "En attente",
      };


      /* ====================================
         TRANSACTION ATOMIQUE SUPABASE
         
         Cette seule fonction réalise :
         
         1. Vérification des produits
         2. Vérification du stock
         3. Verrouillage des produits
         4. Diminution du stock
         5. Création de orders
         6. Création de sales
         
         Si une étape échoue :
         TOUT est annulé.
      ==================================== */

      console.log(
        "📤 Envoi de la commande à Supabase :",
        order
      );


      const {
        data,
        error: rpcError,
      } = await supabase.rpc(
        "create_order_atomic",
        {
          p_order: order,
        }
      );


      /* ====================================
         ERREUR SUPABASE
      ==================================== */

      if (rpcError) {
        console.error(
          "❌ Erreur transactionnelle Supabase :",
          rpcError
        );

        throw rpcError;
      }


      /* ====================================
         VÉRIFICATION DU RÉSULTAT
      ==================================== */

      if (
        !data ||
        data.success !== true ||
        !data.order
      ) {
        console.error(
          "❌ Réponse invalide de create_order_atomic :",
          data
        );

        throw new Error(
          data?.message ||
            "La commande n'a pas pu être enregistrée."
        );
      }


      /* ====================================
         COMMANDE RÉELLEMENT ENREGISTRÉE
      ==================================== */

      const savedOrder =
        data.order;


      console.log(
        "✅ Commande enregistrée atomiquement :",
        savedOrder
      );


      /* ====================================
         NOTIFICATION ADMIN
      ==================================== */

      if (
        shopSettings.notifications
      ) {
        try {

          addNotification({
            type:
              "order",

            title:
              "Nouvelle commande",

            message:
              `La commande ${savedOrder.id} de ${savedOrder.customer?.firstName || form.firstName.trim()} ${savedOrder.customer?.lastName || form.lastName.trim()} vient d'être enregistrée.`,

            orderId:
              savedOrder.id,
          });

        } catch (
          notificationError
        ) {

          console.error(
            "⚠️ Impossible d'ajouter la notification :",
            notificationError
          );

        }
      }


      /* ====================================
         INFORMER LES AUTRES PAGES
         
         Les données viennent maintenant
         directement de Supabase.
      ==================================== */

      window.dispatchEvent(
        new Event(
          "ordersUpdated"
        )
      );

      window.dispatchEvent(
        new Event(
          "salesUpdated"
        )
      );

      window.dispatchEvent(
        new Event(
          "productsUpdated"
        )
      );


      /* ====================================
         VIDER LE PANIER
      ==================================== */

      clearCart();


      /* ====================================
         REDIRECTION
      ==================================== */

      navigate(
        `/order/${savedOrder.id}`,
        {
          state: {
            order: savedOrder,
          },
        }
      );


    } catch (submitError) {

      console.error(
        "❌ Erreur lors de la validation de la commande :",
        submitError
      );


      let message =
        submitError?.message ||
        "Une erreur est survenue lors de l'enregistrement de la commande. Veuillez réessayer.";


      /*
        Nettoyage de quelques messages
        techniques Supabase pour afficher
        quelque chose de plus compréhensible.
      */

      if (
        message.includes(
          "Stock insuffisant"
        )
      ) {
        // On conserve le message
        // envoyé par PostgreSQL.
      } else if (
        message.includes(
          "Produit introuvable"
        )
      ) {
        // Même chose.
      }


      setError(message);

      setProcessing(false);
    }
  };


  /* ========================================
     PANIER VIDE
  ======================================== */

  if (!cart.length) {
    return (
      <main className="checkout-page">

        <div className="container">

          <div className="empty-checkout">

            <div>
              🛒
            </div>

            <h1>
              Votre panier est vide
            </h1>

            <p>
              Ajoutez des produits avant
              de passer votre commande.
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
     RENDU PRINCIPAL
  ======================================== */

  return (
    <main className="checkout-page">

      <div className="container">

        {/* ==================================
            HEADER
        ================================== */}

        <div className="checkout-header">

          <span>
            {shopSettings.shopName ||
              "SENÉPICERIE"}
          </span>

          <h1>
            Finaliser ma commande
          </h1>

          <p>
            Renseignez vos informations
            pour recevoir votre commande.
          </p>

        </div>


        {/* ==================================
            FORMULAIRE
        ================================== */}

        <form
          className="checkout-layout"
          onSubmit={handleSubmit}
        >

          <section className="checkout-form">

            {/* ==============================
                INFORMATIONS CLIENT
            ============================== */}

            <div className="checkout-card">

              <h2>
                👤 Informations client
              </h2>

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="firstName">
                    Prénom *
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    value={
                      form.firstName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Votre prénom"
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="lastName">
                    Nom *
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    value={
                      form.lastName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Votre nom"
                  />

                </div>

              </div>


              <div className="form-group">

                <label htmlFor="phone">
                  Téléphone *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="77 000 00 00"
                />

              </div>


              <div className="form-group">

                <label htmlFor="address">
                  Adresse de livraison *
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={
                    form.address
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Quartier, rue, repère..."
                />

              </div>

            </div>


            {/* ==============================
                LIVRAISON
            ============================== */}

            <div className="checkout-card">

              <h2>
                📍 Livraison
              </h2>

              <div className="form-group">

                <label htmlFor="zone">
                  Zone de livraison
                </label>

                <select
                  id="zone"
                  name="zone"
                  value={
                    form.zone
                  }
                  onChange={
                    handleChange
                  }
                >

                  {Object.entries(
                    shippingFees
                  ).map(
                    ([zone, fee]) => (

                      <option
                        key={zone}
                        value={zone}
                      >
                        {zone} —{" "}
                        {formatPrice(
                          fee,
                          shopSettings.currency
                        )}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>


            {/* ==============================
                PAIEMENT
            ============================== */}

            <div className="checkout-card">

              <h2>
                💳 Mode de paiement
              </h2>

              {noPaymentAvailable ? (

                <div className="checkout-error">

                  ⚠️ Aucun mode de paiement
                  n'est actuellement disponible.

                </div>

              ) : (

                <div className="payment-options">

                  {availablePayments.map(
                    (payment) => (

                      <label
                        key={
                          payment.value
                        }
                        className={
                          form.payment ===
                          payment.value
                            ? "payment-option selected"
                            : "payment-option"
                        }
                      >

                        <input
                          type="radio"
                          name="payment"
                          value={
                            payment.value
                          }
                          checked={
                            form.payment ===
                            payment.value
                          }
                          onChange={
                            handleChange
                          }
                        />

                        <span>
                          {
                            payment.icon
                          }
                        </span>

                        <strong>
                          {
                            payment.label
                          }
                        </strong>

                      </label>

                    )
                  )}

                </div>

              )}

            </div>


            {/* ==============================
                ERREUR
            ============================== */}

            {error && (

              <div className="checkout-error">

                ⚠️ {error}

              </div>

            )}

          </section>


          {/* ==================================
              RÉSUMÉ
          ================================== */}

          <aside className="checkout-summary">

            <h2>
              Votre commande
            </h2>


            {/* ==============================
                PRODUITS
            ============================== */}

            <div className="checkout-products">

              {cart.map(
                (item) => (

                  <div
                    className="checkout-product"
                    key={item.id}
                  >

                    <div>

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.quantity} ×{" "}
                        {formatPrice(
                          item.price,
                          shopSettings.currency
                        )}
                      </span>

                    </div>


                    <strong>
                      {formatPrice(
                        Number(
                          item.price || 0
                        ) *
                          Number(
                            item.quantity ||
                              0
                          ),
                        shopSettings.currency
                      )}
                    </strong>

                  </div>

                )
              )}

            </div>


            {/* ==============================
                SOUS-TOTAL
            ============================== */}

            <div className="checkout-total-line">

              <span>
                Sous-total
              </span>

              <strong>
                {formatPrice(
                  cartTotal,
                  shopSettings.currency
                )}
              </strong>

            </div>


            {/* ==============================
                LIVRAISON
            ============================== */}

            <div className="checkout-total-line">

              <span>
                Livraison
              </span>

              <strong>
                {formatPrice(
                  shipping,
                  shopSettings.currency
                )}
              </strong>

            </div>


            {/* ==============================
                TOTAL
            ============================== */}

            <div className="checkout-grand-total">

              <span>
                Total
              </span>

              <strong>
                {formatPrice(
                  grandTotal,
                  shopSettings.currency
                )}
              </strong>

            </div>


            {/* ==============================
                BOUTON
            ============================== */}

            <button
              type="submit"
              className="place-order-button"
              disabled={
                noPaymentAvailable ||
                processing
              }
            >

              {processing
                ? "Enregistrement..."
                : noPaymentAvailable
                ? "Paiement indisponible"
                : "Confirmer la commande"}

            </button>


            {/* ==============================
                RETOUR PANIER
            ============================== */}

            <Link
              to="/cart"
              className="back-cart"
            >
              ← Modifier mon panier
            </Link>

          </aside>

        </form>

      </div>

    </main>
  );
}


export default Checkout;