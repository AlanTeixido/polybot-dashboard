"use client";

export function WinRateRing({
  rate,
  size = 90,
  stroke = 6,
}: {
  rate: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;
  const color = rate >= 60 ? "#22d3ee" : rate >= 45 ? "#fbbf24" : "#f43f5e";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="win-ring -rotate-90" style={{ "--size": `${size}px`, "--stroke": stroke } as React.CSSProperties} width={size} height={size}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            filter: `drop-shadow(0 0 8px ${color}66)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold text-white">{rate}</span>
        <span className="text-[10px] text-white/30">%WR</span>
      </div>
    </div>
  );
}
