import "./inner-ai-orbital.css";

const energyPaths = [
  "M0 235 H255 C345 235 400 235 400 305 C400 360 460 370 520 370",
  "M0 453 H510",
  "M0 690 H255 C355 690 390 690 390 620 C390 585 435 585 520 585",
  "M1672 235 H1418 C1328 235 1272 235 1272 305 C1272 360 1212 370 1152 370",
  "M1672 453 H1162",
  "M1672 690 H1418 C1317 690 1282 690 1282 620 C1282 585 1237 585 1152 585",
] as const;

const pulseDots = [
  { cx: 255, cy: 235, variant: "purple" },
  { cx: 426, cy: 335, variant: "blue" },
  { cx: 510, cy: 453, variant: "blue" },
  { cx: 390, cy: 620, variant: "purple" },
  { cx: 1418, cy: 235, variant: "purple" },
  { cx: 1246, cy: 335, variant: "blue" },
  { cx: 1162, cy: 453, variant: "blue" },
  { cx: 1282, cy: 620, variant: "purple" },
] as const;

const particles = [
  "p1",
  "p2 purple",
  "p3",
  "p4 purple",
  "p5",
  "p6 purple",
] as const;

export const InnerAIOrbital = () => {
  return (
    <div className="inner-ai-orbital" aria-label="Inner AI Animated Interface">
      <div className="inner-ai-orbital__scanline" aria-hidden="true" />
      <div className="inner-ai-orbital__orb inner-ai-orbital__orb--left" aria-hidden="true" />
      <div className="inner-ai-orbital__orb inner-ai-orbital__orb--right" aria-hidden="true" />
      <div className="inner-ai-orbital__orb inner-ai-orbital__orb--center" aria-hidden="true" />
      <div className="inner-ai-orbital__core" aria-hidden="true" />
      <div className="inner-ai-orbital__ring" aria-hidden="true" />
      <div className="inner-ai-orbital__shine" aria-hidden="true" />

      <img
        src="/inner-ai-interface-base.webp"
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="inner-ai-orbital__image"
      />

      <svg
        className="inner-ai-orbital__energy"
        viewBox="-72 0 1816 941"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="innerEnergy" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="hsl(var(--primary) / 0)" />
            <stop offset="0.45" stopColor="hsl(var(--primary) / 0.95)" />
            <stop offset="0.72" stopColor="hsl(var(--primary-deep) / 0.82)" />
            <stop offset="1" stopColor="hsl(var(--primary-deep) / 0)" />
          </linearGradient>
        </defs>

        {energyPaths.map((d, index) => (
          <path
            key={d}
            d={d}
            className={`inner-ai-orbital__path ${index >= 3 ? "is-reverse" : ""}`}
            style={{ animationDelay: `${[-0, -0.8, -1.6, -2.4, -3.2, -1.6][index]}s` }}
          />
        ))}

        {pulseDots.map(({ cx, cy, variant }, index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="5"
            className={`inner-ai-orbital__dot ${variant === "purple" ? "is-purple" : ""}`}
            style={{ animationDelay: `${index % 2 === 0 ? -1.2 : 0}s` }}
          />
        ))}
      </svg>

      {particles.map((particle, index) => (
        <span key={index} className={`inner-ai-orbital__particle ${particle}`} aria-hidden="true" />
      ))}
    </div>
  );
};

export default InnerAIOrbital;
