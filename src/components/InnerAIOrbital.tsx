const energyPaths = [
  "M0 235 H255 C345 235 400 235 400 305 C400 360 460 370 520 370",
  "M0 453 H510",
  "M0 690 H255 C355 690 390 690 390 620 C390 585 435 585 520 585",
  "M1672 235 H1418 C1328 235 1272 235 1272 305 C1272 360 1212 370 1152 370",
  "M1672 453 H1162",
  "M1672 690 H1418 C1317 690 1282 690 1282 620 C1282 585 1237 585 1152 585",
];

const pulseDots = [
  { cx: 255, cy: 235, purple: true },
  { cx: 426, cy: 335 },
  { cx: 510, cy: 453 },
  { cx: 390, cy: 620, purple: true },
  { cx: 1418, cy: 235, purple: true },
  { cx: 1246, cy: 335 },
  { cx: 1162, cy: 453 },
  { cx: 1282, cy: 620, purple: true },
];

const particles = [
  "left-[35%] top-[13%] animate-[orbital-particle_7.4s_ease-in-out_infinite]",
  "left-[58%] top-[11%] size-1 bg-[hsl(var(--ring-secondary))] animate-[orbital-particle_7.4s_ease-in-out_infinite_-1.1s]",
  "right-[31%] top-[18%] size-[7px] animate-[orbital-particle_7.4s_ease-in-out_infinite_-2.2s]",
  "left-[28%] bottom-[18%] size-1 bg-[hsl(var(--ring-secondary))] animate-[orbital-particle_7.4s_ease-in-out_infinite_-3.4s]",
  "right-[34%] bottom-[16%] animate-[orbital-particle_7.4s_ease-in-out_infinite_-4.1s]",
  "left-1/2 top-[7%] size-[3px] bg-[hsl(var(--ring-secondary))] animate-[orbital-particle_7.4s_ease-in-out_infinite_-5.2s]",
];

export const InnerAIOrbital = () => {
  return (
    <div
      className="relative w-full overflow-visible bg-transparent px-[5.5%]"
      style={{ aspectRatio: "1672 / 941" }}
      aria-label="Inner AI Animated Interface"
    >
      <div className="absolute inset-0 overflow-visible bg-transparent">
        <div className="absolute inset-x-[5%] top-[-8%] h-px bg-[linear-gradient(90deg,transparent,transparent,hsl(var(--primary)/0.26),hsl(var(--accent-secondary)/0.2),transparent)] opacity-25 motion-safe:animate-[orbital-scan_8s_linear_infinite]" />

        <div className="absolute left-[12.5%] top-[22%] size-[76px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.14),transparent_68%)] opacity-55 motion-safe:animate-[orbital-orb_8.2s_ease-in-out_infinite]" />
        <div className="absolute right-[12.5%] top-[22%] size-[76px] rounded-full bg-[radial-gradient(circle,hsl(var(--accent-secondary)/0.14),transparent_68%)] opacity-55 motion-safe:animate-[orbital-orb_8.2s_ease-in-out_infinite_-2s]" />
        <div className="absolute left-[48%] bottom-[12%] size-[76px] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.14),transparent_68%)] opacity-55 motion-safe:animate-[orbital-orb_8.2s_ease-in-out_infinite_-4s]" />

        <div className="absolute left-1/2 top-[48%] z-[4] size-[228px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(0_0%_100%/0.12),transparent_12%),radial-gradient(circle,hsl(var(--primary)/0.32),transparent_42%),radial-gradient(circle,hsl(var(--accent-secondary)/0.24),transparent_62%)] opacity-80 mix-blend-screen motion-safe:animate-[orbital-core_3.8s_ease-in-out_infinite]" />

        <div className="absolute left-1/2 top-[48%] z-[6] size-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full before:absolute before:inset-0 before:rounded-full before:border before:border-[hsl(var(--primary)/0.26)] before:shadow-[0_0_12px_hsl(var(--primary)/0.12),inset_0_0_10px_hsl(var(--accent-secondary)/0.08)] motion-safe:before:animate-[spin_12s_linear_infinite] after:absolute after:inset-[18px] after:rounded-full after:border after:border-dashed after:border-[hsl(var(--accent-secondary)/0.35)] motion-safe:after:animate-[spin_15s_linear_infinite_reverse]" />

        <div className="absolute left-[37%] top-[20%] z-[5] h-[62%] w-[26%] rounded-[32px] bg-[linear-gradient(110deg,transparent_0%,hsl(0_0%_100%/0)_38%,hsl(0_0%_100%/0.08)_50%,hsl(0_0%_100%/0)_62%,transparent_100%)] opacity-10 mix-blend-screen motion-safe:animate-[orbital-shine_7.2s_ease-in-out_infinite]" />

        <img
          src="/inner-ai-interface-base.webp"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 z-[1] block h-full w-full select-none object-contain saturate-110 contrast-105 brightness-[0.98]"
        />

        <svg
          className="absolute inset-0 z-[6] h-full w-full overflow-visible"
          viewBox="-72 0 1816 941"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="innerEnergy" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="hsl(var(--primary) / 0)" />
              <stop offset="0.45" stopColor="hsl(var(--primary) / 0.95)" />
              <stop offset="0.72" stopColor="hsl(var(--accent-secondary) / 0.86)" />
              <stop offset="1" stopColor="hsl(var(--accent-secondary) / 0)" />
            </linearGradient>
          </defs>

          {energyPaths.map((d, index) => {
            const reverse = index >= 3;
            const delayMap = ["0s", "-0.8s", "-1.6s", "-2.4s", "-3.2s", "-1.6s"];
            return (
              <path
                key={d}
                d={d}
                fill="none"
                stroke="url(#innerEnergy)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="70 720"
                style={{ animationDelay: delayMap[index], animationDirection: reverse ? "reverse" : "normal" }}
                className="motion-safe:animate-[orbital-path_5.6s_linear_infinite]"
              />
            );
          })}

          {pulseDots.map(({ cx, cy, purple }, index) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="5"
              fill={purple ? "hsl(var(--accent-secondary))" : "hsl(var(--primary-soft))"}
              style={{ animationDelay: index % 2 ? "0s" : "-1.2s" }}
              className="motion-safe:animate-[orbital-dot_2.8s_ease-in-out_infinite]"
            />
          ))}
        </svg>

        {particles.map((className, index) => (
          <span
            key={index}
            className={`absolute z-[8] size-[5px] rounded-full bg-[hsl(var(--primary-soft)/0.82)] ${className}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
};

export default InnerAIOrbital;
