-- Whether a class expects the student to hand work in. Explicit rather than inferred
-- from an assignment link, so it reads the same way to the mentor setting it and the
-- student seeing it. Defaults false: existing classes require nothing until a mentor says
-- otherwise.
ALTER TABLE "lessons" ADD COLUMN "submissionRequired" BOOLEAN NOT NULL DEFAULT false;
