import SupportHero from "../components/support/SupportHero";
import SupportCards from "../components/support/SupportCards";
import SupportFaq from "../components/support/SupportFaq";
import SupportContact from "../components/support/SupportContact";
import SupportBottomCTA from "../components/support/SupportBottomCTA";

import "../styles/Support.css";

export default function Support() {
  return (
    <main className="support-page">
      <SupportHero />
      <SupportCards />
      <SupportFaq />
      <SupportContact />
      <SupportBottomCTA />
    </main>
  );
}