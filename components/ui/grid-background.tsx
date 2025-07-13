'use client';

interface GridBackgroundProps {
  className?: string;
}

export default function GridBackground({ className = "" }: GridBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 bg-teal-600 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  );
}