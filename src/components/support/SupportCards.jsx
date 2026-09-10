import { Link } from "react-router-dom";

export default function SupportCards() {
  const cards = [
    {
      icon: "📦",
      title: "Suivre une commande",
      text: "Consultez l'état de votre commande et son évolution.",
      link: "/order-tracking",
      label: "Suivre ma commande",
    },
    {
      icon: "🧾",
      title: "Mes commandes",
      text: "Retrouvez l'historique de toutes vos commandes.",
      link: "/my-orders",
      label: "Voir mes commandes",
    },
    {
      icon: "❓",
      title: "Centre d'aide",
      text: "Consultez les réponses aux questions les plus fréquentes.",
      link: "/help",
      label: "Consulter l'aide",
    },
  ];

  return (
    <section className="support-cards-section">
      <div className="container">

        <div className="support-section-heading">
          <span>ASSISTANCE RAPIDE</span>

          <h2>
            Trouvez rapidement ce que vous cherchez
          </h2>
        </div>

        <div className="support-cards-grid">

          {cards.map((card) => (
            <article
              className="support-card"
              key={card.title}
            >
              <div className="support-card-icon">
                {card.icon}
              </div>

              <h3>
                {card.title}
              </h3>

              <p>
                {card.text}
              </p>

              <Link
                to={card.link}
                className="support-card-link"
              >
                {card.label} →
              </Link>
            </article>
          ))}

        </div>

      </div>
    </section>
  );
}