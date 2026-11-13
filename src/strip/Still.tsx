// One recorded still of the Diorama, in the shape that suits the screen.
export type StillName = "arrival" | "plan" | "fold" | "ink" | "paint" | "plate";

const base = import.meta.env.BASE_URL;

export function Still({ name, alt, className, eager }: { name: StillName; alt: string; className?: string; eager?: boolean }) {
  return (
    <picture className={className}>
      <source media="(max-aspect-ratio: 1/1)" srcSet={`${base}poster/${name}-tall.webp`} width={900} height={1350} />
      <img
        src={`${base}poster/${name}-wide.webp`}
        width={1600}
        height={1000}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
