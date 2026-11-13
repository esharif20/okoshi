// Speed lines: thin wedges that run in from the edge of a Panel towards one point, as manga draws sudden force.
// The lengths come from a fixed sequence, so the drawing is the same on the server and in the browser.
type Props = { x?: number; y?: number; count?: number; reach?: number; className?: string };

export function SpeedLines({ x = 50, y = 50, count = 56, reach = 30, className = "" }: Props) {
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const wedges = Array.from({ length: count }, (_, i) => {
    const angle = ((i + next() * 0.7) / count) * Math.PI * 2;
    const half = 0.004 + next() * 0.014;
    const inner = reach + next() * 26;
    const at = (a: number, r: number) => `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`;
    return `${at(angle - half, 160)} ${at(angle + half, 160)} ${at(angle, inner)}`;
  });
  return (
    <svg className={`speed-lines ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {wedges.map((points) => (
        <polygon key={points} points={points} />
      ))}
    </svg>
  );
}
