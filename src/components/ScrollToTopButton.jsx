import { useEffect, useState } from "react";

import "../styles/ScrollToTopButton.css";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      className="scroll-to-top"
      onClick={handleScrollToTop}
      aria-label="Retour en haut"
      title="Retour en haut"
    >
      ↑
    </button>
  );
}

export default ScrollToTopButton;