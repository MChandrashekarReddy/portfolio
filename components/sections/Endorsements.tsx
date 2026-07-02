import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { endorsements } from "@/lib/data";

export function Endorsements() {
  return (
    <section className="section-padding" id="endorsements">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            title="Endorsements"
            subtitle="What colleagues have said about working with me."
          />
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {endorsements.map((person, i) => (
            <Reveal key={person.id} delay={i * 80} className="h-full">
            <Card padding="lg" className="h-full flex flex-col">
              <svg className="w-8 h-8 text-primary/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
              </svg>

              <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-6 flex-1">
                {person.quote}
              </p>

              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 pt-4 border-t border-border-custom group"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border-custom">
                  <Image
                    src={person.photo}
                    alt={person.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {person.name}
                  </p>
                  <p className="text-xs font-medium text-primary">{person.title}</p>
                </div>
              </a>
            </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
