"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { EDUCATION_TOPICS, CATEGORY_COLORS } from "@/lib/data/education";
import { Card, CardTitle } from "@/components/ui/Card";
import { ArrowLeft, ArrowRight, Clock, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";

export function TopicDetail({ topicId }: { topicId: string }) {
  const topic = EDUCATION_TOPICS.find((t) => t.id === topicId);
  if (!topic) return notFound();
  const color = CATEGORY_COLORS[topic.category];
  const related = (topic.relatedIds ?? [])
    .map((id) => EDUCATION_TOPICS.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-8">
      {/* Back link aligned with content */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-white mb-8"
      >
        <ArrowLeft size={16} /> Back to Learn
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
            style={{ color, background: `${color}22` }}
          >
            {topic.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Clock size={12} /> {topic.readMinutes} min read
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
          {topic.title}
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">{topic.summary}</p>
      </div>

      {/* Hero numbers (examples) */}
      {topic.examples && topic.examples.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {topic.examples.map((e, i) => (
            <Card key={i} className="!p-4">
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">{e.label}</div>
              <div className="text-lg font-bold" style={{ color }}>{e.value}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Body */}
      <Card glow className="mb-6">
        <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed text-[15px]">
          {topic.body
            .split(/\n\n+/)
            .map((para, i) => {
              const lines = para.split("\n").filter((l) => l.trim());
              const isBulletList = lines.every((l) => l.trim().startsWith("•") || l.trim().startsWith("-"));
              if (isBulletList && lines.length > 1) {
                return (
                  <ul key={i} className="space-y-2 pl-1">
                    {lines.map((l, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <span className="text-[var(--green)] mt-1.5 w-1 h-1 rounded-full bg-[var(--green)] shrink-0" />
                        <span>{l.replace(/^[•\-]\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i}>
                  {para.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
                    seg.startsWith("**") && seg.endsWith("**") ? (
                      <strong key={j} className="text-white font-semibold">{seg.slice(2, -2)}</strong>
                    ) : (
                      <span key={j}>{seg}</span>
                    )
                  )}
                </p>
              );
            })}
        </div>
      </Card>

      {/* Key takeaways */}
      {topic.keyTakeaways && topic.keyTakeaways.length > 0 && (
        <Card className="mb-6 border-[var(--green-muted)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-[var(--green-muted)] p-1.5">
              <Lightbulb className="text-[var(--green)]" size={16} />
            </div>
            <CardTitle className="!mb-0">Key Takeaways</CardTitle>
          </div>
          <ul className="space-y-2.5">
            {topic.keyTakeaways.map((k, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--green)] shrink-0" />
                <span className="leading-relaxed">{k}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Do this + Watch out for */}
      {((topic.doThis && topic.doThis.length > 0) || (topic.watchOutFor && topic.watchOutFor.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {topic.doThis && topic.doThis.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-lg bg-[var(--green-muted)] p-1.5">
                  <CheckCircle2 className="text-[var(--green)]" size={16} />
                </div>
                <CardTitle className="!mb-0">Do This</CardTitle>
              </div>
              <ul className="space-y-2">
                {topic.doThis.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--green)] mt-0.5">→</span>
                    <span className="leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {topic.watchOutFor && topic.watchOutFor.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-lg bg-red-500/10 p-1.5">
                  <AlertTriangle className="text-[var(--red)]" size={16} />
                </div>
                <CardTitle className="!mb-0">Watch Out For</CardTitle>
              </div>
              <ul className="space-y-2">
                {topic.watchOutFor.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--red)] mt-0.5">!</span>
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Related topics */}
      {related.length > 0 && (
        <div>
          <CardTitle>Related Topics</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {related.map((r) => {
              const rColor = CATEGORY_COLORS[r.category];
              return (
                <Link key={r.id} href={`/learn/${r.id}`}>
                  <Card className="!p-4 hover:bg-[var(--card-hover)] cursor-pointer transition group flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-[9px] uppercase tracking-widest font-bold"
                        style={{ color: rColor }}
                      >
                        {r.category}
                      </span>
                      <div className="font-bold text-white text-sm group-hover:text-[var(--green)] transition mt-0.5 truncate">
                        {r.title}
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--green)] transition shrink-0" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-[var(--text-muted)] mt-8">
        Educational only — not financial advice. Past performance does not guarantee future results.
      </p>
    </div>
  );
}
