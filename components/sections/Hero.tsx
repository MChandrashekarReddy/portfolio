import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { heroData } from "@/lib/data";

// Modern abstract glowing splash behind the image
const SplashBehind = () => (
  <div className="absolute inset-0 w-full h-full -z-10 flex items-center justify-center">
    {/* Animated glowing orbs acting as a dynamic abstract back-splash */}
    <div className="absolute -top-16 -right-16 w-80 h-80 bg-primary/40 rounded-full blur-[70px] animate-pulse" />
    <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-emerald-500/20 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: "4s" }} />
    <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-secondary/30 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: "5s" }} />
  </div>
);

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-20 md:pb-28"
      id="hero"
    >
      {/* Background effects */}
      <div className="absolute inset-0 hero-grid opacity-40" />
      <div className="hero-glow absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
      <div className="hero-glow absolute bottom-1/3 right-1/4 w-100 h-100 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16">

          {/* Profile Image Container (Left) */}
          <div className="w-72 sm:w-80 md:w-96 lg:w-105 xl:w-120 shrink-0 animate-fade-in-up relative group flex items-center justify-center">
            {/* Splash Background Behind Image */}
            <SplashBehind />

            {/* Image Wrapper - feathered so the photo blends into the background, no border/shadow */}
            <div
              className="relative aspect-square w-full z-10 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              style={{
                maskImage: "radial-gradient(circle, black 55%, transparent 78%)",
                WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 78%)",
              }}
            >
              <Image
                src="/profile.jpg"
                alt={heroData.name}
                fill
                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, (min-width: 768px) 384px, (min-width: 640px) 320px, 288px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Text Content (Right) */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start max-w-2xl">
            {/* Status badge */}
            <div className="animate-fade-in-up mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-primary-light text-primary border border-primary/20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available for opportunities
              </span>
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in-up-delay-1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-2">
              <span className="text-text-primary">{heroData.greeting} </span>
              <br className="hidden md:block lg:hidden" />
              <span className="gradient-text">{heroData.name}</span>
            </h1>

            {/* Title */}
            <div className="animate-fade-in-up-delay-2 mt-4 h-8 md:h-10 flex items-center">
              <TypewriterText 
                lines={[
                  "AI Full-Stack Developer",
                  "AWS Cloud Infrastructure Builder",
                  "Tech-Driven Problem Solver",
                  "Collaborative Engineering Mindset"
                ]}
                className="text-xl md:text-2xl font-medium text-text-secondary"
                pauseDuration={1800}
                typingSpeed={80}
                deletingSpeed={40}
              />
            </div>

            {/* Description */}
            <p className="animate-fade-in-up-delay-2 mt-5 text-base sm:text-lg text-text-secondary w-full leading-relaxed">
              {heroData.description}
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up-delay-3 mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 w-full sm:w-auto">
              <Button href="#projects" size="lg" className="w-full sm:w-auto">
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                See My Work
              </Button>
              <Button href="#contact" variant="secondary" size="lg" className="w-full sm:w-auto">
                Get In Touch
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex justify-center animate-fade-in-up-delay-3 w-full">
          <a
            href="#about"
            className="w-8 h-12 rounded-full border-2 border-border-custom flex items-start justify-center pt-2 hover:border-primary transition-colors"
            aria-label="Scroll to about section"
          >
            <div className="w-1.5 h-3 rounded-full bg-text-secondary animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
