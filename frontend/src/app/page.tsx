import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import About from '@/app/components/About';
import Health from '@/app/components/Health';
import Shop from '@/app/components/Shop';
import Pricing from '@/app/components/Pricing';
import CourseBand from '@/app/components/CourseBand';
import Contact from '@/app/components/Contact';
import Footer from '@/app/components/Footer';

export default function Home() {
  return (
    <div className="relative text-white">
      <Navbar />
      <Hero />
      <Pricing />
      <CourseBand />
      <Shop />
      <About />
      <Health />
      <Contact />
      <Footer />
    </div>
  );
}
