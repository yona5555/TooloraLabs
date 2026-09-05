const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
};

type Props = {
  value: number;
  faces: number;
  isRolling?: boolean;
  size?: number;
};

export default function DiceFace({ value, faces, isRolling = false, size = 56 }: Props) {
  const animationClass = isRolling ? "animate-[spin_0.5s_ease-in-out]" : "";

  if (faces === 6) {
    const pips = PIP_LAYOUTS[value] ?? [];
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={animationClass}
        role="img"
        aria-label={String(value)}
      >
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="16"
          className="fill-white stroke-blue-400 dark:fill-zinc-800 dark:stroke-blue-500"
          strokeWidth="3"
        />
        {pips.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="7" className="fill-blue-600 dark:fill-blue-400" />
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={animationClass}
      role="img"
      aria-label={String(value)}
    >
      <polygon
        points="50,4 92,28 92,72 50,96 8,72 8,28"
        className="fill-white stroke-blue-400 dark:fill-zinc-800 dark:stroke-blue-500"
        strokeWidth="3"
      />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        className="fill-blue-700 font-mono text-[2.25rem] font-bold dark:fill-blue-300"
      >
        {value}
      </text>
    </svg>
  );
}
