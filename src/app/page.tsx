'use client';

import React from 'react';
import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import About from '@/app/components/About';
import Health from '@/app/components/Health';
import Shop from '@/app/components/Shop';
import Contact from '@/app/components/Contact';
import Footer from '@/app/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Add your 3D model component here */}
      {/* <ThreeDModel /> */}
      <Hero />
      <Shop />
      <About />
      <Health />
      <Contact />
      <Footer />
    </>
  );
}