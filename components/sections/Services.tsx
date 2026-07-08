import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/lib/data";

function ServiceIcon({ icon }: { icon: string }) {
  const paths: Record<string, string> = {
    code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
    cloud: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
    shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    ai: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
  };

  return (
    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0 mb-5">
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={paths[icon]} />
      </svg>
    </div>
  );
}

export function Services() {
  return (
    <section className="section-padding" id="services">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            title="My Expertise"
            subtitle="From backend logic to cloud infrastructure, here's how I turn requirements into reliable, production-ready systems."
          />
        </Reveal>

        <div className="cards-grid grid sm:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <Reveal
              key={service.id}
              variant={i % 2 === 0 ? "left" : "right"}
              delay={i * 80}
              className="h-full"
            >
              <Card className="h-full flex flex-col">
                <ServiceIcon icon={service.icon} />

                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {service.title}
                </h3>

                <p className="text-sm text-text-secondary leading-relaxed mb-5 flex-1">
                  {service.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {service.techStack.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
