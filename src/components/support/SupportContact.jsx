export default function SupportContact() {
  return (
    <section className="support-contact-section">
      <div className="container">

        <div className="support-contact-card">

          <div className="support-contact-content">

            <span className="support-contact-kicker">
              BESOIN D'ASSISTANCE ?
            </span>

            <h2>
              Notre équipe est là pour vous aider.
            </h2>

            <p>
              Vous ne trouvez pas la réponse à votre question ?
              Contactez-nous directement.
            </p>

          </div>

          <div className="support-contact-actions">

            <a
              href="mailto:support@senepicerie.sn"
              className="support-contact-button support-contact-button-primary"
            >
              ✉️ Envoyer un e-mail
            </a>

            <a
              href="tel:+221000000000"
              className="support-contact-button"
            >
              📞 Nous appeler
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}