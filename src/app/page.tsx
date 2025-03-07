import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import About from '@/app/components/About';
import Courses from '@/app/components/Courses';
import Contact from '@/app/components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white overflow-hidden">
      <Navbar />
      <Hero />
      <About />
      <Courses />
      <Contact />
    </main>
  );
}
