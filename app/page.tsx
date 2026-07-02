import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { ExperienceEducation } from "@/components/sections/ExperienceEducation";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { AIAgents } from "@/components/sections/AIAgents";
import { Writing } from "@/components/sections/Writing";
import { Endorsements } from "@/components/sections/Endorsements";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <div className="section-divider" />
        <About />
        <div className="section-divider" />
        <ExperienceEducation />
        <div className="section-divider" />
        <Services />
        <div className="section-divider" />
        <Projects />
        <div className="section-divider" />
        <AIAgents />
        <div className="section-divider" />
        <Writing />
        <div className="section-divider" />
        <Endorsements />
        <div className="section-divider" />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
