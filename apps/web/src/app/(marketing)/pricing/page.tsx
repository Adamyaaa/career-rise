import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PageHeader } from "@/features/marketing/components/page-header";
import { Reveal } from "@/components/common/reveal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pricing" };

const tiers = [
  {
    name: "Cohort seat",
    price: "Contact us",
    description: "A single seat in an upcoming cohort.",
    features: ["Full course access", "Mentor-reviewed evidence", "Progress tracking & roadmap", "Cohort community"],
    cta: "Join the waitlist",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Team",
    price: "Contact us",
    description: "For teams sponsoring multiple learners.",
    features: ["Everything in Cohort seat", "Pooled seats across cohorts", "Manager progress reporting", "Priority mentor matching"],
    cta: "Talk to sales",
    href: "/contact",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Contact us",
    description: "Custom cohorts for your organization.",
    features: ["Everything in Team", "Custom course tracks", "Dedicated mentors", "SSO & admin controls"],
    cta: "Talk to sales",
    href: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Pricing is still taking shape"
        description="We're finalizing cohort pricing as we scale beyond the first Agentic AI cohort. Reach out and we'll walk you through what's available now."
      />

      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {tiers.map((tier, i) => (
              <Reveal key={tier.name} delay={0.06 * i}>
                <Card className={tier.highlighted ? "h-full ring-2 ring-primary" : "h-full"}>
                  <CardHeader>
                    {tier.highlighted && <Badge className="mb-2 w-fit">Most popular</Badge>}
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{tier.price}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2.5">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {feature}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      render={<Link href={tier.href} />}
                    >
                      {tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
