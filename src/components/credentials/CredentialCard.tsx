"use client";

import type { Credential } from "./credentialsData";

/**
 * We ignore `cred.gradient` from the data file because the new design uses
 * a single shared violet→nebula + teal whisper thumbnail (`bp-thumb`).
 * All other fields still come from credentialsData.ts untouched.
 */

let cardCounter = 0;
function nextCode() {
  cardCounter = (cardCounter % 999) + 1;
  return cardCounter.toString().padStart(4, "0");
}

export default function CredentialCard({ cred }: { cred: Credential }) {
  const code = nextCode();

  return (
    <article className="bp-card p-5 h-full flex flex-col">
      {/* Status row */}
      <div className="flex items-center justify-between mb-4">
        <span className="bp-eyebrow">CRED · {code}</span>
        <span
          className="bp-label"
          style={{
            fontSize: "9.5px",
            color: cred.verified ? "var(--teal)" : "var(--dim)",
          }}
        >
          {cred.verified ? "VERIFIED" : "UNVERIFIED"}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="bp-thumb aspect-[4/3] mb-5 flex items-center justify-center">
        <span
          className="font-display"
          style={{
            fontSize: "56px",
            fontWeight: 200,
            letterSpacing: "-0.02em",
            color: "var(--bone)",
            opacity: 0.85,
          }}
        >
          {cred.initial}
        </span>
      </div>

      {/* Title */}
      <div
        className="font-display mb-2"
        style={{
          fontSize: "20px",
          fontWeight: 300,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          lineHeight: 1.1,
        }}
      >
        {cred.name}
      </div>

      {/* Editorial tag */}
      <p
        className="bp-editorial mb-5 flex-1"
        style={{ fontSize: "14px", opacity: 0.65, lineHeight: 1.45 }}
      >
        {cred.description}
      </p>

      {/* Meta row */}
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: "1px solid var(--bone-10)" }}
      >
        <span className="bp-label" style={{ fontSize: "9.5px" }}>
          {cred.type.toUpperCase()}
        </span>
        <button
          className="bp-label transition-colors"
          style={{ fontSize: "10px", color: "var(--bone)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--teal)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--bone)";
          }}
        >
          Get Proof →
        </button>
      </div>
    </article>
  );
}
