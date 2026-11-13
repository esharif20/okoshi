import type { AnchorHTMLAttributes } from "react";
import { Link } from "react-router";

export type AnchorProps = { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

// One link element for the site: pages go through the router (so the base path is applied), everything else is a plain anchor.
export function Anchor({ href, ...rest }: AnchorProps) {
  if (href.startsWith("/")) return <Link to={href} {...rest} />;
  return <a href={href} {...rest} />;
}
