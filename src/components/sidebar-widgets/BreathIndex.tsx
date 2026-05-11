"use client";

export default function BreathIndex() {
  return (
    <div className="bp-card relative overflow-hidden p-6 animate-slide-in-right">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="bp-eyebrow mb-2">VITAL · INDEX</div>
          <div
            className="font-display"
            style={{
              fontSize: "20px",
              fontWeight: 300,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Breath
          </div>
        </div>
        <span
          className="bp-label"
          style={{ fontSize: "9px", color: "var(--teal)" }}
        >
          LIVE
        </span>
      </div>

      {/* Concentric "breathing" rings + pulse dot (pure CSS stand-in for 3D) */}
      <div className="relative mx-auto w-[132px] h-[132px] my-4">
        <span
          className="absolute inset-0 rounded-full animate-dot-pulse"
          style={{
            border: "1px solid var(--teal-20)",
            animationDuration: "4s",
          }}
        />
        <span
          className="absolute inset-4 rounded-full animate-dot-pulse"
          style={{
            border: "1px solid rgba(201, 123, 94, 0.15)",
            animationDuration: "5s",
            animationDelay: "0.5s",
          }}
        />
        <span
          className="absolute inset-8 rounded-full animate-dot-pulse"
          style={{
            border: "1px solid rgba(201, 123, 94, 0.1)",
            animationDuration: "6s",
            animationDelay: "1s",
          }}
        />
        <span
          className="absolute top-1/2 left-1/2 w-[10px] h-[10px] rounded-full animate-dot-pulse"
          style={{
            transform: "translate(-50%, -50%)",
            background: "var(--teal)",
            boxShadow: "0 0 16px var(--teal)",
          }}
        />
      </div>

      {/* Readout */}
      <div
        className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-4"
        style={{ borderTop: "1px solid var(--bone-10)" }}
      >
        <div className="flex justify-between">
          <span className="bp-label">RATE</span>
          <span
            className="bp-readout"
            style={{ fontSize: "11px", color: "var(--bone)" }}
          >
            +0.042
          </span>
        </div>
        <div className="flex justify-between">
          <span className="bp-label">Φ</span>
          <span
            className="bp-readout"
            style={{ fontSize: "11px", color: "var(--bone)" }}
          >
            +1.180
          </span>
        </div>
        <div className="flex justify-between">
          <span className="bp-label">AMP</span>
          <span
            className="bp-readout"
            style={{ fontSize: "11px", color: "var(--bone)" }}
          >
            0.960
          </span>
        </div>
        <div className="flex justify-between">
          <span className="bp-label">STATE</span>
          <span
            className="bp-readout"
            style={{ fontSize: "11px", color: "var(--teal)" }}
          >
            STABLE
          </span>
        </div>
      </div>
    </div>
  );
}
