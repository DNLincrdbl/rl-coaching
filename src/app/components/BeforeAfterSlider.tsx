'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function BeforeAfterSlider() {
  const [showBefore, setShowBefore] = useState(true);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
      {/* Main Image */}
      <div className="relative w-full h-full transition-opacity duration-500">
        <Image
          src={showBefore ? "/zoli/front.jpg" : "/zoli/back.jpg"}
          alt={showBefore ? "Előtte" : "Utána"}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={() => setShowBefore(true)}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
            showBefore 
              ? 'bg-green-500 text-white shadow-lg scale-105' 
              : 'bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-700/80 dark:text-white dark:hover:bg-gray-600/90'
          }`}
        >
          Elölről
        </button>
        <button
          onClick={() => setShowBefore(false)}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
            !showBefore 
              ? 'bg-green-500 text-white shadow-lg scale-105' 
              : 'bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-700/80 dark:text-white dark:hover:bg-gray-600/90'
          }`}
        >
          Hátulról
        </button>
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
