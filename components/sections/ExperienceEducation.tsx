"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { experience, education } from "@/lib/data";

type Tab = "experience" | "education";

export function ExperienceEducation() {
  const [tab, setTab] = useState<Tab>("experience");

  return (
    <section className="section-padding" id="experience-education">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      <Reveal>
        <SectionHeading
          title="Experience & Education"
          subtitle="My professional journey and the education that built the foundation for it."
        />
      </Reveal>

      {/* Tab switcher */}
      <Reveal delay={100} className="flex justify-center mb-8">
        <div className="flex w-full max-w-md p-1 rounded-xl bg-surface border border-border-custom">
          {(["experience", "education"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-5 py-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Experience */}
      {tab === "experience" && (
        <div className="space-y-5">
          {experience.map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              <Card>
                <span className="text-xs font-medium text-primary">{item.duration}</span>
                <h3 className="text-lg font-semibold text-text-primary mt-1">{item.role}</h3>
                <p className="text-sm font-medium text-text-secondary">{item.company}</p>
                <p className="text-sm text-text-secondary leading-relaxed mt-3">
                  {item.description}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      )}

      {/* Education */}
      {tab === "education" && (
        <div className="space-y-5">
          {education.map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              <Card>
                <span className="text-xs font-medium text-primary">{item.duration}</span>
                <h3 className="text-lg font-semibold text-text-primary mt-1">{item.degree}</h3>
                <p className="text-sm font-medium text-text-secondary">{item.institution}</p>
                {item.detail && (
                  <p className="text-sm text-text-secondary leading-relaxed mt-3">
                    {item.detail}
                  </p>
                )}
                {item.skills && (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {item.skills.map((skill) => (
                      <li
                        key={skill}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </Reveal>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
