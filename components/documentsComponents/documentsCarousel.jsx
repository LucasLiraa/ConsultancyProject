import React, { useRef, useEffect } from "react";
import '../styles/documentsStyles/documentsCarousel.css';

function DocumentsCarousel({ items }) {
  const carouselRef = useRef(null);
  const repeatedItems = [...items, ...items, ...items];

  const scroll = (direction) => {
    const scrollAmount = 160;
    carouselRef.current?.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const { current } = carouselRef;
    if (current) {
      const totalWidth = current.scrollWidth;
      const visibleWidth = current.offsetWidth;
      const center = (totalWidth - visibleWidth) / 2;
      current.scrollLeft = center;
    }
  }, []);

  const handleScroll = () => {
    const current = carouselRef.current;
    if (!current) return;

    const scrollLeft = current.scrollLeft;
    const totalWidth = current.scrollWidth;
    const visibleWidth = current.offsetWidth;
    const center = (totalWidth - visibleWidth) / 2;
    const threshold = 200;

    if (scrollLeft < threshold || scrollLeft > totalWidth - visibleWidth - threshold) {
      current.scrollLeft = center;
    }
  };

  return (
    <div className="containerCarousel">
      <button className="documentsCarouselArrow left" onClick={() => scroll("left")}>
        &#8249;
      </button>
      <div className="contentCarousel" ref={carouselRef} onScroll={handleScroll}>
        {repeatedItems.map((item, index) => (
          <div className="documentsCarouselItem" key={index}>
            <img src={item.preview} alt={item.title} className="documentsCarouselPreview" />
            <div className="overlay" />
            <p className="documentsCarouselTitle">{item.title}</p>
            <div className="buttonGroup">
                <button className="fillButton">Preencher</button>
                <button className="viewButton">Visualizar</button>
            </div>
          </div>
        ))}
      </div>
      <button className="documentsCarouselArrow right" onClick={() => scroll("right")}>
        &#8250;
      </button>
    </div>
  );
}

export default DocumentsCarousel;
