"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { projects } from "@/lib/data";

export function Projects() {
  return (
    <section className="section-padding" id="projects">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            title="Featured Projects"
            subtitle="A selection of projects that showcase my expertise in AI and full-stack development."
          />
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const openLive = () => {
              if (project.liveUrl) {
                window.open(project.liveUrl, "_blank", "noopener,noreferrer");
              }
            };

            return (
              <Reveal key={project.id} delay={i * 80} className="h-full">
              <Card
                className={`h-full flex flex-col group ${project.liveUrl ? "cursor-pointer" : ""}`}
                role={project.liveUrl ? "link" : undefined}
                tabIndex={project.liveUrl ? 0 : undefined}
                onClick={project.liveUrl ? openLive : undefined}
                onKeyDown={
                  project.liveUrl
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openLive();
                        }
                      }
                    : undefined
                }
              >
              {/* Featured indicator */}
              {project.featured && (
                <div className="flex items-center gap-1.5 mb-3">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-xs font-medium text-primary">Featured</span>
                </div>
              )}

              {/* Title */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-lg font-semibold text-text-primary">
                  {project.title}
                </h3>
                {project.liveUrl && (
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded-full text-primary bg-primary-light group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Role */}
              {project.role && (
                <p className="text-xs font-medium text-primary/80 mb-2">
                  {project.role}
                </p>
              )}

              {/* Description */}
              <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
                {project.description}
              </p>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {project.techStack.map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>

              {/* Actions */}
              {project.githubUrl && (
                <div
                  className="flex items-center gap-3 mt-auto pt-4 border-t border-border-custom"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    href={project.githubUrl}
                    variant="ghost"
                    size="sm"
                    external
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                    Code
                  </Button>
                </div>
              )}
              </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
