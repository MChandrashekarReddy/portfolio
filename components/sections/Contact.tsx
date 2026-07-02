"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AlertModal } from "@/components/ui/AlertModal";
import { Reveal } from "@/components/ui/Reveal";
import { socialLinks, contactData } from "@/lib/data";

type AlertState = {
  variant: "success" | "warning" | "error";
  title: string;
  message: string;
} | null;

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgveqedv";

const NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const EMAIL_PATTERN =
  /^[a-z]+[a-z0-9-]*(?:\.[a-z0-9-]+)*[a-z0-9-]*@[a-z]+(?:\.[a-z]+)*\.(com|org|net|edu|gov|co|io|ai|info)$/i;

function validateForm(formData: FormData): { isValid: boolean; errorMessage?: string } {
  const validations = [
    { field: "name", pattern: NAME_PATTERN, errorMessage: "Name should contain only letters and spaces." },
    { field: "email", pattern: EMAIL_PATTERN, errorMessage: "Please enter a valid email address." },
    { field: "subject", pattern: NAME_PATTERN, errorMessage: "Subject should contain only letters and spaces." },
    { field: "message", pattern: /.+/, errorMessage: "Please enter a message." },
  ];

  for (const { field, pattern, errorMessage } of validations) {
    const value = formData.get(field) as string;
    if (!value || !pattern.test(value.trim())) {
      return { isValid: false, errorMessage };
    }
  }

  return { isValid: true };
}

function SocialIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "github":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "twitter":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "email":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "medium":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z" />
        </svg>
      );
    default:
      return null;
  }
}

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-transparent text-text-primary placeholder:text-text-secondary focus:outline-none focus-visible:outline-none focus:border-primary transition-colors duration-200";

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const { isValid, errorMessage } = validateForm(formData);
    if (!isValid) {
      setAlert({ variant: "warning", title: "Error", message: errorMessage! });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const data = await response.json();

      if (response.ok && data.ok !== false) {
        form.reset();
        setAlert({
          variant: "success",
          title: "Thank you!",
          message: "Your message has been sent successfully.",
        });
      } else {
        setAlert({
          variant: "error",
          title: "Oops...",
          message: "There was an issue with your submission. Please try again.",
        });
      }
    } catch {
      setAlert({
        variant: "error",
        title: "Oops...",
        message: "There was an error submitting the form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section-padding" id="contact">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            title="Let's build something."
            subtitle="Have a project in mind, want to collaborate, or just want to say hello? I'd love to hear from you."
          />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          {/* Contact info */}
          <Reveal className="flex flex-col h-full justify-between">
            <div className="pb-6 border-b border-border-custom">
              <p className="text-sm text-text-secondary mb-1">My Place:</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${contactData.locationLat},${contactData.locationLng}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lg font-bold text-text-primary hover:text-primary transition-colors duration-200"
              >
                <span className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </span>
                {contactData.location}
              </a>
            </div>

            <div className="pb-6 border-b border-border-custom">
              <p className="text-sm text-text-secondary mb-1">Call me:</p>
              <a
                href={`tel:${contactData.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 text-lg font-bold text-text-primary hover:text-primary transition-colors duration-200"
              >
                <span className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </span>
                {contactData.phone}
              </a>
            </div>

            <div className="pb-6 border-b border-border-custom">
              <p className="text-sm text-text-secondary mb-1">Mail me:</p>
              <a
                href={`mailto:${contactData.email}`}
                className="inline-flex items-center gap-2 text-lg font-bold text-text-primary hover:text-primary transition-colors duration-200 break-all"
              >
                <span className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </span>
                {contactData.email}
              </a>
            </div>

            <div>
              <p className="text-sm text-text-secondary mb-3">Follow me:</p>
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-all duration-200"
                    aria-label={link.name}
                    id={`contact-${link.icon}`}
                  >
                    <SocialIcon icon={link.icon} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Contact form */}
          <Reveal delay={100}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className={fieldClass}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                className={fieldClass}
              />
            </div>
            <input type="text" name="subject" placeholder="Subject" required className={fieldClass} />
            <textarea
              name="message"
              placeholder="Message"
              rows={6}
              required
              className={`${fieldClass} resize-none`}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto sm:self-start disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
          </Reveal>
        </div>
      </div>

      <AlertModal
        open={alert !== null}
        variant={alert?.variant ?? "success"}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        onClose={() => setAlert(null)}
      />
    </section>
  );
}
