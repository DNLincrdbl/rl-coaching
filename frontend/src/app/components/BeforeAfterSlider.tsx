'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function BeforeAfterSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const images = [
    { src: "/zoli/front.jpg", alt: "Előtte" },
    { src: "/zoli/back.jpg", alt: "Utána" }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-slide effect
  useEffect(() => {
    if (!isHovering) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Image with slide animation */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentIndex 
                ? 'translate-x-0' 
                : index < currentIndex 
                  ? '-translate-x-full' 
                  : 'translate-x-full'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        ))}
      </div>

      {/* Arrow Navigation - appears on hover */}
      <button
        onClick={prevSlide}
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={nextSlide}
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <FaChevronRight className="w-4 h-4" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-4' 
                : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* State indicators */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
        Előtte
      </div>
      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
        Utána
      </div>
    </div>
  );
}
