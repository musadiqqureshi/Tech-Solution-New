"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Partners from "@/components/home/Partners";
import Services from "@/components/home/Services";
import HowItWorks from "@/components/home/HowItWorks";
import Portfolio from "@/components/home/Portfolio";
import Testimonials from "@/components/home/Testimonials";
import Leadership from "@/components/home/Leadership";
import Experts from "@/components/home/Experts";
import Faq from "@/components/home/Faq";
import Contact from "@/components/home/Contact";
import TechSolutionsAI from "@/components/TechSolutionsAI";

export default function Home() {
  const goContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <Navbar />
      <main>
        <Hero onStartProject={goContact} />
        <Partners />
        <Services />
        <div className="section-alt"><HowItWorks /></div>
        <Portfolio />
        <div className="section-alt"><Testimonials /></div>
        <Leadership />
        <div className="section-alt"><Experts /></div>
        <Faq />
        <Contact />
      </main>
      <Footer />
      <TechSolutionsAI />
    </>
  );
}
