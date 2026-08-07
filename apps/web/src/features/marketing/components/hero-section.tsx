import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductPreview } from "./product-preview";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-20 sm:px-6 lg:px-8 lg:pt-28 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary">Now open — Agentic AI cohort</Badge>

          <h1 className="font-heading mt-6 text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Learn in cohorts.
            <br />
            Prove it with evidence.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-balance">
            Join a cohort, work through real lessons and activities, submit
            evidence of your learning, and get direct feedback from mentors —
            all tracked on one roadmap.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/register" />}>
              Get started <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="#how-it-works" />}>
              See how it works
            </Button>
          </div>
        </div>

        <div className="mt-16 lg:mt-20">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
