import path from "node:path";
process.loadEnvFile(path.resolve(__dirname, "../../../.env"));

import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = "X9$pL2!mQ8#vK4@w";

// Minimal sample data so the mentor lesson-material feature (and anything else
// that needs a real cohort/lesson to point at) is actually testable — course/cohort
// creation itself is a later phase, this is not that.
async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);

  const mentorUser = await prisma.user.upsert({
    where: { email: "mentor@careerrise.dev" },
    update: { passwordHash },
    create: {
      email: "mentor@careerrise.dev",
      passwordHash,
      role: Role.MENTOR,
      mentorProfile: { create: { specializations: ["Agentic AI"], capacity: 20 } },
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@careerrise.dev" },
    update: { passwordHash },
    create: {
      email: "student@careerrise.dev",
      passwordHash,
      role: Role.STUDENT,
      studentProfile: { create: {} },
    },
  });

  // SUPER_ADMIN has no profile model — self-registration only ever creates
  // STUDENT (see auth.service.ts), and POST /admin/users to provision
  // mentor/admin accounts isn't built yet, so this seed is the only way in.
  await prisma.user.upsert({
    where: { email: "admin@careerrise.dev" },
    update: { passwordHash },
    create: {
      email: "admin@careerrise.dev",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  let course = await prisma.course.findFirst({ where: { title: "Agentic AI" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "Agentic AI",
        description: "Build and ship agentic AI applications end to end.",
        category: ["AI", "Engineering"],
      },
    });
  }

  let cohort = await prisma.cohort.findFirst({ where: { courseId: course.id } });
  if (!cohort) {
    cohort = await prisma.cohort.create({
      data: {
        courseId: course.id,
        name: "Cohort 1",
        startDate: new Date("2026-07-14"),
        endDate: new Date("2026-10-06"),
      },
    });
  } else if (cohort.name !== "Cohort 1") {
    cohort = await prisma.cohort.update({ where: { id: cohort.id }, data: { name: "Cohort 1" } });
  }

  await prisma.cohortMentorAssignment.upsert({
    where: { cohortId_mentorProfileId: { cohortId: cohort.id, mentorProfileId: (await prisma.mentorProfile.findUniqueOrThrow({ where: { userId: mentorUser.id } })).id } },
    update: {},
    create: {
      cohortId: cohort.id,
      mentorProfileId: (await prisma.mentorProfile.findUniqueOrThrow({ where: { userId: mentorUser.id } })).id,
    },
  });

  const existingEnrollment = await prisma.cohortEnrollment.findFirst({
    where: { studentId: studentUser.id, cohortId: cohort.id },
  });
  if (!existingEnrollment) {
    await prisma.cohortEnrollment.create({
      data: { studentId: studentUser.id, cohortId: cohort.id, status: "active" },
    });
  }

  const moduleSpecs = [
    { title: "Foundations", lessons: ["What is an agent?", "Tool use & memory"] },
    { title: "Building your first agent", lessons: ["Planning & reasoning loops", "Shipping to production"] },
  ];

  for (let i = 3; i <= 12; i++) {
    moduleSpecs.push({
      title: `Module ${i}`,
      lessons: [`Class 1`, `Class 2`],
    });
  }

  for (let i = 0; i < moduleSpecs.length; i++) {
    const spec = moduleSpecs[i];
    let mod = await prisma.module.findFirst({ where: { cohortId: cohort.id, title: spec.title } });
    if (!mod) {
      mod = await prisma.module.create({
        data: { cohortId: cohort.id, title: spec.title, order: i + 1 },
      });
    }

    for (let j = 0; j < spec.lessons.length; j++) {
      const lessonTitle = spec.lessons[j];
      const existingLesson = await prisma.lesson.findFirst({ where: { moduleId: mod.id, title: lessonTitle } });
      if (!existingLesson) {
        await prisma.lesson.create({
          data: {
            moduleId: mod.id,
            title: lessonTitle,
            content: `Lesson content for "${lessonTitle}" goes here.`,
            order: j + 1,
          },
        });
      }
    }
  }

  console.log("Seed complete.");
  console.log(`  Mentor login:  mentor@careerrise.dev / ${SEED_PASSWORD}`);
  console.log(`  Student login: student@careerrise.dev / ${SEED_PASSWORD}`);
  console.log(`  Admin login:   admin@careerrise.dev / ${SEED_PASSWORD}`);
  console.log(`  Cohort: ${cohort.name} (${cohort.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
