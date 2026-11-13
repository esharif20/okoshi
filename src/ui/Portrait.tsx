import "./ui.css";

export function Portrait({ size = 44, name }: { size?: number; name: string }) {
  return (
    <img
      className="portrait"
      src={`${import.meta.env.BASE_URL}img/portrait.jpg`}
      width={size}
      height={size}
      alt={`Portrait of ${name}`}
    />
  );
}
