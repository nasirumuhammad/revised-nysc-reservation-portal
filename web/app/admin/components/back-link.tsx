import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}
