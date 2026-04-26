import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollSection from "@/components/ScrollSection";
import { useAdSense } from "@/hooks/useAdSense";

const Index = () => {
  useAdSense();
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ScrollSection id="services" animation="fade-up">
        <Services />
      </ScrollSection>
      <ScrollSection id="process" animation="fade-up" delay={1}>
        <Process />
      </ScrollSection>
      <ScrollSection id="tech" animation="fade-up" delay={1}>
        <TechStack />
      </ScrollSection>
      <ScrollSection id="contact" animation="fade-up" delay={1}>
        <Contact />
      </ScrollSection>
      <Footer />
    </main>
  );
};

export default Index;
