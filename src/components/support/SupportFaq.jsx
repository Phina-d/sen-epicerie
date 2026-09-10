import { useState } from "react";

export default function SupportFaq() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      question: "Comment passer une commande ?",
      answer:
        "Choisissez vos produits, ajoutez-les au panier puis rendez-vous sur la page de commande pour renseigner vos informations et sélectionner votre mode de paiement.",
    },
    {
      question: "Quels sont les modes de paiement disponibles ?",
      answer:
        "SENÉPICERIE propose notamment le paiement par Wave, Orange Money et le paiement à la livraison.",
    },
    {
      question: "Comment suivre ma commande ?",
      answer:
        "Vous pouvez suivre votre commande depuis la page « Suivre une commande » avec les informations de votre commande.",
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer:
        "Les délais peuvent varier selon votre zone de livraison et la disponibilité des produits.",
    },
    {
      question: "Puis-je annuler une commande ?",
      answer:
        "Une annulation peut être possible selon l'état de traitement de votre commande. Contactez rapidement notre support pour vérifier votre situation.",
    },
  ];

  const toggleFaq = (index) => {
    setOpen(open === index ? null : index);
  };

  return (
    <section className="support-faq-section">
      <div className="container">

        <div className="support-section-heading">
          <span>QUESTIONS FRÉQUENTES</span>

          <h2>
            Les réponses aux questions courantes
          </h2>
        </div>

        <div className="support-faq-list">

          {faqs.map((faq, index) => (
            <div
              className={`support-faq-item ${
                open === index ? "is-open" : ""
              }`}
              key={faq.question}
            >

              <button
                type="button"
                className="support-faq-question"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>

                <span className="support-faq-icon">
                  {open === index ? "−" : "+"}
                </span>
              </button>

              {open === index && (
                <div className="support-faq-answer">
                  <p>
                    {faq.answer}
                  </p>
                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}