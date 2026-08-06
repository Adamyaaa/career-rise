import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";

export function CtaSection() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-2xl border border-border/60 bg-card px-6 py-16 text-center shadow-sm">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to start your cohort?
          </h2>
          <p className="max-w-md text-muted-foreground text-balance">
            Join the next cohort and start building evidence of what you can
            do — with a mentor looking at your work, not just a syllabus.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/register" />}>
              Get started <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/contact" />}>
              Talk to us
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
