import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";

export function CtaSection() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-2xl border border-border/60 bg-card px-6 py-16 text-center shadow-sm">
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Ready to start your cohort?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            Stop collecting courses and start building a portfolio you can actually show to employers. Do it with a mentor reviewing your work, not just a syllabus.
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
