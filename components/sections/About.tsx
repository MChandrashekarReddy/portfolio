import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { aboutData, skills } from "@/lib/data";

const categories = ["Backend", "Frontend", "Database", "Cloud", "AI", "Testing", "Tools"] as const;

export function About() {
  return (
    <section className="section-padding" id="about">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            title="About Me"
            subtitle="A Full-Stack Developer focused on building scalable, production-ready systems with a strong foundation in backend engineering, frontend development, and cloud infrastructure."
          />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Bio */}
          <Reveal delay={100} className="space-y-5">
            {aboutData.bio.map((paragraph, i) => (
              <p key={i} className="text-base md:text-lg text-text-secondary leading-relaxed">
                {paragraph}
              </p>
            ))}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="text-center p-4 rounded-xl bg-surface border border-border-custom">
                <div className="text-2xl md:text-3xl font-bold gradient-text">
                  {aboutData.experienceYears}+
                </div>
                <div className="text-xs md:text-sm text-text-secondary mt-1">
                  Years Exp.
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-surface border border-border-custom">
                <div className="text-2xl md:text-3xl font-bold gradient-text">
                  {aboutData.projectsCompleted}+
                </div>
                <div className="text-xs md:text-sm text-text-secondary mt-1">
                  Projects
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-surface border border-border-custom">
                <div className="text-2xl md:text-3xl font-bold gradient-text">
                  {aboutData.infraBuilt}+
                </div>
                <div className="text-xs md:text-sm text-text-secondary mt-1">
                  Infra Built
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-surface border border-border-custom">
                <div className="text-2xl md:text-3xl font-bold gradient-text">
                  {aboutData.happyClients}+
                </div>
                <div className="text-xs md:text-sm text-text-secondary mt-1">
                  Happy Clients
                </div>
              </div>
            </div>
          </Reveal>

          {/* Skills */}
          <Reveal delay={200} className="space-y-6">
            {categories.map((category) => {
              const categorySkills = skills.filter((s) => s.category === category);
              if (categorySkills.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <Badge key={skill.name}>{skill.name}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
