"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    code: "01",
    question: "What is Breath Protocol?",
    answer:
      "Breath ID lets you prove personal information about yourself without revealing private data. Use it to verify identity, earn rewards, and confirm ownership instantly — online and in the real world.",
  },
  {
    code: "02",
    question: "What are credentials?",
    answer:
      "Credentials are verified proofs of real-world identity attributes — bank accounts, wallets, social profiles — stored as zero-knowledge proofs on-chain.",
  },
  {
    code: "03",
    question: "What are linked accounts?",
    answer:
      "External services and platforms connected to your Breath ID. They enable seamless verification across ecosystems without compromising privacy.",
  },
  {
    code: "04",
    question: "How is data verified without being stored?",
    answer:
      "Zero-knowledge proofs (zkTLS) verify claims without exposing the underlying data. Your information never leaves your device — only cryptographic proofs are shared.",
  },
];

export default function SupportFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: "0.32s" }}>
      <div className="mb-6">
        <div className="bp-eyebrow mb-3">SUPPORT · INDEX</div>
        <h3
          className="bp-display"
          style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}
        >
          We support you
        </h3>
      </div>

      <div className="space-y-px">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={faq.question}
              className="transition-colors"
              style={{
                borderTop: "1px solid var(--bone-10)",
                borderBottom:
                  i === faqs.length - 1 ? "1px solid var(--bone-10)" : "none",
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center gap-6 py-5 group text-left"
              >
                <span
                  className="bp-readout flex-shrink-0"
                  style={{
                    fontSize: "12px",
                    color: isOpen ? "var(--teal)" : "var(--dim)",
                  }}
                >
                  {faq.code}
                </span>
                <span
                  className="flex-1 font-display transition-colors"
                  style={{
                    fontSize: "clamp(18px, 2vw, 24px)",
                    fontWeight: 300,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    color: isOpen ? "var(--bone)" : "var(--dim)",
                  }}
                >
                  {faq.question}
                </span>
                <span
                  className="bp-label transition-all"
                  style={{
                    fontSize: "14px",
                    color: isOpen ? "var(--teal)" : "var(--dim)",
                    transform: isOpen ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <p
                  className="bp-editorial pb-6 pl-[44px] pr-8 max-w-3xl"
                  style={{
                    fontSize: "17px",
                    opacity: 0.7,
                    lineHeight: 1.5,
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
