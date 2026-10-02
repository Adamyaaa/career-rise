import path from "node:path";
process.loadEnvFile(path.resolve(__dirname, "../../../.env"));

import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PM_MODULES_DATA } from "./pm-curriculum.data";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = process.env.SEED_PASSWORD as string;
if (!SEED_PASSWORD) {
  console.error("ERROR: SEED_PASSWORD environment variable is missing.");
  process.exit(1);
}

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);

  const mentorUser = await prisma.user.upsert({
    where: { email: "mentor@careerrise.dev" },
    update: { passwordHash },
    create: {
      email: "mentor@careerrise.dev",
      passwordHash,
      role: Role.MENTOR,
      mentorProfile: { create: { specializations: ["Product Management", "Agentic AI"], capacity: 20 } },
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

  await prisma.user.upsert({
    where: { email: "admin@careerrise.dev" },
    update: { passwordHash },
    create: {
      email: "admin@careerrise.dev",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const mentorProfile = await prisma.mentorProfile.findUniqueOrThrow({ where: { userId: mentorUser.id } });

  // 1. Agentic AI Course & Cohort
  let aiCourse = await prisma.course.findFirst({ where: { title: "Agentic AI" } });
  if (!aiCourse) {
    aiCourse = await prisma.course.create({
      data: {
        title: "Agentic AI",
        description: "Build and ship agentic AI applications end to end.",
        category: ["AI", "Engineering"],
      },
    });
  }

  let aiCohort = await prisma.cohort.findFirst({ where: { courseId: aiCourse.id } });
  if (!aiCohort) {
    aiCohort = await prisma.cohort.create({
      data: {
        courseId: aiCourse.id,
        name: "Cohort 1",
        startDate: new Date("2026-07-14"),
        endDate: new Date("2026-10-06"),
      },
    });
  }

  await prisma.cohortMentorAssignment.upsert({
    where: { cohortId_mentorProfileId: { cohortId: aiCohort.id, mentorProfileId: mentorProfile.id } },
    update: {},
    create: {
      cohortId: aiCohort.id,
      mentorProfileId: mentorProfile.id,
    },
  });

  const existingAiEnrollment = await prisma.cohortEnrollment.findFirst({
    where: { studentId: studentUser.id, cohortId: aiCohort.id },
  });
  if (!existingAiEnrollment) {
    await prisma.cohortEnrollment.create({
      data: { studentId: studentUser.id, cohortId: aiCohort.id, status: "active" },
    });
  }

  // 2. Product Management Course & Cohort
  let pmCourse = await prisma.course.findFirst({ where: { title: "Product Management" } });
  if (!pmCourse) {
    pmCourse = await prisma.course.create({
      data: {
        title: "Product Management",
        description: "Comprehensive 50-day Product Management cohort with masterclasses, PRD templates, teardowns, case studies, SQL, analytics, and interview prep.",
        category: ["Product Management", "Strategy", "Analytics", "Interviews"],
      },
    });
  }

  let pmCohort = await prisma.cohort.findFirst({ where: { courseId: pmCourse.id } });
  if (!pmCohort) {
    pmCohort = await prisma.cohort.create({
      data: {
        courseId: pmCourse.id,
        name: "Product Management Cohort 1",
        startDate: new Date("2026-07-14"),
        endDate: new Date("2026-10-30"),
      },
    });
  }

  await prisma.cohortMentorAssignment.upsert({
    where: { cohortId_mentorProfileId: { cohortId: pmCohort.id, mentorProfileId: mentorProfile.id } },
    update: {},
    create: {
      cohortId: pmCohort.id,
      mentorProfileId: mentorProfile.id,
    },
  });

  const existingPmEnrollment = await prisma.cohortEnrollment.findFirst({
    where: { studentId: studentUser.id, cohortId: pmCohort.id },
  });
  if (!existingPmEnrollment) {
    await prisma.cohortEnrollment.create({
      data: { studentId: studentUser.id, cohortId: pmCohort.id, status: "active" },
    });
  }

  // Seed / Update PM Modules & Lessons
  console.log(`Seeding ${PM_MODULES_DATA.length} Product Management modules & lessons...`);
  const baseDate = new Date("2026-07-14T10:00:00.000Z");

  for (let i = 0; i < PM_MODULES_DATA.length; i++) {
    const spec = PM_MODULES_DATA[i];
    let mod = await prisma.module.findFirst({ where: { cohortId: pmCohort.id, order: spec.order } });
    if (!mod) {
      mod = await prisma.module.create({
        data: { cohortId: pmCohort.id, title: spec.title, order: spec.order },
      });
    } else {
      mod = await prisma.module.update({
        where: { id: mod.id },
        data: { title: spec.title },
      });
    }

    // Schedule dates spaced across cohort days
    const lessonDate = new Date(baseDate);
    lessonDate.setDate(baseDate.getDate() + (i * 2));

    const lessonTitle = `${spec.title.replace(/^Module \d+:\s*/, "")} — Class & Materials`;
    const existingLesson = await prisma.lesson.findFirst({ where: { moduleId: mod.id } });

    if (!existingLesson) {
      await prisma.lesson.create({
        data: {
          moduleId: mod.id,
          title: lessonTitle,
          content: spec.content,
          order: 1,
          slides: spec.slides,
          assignmentsUrl: spec.assignmentsUrl,
          submissionRequired: spec.submissionRequired,
          scheduledAt: lessonDate,
        },
      });
    } else {
      await prisma.lesson.update({
        where: { id: existingLesson.id },
        data: {
          title: lessonTitle,
          content: spec.content,
          slides: spec.slides,
          assignmentsUrl: spec.assignmentsUrl,
          submissionRequired: spec.submissionRequired,
          scheduledAt: lessonDate,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`  Mentor login:  mentor@careerrise.dev / ${SEED_PASSWORD}`);
  console.log(`  Student login: student@careerrise.dev / ${SEED_PASSWORD}`);
  console.log(`  Admin login:   admin@careerrise.dev / ${SEED_PASSWORD}`);
  console.log(`  PM Cohort:     ${pmCohort.name} (${pmCohort.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
