'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ImageSliderProps {
  images: {
    src: string;
    alt: string;
    label: string;
  }[];
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const x = e.clientX - container.left;
    const percentage = Math.min(100, Math.max(0, (x / container.width) * 100));
    setPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - container.left;
    const percentage = Math.min(100, Math.max(0, (x / container.width) * 100));
    setPosition(percentage);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Before Image (Left) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={images[0].src}
          alt={images[0].alt}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
          {images[0].label}
        </div>
      </div>

      {/* After Image (Right) */}
      <div 
        className="absolute inset-0 h-full bg-gray-900 overflow-hidden"
        style={{ width: `${100 - position}%`, left: `${position}%` }}
      >
        <Image
          src={images[1].src}
          alt={images[1].alt}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
          {images[1].label}
        </div>
      </div>

      {/* Divider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white/80 backdrop-blur-sm z-20 shadow-lg"
        style={{ left: `calc(${position}% - 2px)` }}
      >
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-ew-resize shadow-lg"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-700" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7h8m0 0v8m0-8l-4 4m4 4l-4-4m4 4l4-4m-8 4l-4-4" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
