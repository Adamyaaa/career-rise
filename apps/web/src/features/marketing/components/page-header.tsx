import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/common/reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl px-4 pt-20 pb-16 text-center sm:px-6 lg:px-8">
      {eyebrow && <Badge variant="secondary">{eyebrow}</Badge>}
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground text-balance">{description}</p>
      )}
    </Reveal>
  );
}
