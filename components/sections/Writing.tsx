import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { writing, socialLinks } from "@/lib/data";

export function Writing() {
  const mediumUrl = socialLinks.find((link) => link.name === "Medium")?.url;

  return (
    <section className="section-padding" id="blogs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            title="Blogs & Insights"
            subtitle="Deep dives into AWS infrastructure, DevOps practices, and the engineering problems I've run into building production systems."
          />
        </Reveal>

        {mediumUrl && (
          <div className="flex justify-end mb-4">
            <a
              href={mediumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
            >
              View all blogs
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}

        <div className="space-y-6">
          {writing.map((post, i) => (
            <Reveal key={post.id} delay={i * 80}>
            <Card padding="lg" className="group">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                {post.date} · {post.readTime}
              </span>

              <h3 className="text-xl md:text-2xl font-semibold text-text-primary mt-2 mb-3">
                {post.title}
              </h3>

              <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-5">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-custom">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all whitespace-nowrap"
                >
                  Read on Medium
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
