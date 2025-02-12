import React, { useState, useEffect, useRef } from 'react';

const ArticleCard = ({ article, onViewMore }) => {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageRef = useRef(null);

  // Update the height dynamically on window resize
  useEffect(() => {
    const updateHeight = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Ensure image fully loads
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <div 
      className="relative w-full snap-start overflow-hidden rounded-lg shadow-lg"
      style={{ height: `${windowHeight}px` }} // Dynamically adjust height
    >
      {article.thumbnail ? (
        <>
          {/* Background Blur for Short Images */}
          <div
            className={`absolute inset-0 bg-center bg-cover filter blur-xl scale-110 transition-opacity duration-500 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
            style={{ backgroundImage: `url(${article.thumbnail.source})` }}
          ></div>

          {/* Main Image */}
          <img
            ref={imageRef}
            src={article.thumbnail.source}
            alt={article.title}
            onLoad={handleImageLoad}
            className="w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: isImageLoaded ? 1 : 0 }} // Fade-in effect
          />
        </>
      ) : (
        <div className="w-full h-full bg-gray-800"></div>
      )}

      {/* **Gradient Overlay for Readability** */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

      {/* **Text Overlay Centered at the Bottom** */}
      <div className="absolute bottom-6 left-6 right-6 text-white text-center">
        <h2 className="text-2xl font-semibold leading-tight">{article.title}</h2>
        <p className="mt-2 text-sm opacity-90">
          {article.extract.length > 150 ? article.extract.slice(0, 150) + '...' : article.extract}
        </p>
        <button
          onClick={onViewMore}
          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          View More
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;