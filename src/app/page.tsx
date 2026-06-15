"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Partners from "@/components/home/Partners";
import Services from "@/components/home/Services";
import Portfolio from "@/components/home/Portfolio";
import Testimonials from "@/components/home/Testimonials";
import Leadership from "@/components/home/Leadership";
import Experts from "@/components/home/Experts";
import Contact from "@/components/home/Contact";
import LeadChatbot from "@/components/LeadChatbot";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main>
        <Hero onStartProject={() => setChatOpen(true)} />
        <Partners />
        <Services />
        <Portfolio />
        <Testimonials />
        <Leadership />
        <Experts />
        <Contact />
      </main>
      <Footer />
      <LeadChatbot open={chatOpen} setOpen={setChatOpen} />
    </>
  );
}
