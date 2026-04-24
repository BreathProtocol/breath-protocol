"use client";

import { ExternalLink } from "lucide-react";

const articles = [
  { code: "01", title: "What is zkTLS and how does it work?", readTime: "10 MIN" },
  { code: "02", title: "What are verifiable credentials?", readTime: "10 MIN" },
  { code: "03", title: "How Breath Protocol reshapes identity", readTime: "15 MIN" },
  { code: "04", title: "The new Breath: what comes next?", readTime: "15 MIN" },
];

export default function HelpCenter() {
  return (
    <div
      className="bp-card p-5 animate-slide-in-right"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="bp-eyebrow mb-1">FIELD · NOTES</div>
          <span
            className="font-display"
            style={{
              fontSize: "18px",
              fontWeight: 300,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Help Center
          </span>
        </div>
        <ExternalLink
          className="w-[12px] h-[12px]"
          strokeWidth={1.4}
          style={{ color: "var(--dim)" }}
        />
      </div>

      <div className="space-y-px">
        {articles.map((article) => (
          <button
            key={article.title}
            className="w-full py-3 text-left flex items-start gap-4 group transition-colors hover:bg-[rgba(122,224,212,0.04)]"
            style={{ borderTop: "1px solid var(--bone-10)" }}
          >
            <span
              className="bp-readout flex-shrink-0"
              style={{ fontSize: "10px", color: "var(--dim)" }}
            >
              {article.code}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="font-display transition-colors"
                style={{
                  fontSize: "13.5px",
                  fontWeight: 300,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  color: "var(--bone)",
                  lineHeight: 1.3,
                }}
              >
                {article.title}
              </p>
              <p
                className="bp-label mt-1"
                style={{ fontSize: "9px", color: "var(--dim)" }}
              >
                TEAM BREATH · {article.readTime}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
