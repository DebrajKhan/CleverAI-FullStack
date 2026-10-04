"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { AntigravityCard } from "@/components/dashboard/HeroMetrics";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500"] });

function StackedImageCarousel() {
  const [frontIndex, setFrontIndex] = useState(0);
  const images = ['/images_1.jpeg', '/images_2.jpeg', '/images_3.jpg', '/images_4.jpeg'];

  const handleClick = () => {
    setFrontIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center cursor-pointer" onClick={handleClick}>
      {images.map((src, i) => {
        const offset = (i - frontIndex + images.length) % images.length;
        return (
          <motion.img
            key={src}
            src={src}
            animate={{
              scale: 1 - offset * 0.05,
              y: offset * 20,
              zIndex: images.length - offset,
              opacity: 1 - offset * 0.2,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute w-3/4 h-3/4 object-cover rounded-3xl shadow-2xl border border-slate-200 bg-slate-100"
          />
        );
      })}
    </div>
  );
}

function InteractiveReviewCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const REVIEWS = [
    {
      name: "Rohan D.",
      role: "High School Student",
      content: "The 12th Standard percentage tracking is incredibly accurate. It identified exactly where my physics concepts were weak and pushed the right mock tests.",
      rating: 5,
      image: "/people_1.jpeg"
    },
    {
      name: "Priya S.",
      role: "College Freshman",
      content: "I was failing Calculus until the multimodal intervention stepped in. The way it breaks down misconceptions instead of just marking 'wrong' changed everything.",
      rating: 5,
      image: "/people_2.jpeg"
    },
    {
      name: "Amit K.",
      role: "Final Year B.Tech",
      content: "The mock interview prep feature is top tier. The active focus card literally kept me accountable every single day until I cleared my placement rounds.",
      rating: 5,
      image: "/people_3.jpeg"
    }
  ];

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % REVIEWS.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);

  const activeReview = REVIEWS[activeIndex];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center mt-8">
      <div className="flex gap-1 mb-8">
        {[...Array(activeReview.rating)].map((_, j) => (
          <Star key={j} className="w-5 h-5 fill-slate-900 text-slate-900" />
        ))}
      </div>
      
      {/* Top: Quote */}
      <div className="h-48 md:h-32 flex items-center justify-center relative w-full px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-xl md:text-2xl text-slate-800 leading-relaxed font-medium absolute w-full"
          >
            "{activeReview.content}"
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Middle: Name & Role */}
      <div className="mt-8 mb-12 h-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-bold text-slate-900 text-lg">{activeReview.name}</p>
            <p className="text-slate-500">{activeReview.role}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: Avatars & Controls */}
      <div className="flex items-center gap-8">
        <button onClick={handlePrev} className="p-3 rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>

        <div className="flex items-center gap-6">
          {REVIEWS.map((review, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button key={idx} onClick={() => setActiveIndex(idx)} className="relative focus:outline-none flex items-center justify-center w-16 h-16">
                <img 
                  src={review.image} 
                  alt={review.name}
                  className={`w-full h-full rounded-full object-cover transition-all duration-500 ${
                    isActive 
                      ? "scale-110 opacity-100 grayscale-0 ring-2 ring-indigo-500 ring-offset-4" 
                      : "scale-90 opacity-50 grayscale hover:grayscale-0 hover:opacity-75"
                  }`} 
                />
              </button>
            );
          })}
        </div>

        <button onClick={handleNext} className="p-3 rounded-full hover:bg-slate-100 transition-colors focus:outline-none">
          <ChevronRight className="w-6 h-6 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* A. Header (Sticky Nav) */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <BookOpen className="w-6 h-6 text-slate-900" />
              <Sparkles className="w-3 h-3 text-indigo-500 absolute -top-1 -right-2" />
            </div>
            <span className="font-bold text-xl tracking-tight">CleverBook</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">Home</Link>
            <Link href="#about-us" className="text-slate-500 hover:text-slate-900 transition-colors">About Us</Link>
            <Link href="#features" className="text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
          </nav>
          
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">Sign In</Link>
            <Link href="/onboarding" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* B. Hero Section */}
      <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-6 py-20 relative">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-3xl"
        >
          <div className="w-screen overflow-hidden mb-8 relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw]">
            <motion.div 
              className="flex whitespace-nowrap text-5xl md:text-7xl tracking-tight text-slate-900 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
            >
              {[0, 1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="flex items-center gap-x-4 px-4">
                  <span className={`${playfair.className} font-normal`}>Welcome</span>
                  <span className={`${playfair.className} font-medium`}>to</span>
                  <span className="font-extrabold">CleverBook</span>
                  <span className="text-slate-400 mx-4">•</span>
                </div>
              ))}
            </motion.div>
          </div>
          <motion.p variants={fadeUpVariant} className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your personalized AI learning environment. We diagnose the root of your cognitive misconceptions and adapt to your unique educational background, ensuring every study session is hyper-focused and ruthlessly effective.
          </motion.p>
          <motion.div variants={fadeUpVariant}>
            <Link href="/onboarding" className="inline-block bg-slate-900 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Get Started for Free
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* C. About Us Section */}
      <section id="about-us" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-6">
              <motion.h2 variants={fadeUpVariant} className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                About Us
              </motion.h2>
              <motion.p variants={fadeUpVariant} className="text-slate-600 text-lg leading-relaxed">
                Education isn't a one-size-fits-all conveyor belt. Traditional platforms just mark your answers wrong and move on. CleverBook is built differently. We believe in identifying the underlying cognitive misconceptions that lead to mistakes.
              </motion.p>
              <motion.p variants={fadeUpVariant} className="text-slate-600 text-lg leading-relaxed">
                Whether you're struggling with Calculus derivatives or perfecting your Mock Interviews, our multimodal intervention system dynamically adjusts. It's like having a world-class tutor sitting right beside you.
              </motion.p>
            </div>
            <motion.div variants={fadeUpVariant} className="relative">
              <StackedImageCarousel />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* D. Features Provided Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Features Provided</h2>
            <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">Everything you need to accelerate your learning and retain information permanently.</p>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeUpVariant}>
              <AntigravityCard className="h-full">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Multimodal Intervention</h3>
                <p className="text-slate-600 leading-relaxed">Video, text, and interactive assessments adapt to your exact learning style when you hit a roadblock.</p>
              </AntigravityCard>
            </motion.div>
            
            <motion.div variants={fadeUpVariant}>
              <AntigravityCard className="h-full">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Coverage</h3>
                <p className="text-slate-600 leading-relaxed">Watch your syllabus completion automatically tick up as you clear topics. Never lose track of your progress again.</p>
              </AntigravityCard>
            </motion.div>
            
            <motion.div variants={fadeUpVariant}>
              <AntigravityCard className="h-full">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Star className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Adaptive Assessments</h3>
                <p className="text-slate-600 leading-relaxed">Questions that scale in difficulty. Master the basics, then get challenged to prove your 100% retention.</p>
              </AntigravityCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* E. People's Review (Testimonials) */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">People's Review</h2>
          </motion.div>

          <InteractiveReviewCarousel />
        </div>
      </section>

      {/* F. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-300" />
            <span className="font-bold text-slate-200 text-base">CleverBook</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div>
            © 2026 CleverBook. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
