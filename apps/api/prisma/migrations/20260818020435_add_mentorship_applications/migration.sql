-- CreateTable
CREATE TABLE "mentorship_applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currentRole" TEXT,
    "targetRole" TEXT,
    "timeline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentorship_applications_pkey" PRIMARY KEY ("id")
);
