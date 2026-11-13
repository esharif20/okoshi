import { useEffect, useState } from "react";
import { stage, useStage } from "~/stage";

const londonTime = (d: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" }).format(d);

// The time in London, and the switch between Day and Night. The site opens in Day, at dawn: Night is the visitor's choice.
export function Clock({ className }: { className?: string }) {
  const night = useStage((s) => s.night);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setTime(londonTime(now));
    const id = setInterval(() => setTime(londonTime(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.night = String(night);
  }, [night]);

  return (
    <span className={className}>
      {time && <time dateTime={time}>{time} in London</time>}
      <button type="button" aria-pressed={night} onClick={() => stage.setState({ night: !night })}>
        {night ? "Switch to day" : "Switch to night"}
      </button>
    </span>
  );
}
