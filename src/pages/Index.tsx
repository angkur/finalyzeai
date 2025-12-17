import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AIDemo from "@/components/AIDemo";
import Process from "@/components/Process";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <section id="services">
        <Services />
      </section>
      {user && (
        <section id="demo">
          <AIDemo />
        </section>
      )}
      <section id="process">
        <Process />
      </section>
      <section id="tech">
        <TechStack />
      </section>
      <section id="contact">
        <Contact />
      </section>
      <Footer />
    </main>
  );
};

export default Index;
