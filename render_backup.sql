--
-- PostgreSQL database dump
--

\restrict VYOSqF5HfIR8G7KMcnpo61tulep3n1RwaLIlCZ6L48I0Ghah9u3oXXviE8skYEo

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg12+1)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS "student_profiles_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS "reviews_mentorId_fkey";
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS "reviews_evidenceId_fkey";
ALTER TABLE IF EXISTS ONLY public.review_scores DROP CONSTRAINT IF EXISTS "review_scores_reviewId_fkey";
ALTER TABLE IF EXISTS ONLY public.review_scores DROP CONSTRAINT IF EXISTS "review_scores_criterionId_fkey";
ALTER TABLE IF EXISTS ONLY public.review_criteria DROP CONSTRAINT IF EXISTS "review_criteria_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.progress_weight_configs DROP CONSTRAINT IF EXISTS "progress_weight_configs_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.progress_signals DROP CONSTRAINT IF EXISTS "progress_signals_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public.progress_signals DROP CONSTRAINT IF EXISTS "progress_signals_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS "modules_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.mentor_profiles DROP CONSTRAINT IF EXISTS "mentor_profiles_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS "lessons_moduleId_fkey";
ALTER TABLE IF EXISTS ONLY public.lesson_feedback DROP CONSTRAINT IF EXISTS "lesson_feedback_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public.lesson_feedback DROP CONSTRAINT IF EXISTS "lesson_feedback_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public.lesson_feedback DROP CONSTRAINT IF EXISTS "lesson_feedback_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.lesson_completions DROP CONSTRAINT IF EXISTS "lesson_completions_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public.lesson_completions DROP CONSTRAINT IF EXISTS "lesson_completions_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public.lesson_completions DROP CONSTRAINT IF EXISTS "lesson_completions_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.learning_sessions DROP CONSTRAINT IF EXISTS "learning_sessions_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public.evidence DROP CONSTRAINT IF EXISTS "evidence_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public.evidence DROP CONSTRAINT IF EXISTS "evidence_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public.evidence DROP CONSTRAINT IF EXISTS "evidence_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.cohorts DROP CONSTRAINT IF EXISTS "cohorts_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public.cohort_mentor_assignments DROP CONSTRAINT IF EXISTS "cohort_mentor_assignments_mentorProfileId_fkey";
ALTER TABLE IF EXISTS ONLY public.cohort_mentor_assignments DROP CONSTRAINT IF EXISTS "cohort_mentor_assignments_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.cohort_enrollments DROP CONSTRAINT IF EXISTS "cohort_enrollments_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public.cohort_enrollments DROP CONSTRAINT IF EXISTS "cohort_enrollments_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "attendance_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "attendance_markedBy_fkey";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "attendance_learningSessionId_fkey";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "attendance_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS "announcements_cohortId_fkey";
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS "announcements_authorId_fkey";
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public."student_profiles_userId_key";
DROP INDEX IF EXISTS public."reviews_evidenceId_key";
DROP INDEX IF EXISTS public."review_scores_reviewId_criterionId_key";
DROP INDEX IF EXISTS public."review_criteria_cohortId_idx";
DROP INDEX IF EXISTS public."progress_weight_configs_cohortId_signalType_key";
DROP INDEX IF EXISTS public."progress_signals_studentId_cohortId_idx";
DROP INDEX IF EXISTS public."progress_signals_cohortId_idx";
DROP INDEX IF EXISTS public."modules_cohortId_idx";
DROP INDEX IF EXISTS public."mentor_profiles_userId_key";
DROP INDEX IF EXISTS public."lessons_moduleId_idx";
DROP INDEX IF EXISTS public."lesson_feedback_lessonId_idx";
DROP INDEX IF EXISTS public."lesson_feedback_cohortId_createdAt_idx";
DROP INDEX IF EXISTS public."lesson_completions_studentId_lessonId_key";
DROP INDEX IF EXISTS public."lesson_completions_studentId_cohortId_idx";
DROP INDEX IF EXISTS public."learning_sessions_lessonId_idx";
DROP INDEX IF EXISTS public."evidence_studentId_cohortId_idx";
DROP INDEX IF EXISTS public."evidence_cohortId_idx";
DROP INDEX IF EXISTS public."cohorts_courseId_idx";
DROP INDEX IF EXISTS public."cohort_mentor_assignments_cohortId_mentorProfileId_key";
DROP INDEX IF EXISTS public."cohort_enrollments_studentId_cohortId_idx";
DROP INDEX IF EXISTS public."cohort_enrollments_cohortId_idx";
DROP INDEX IF EXISTS public."attendance_studentId_cohortId_idx";
DROP INDEX IF EXISTS public."attendance_learningSessionId_studentId_key";
DROP INDEX IF EXISTS public."attendance_cohortId_idx";
DROP INDEX IF EXISTS public."announcements_cohortId_createdAt_idx";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.review_scores DROP CONSTRAINT IF EXISTS review_scores_pkey;
ALTER TABLE IF EXISTS ONLY public.review_criteria DROP CONSTRAINT IF EXISTS review_criteria_pkey;
ALTER TABLE IF EXISTS ONLY public.progress_weight_configs DROP CONSTRAINT IF EXISTS progress_weight_configs_pkey;
ALTER TABLE IF EXISTS ONLY public.progress_signals DROP CONSTRAINT IF EXISTS progress_signals_pkey;
ALTER TABLE IF EXISTS ONLY public.modules DROP CONSTRAINT IF EXISTS modules_pkey;
ALTER TABLE IF EXISTS ONLY public.mentorship_applications DROP CONSTRAINT IF EXISTS mentorship_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.mentor_profiles DROP CONSTRAINT IF EXISTS mentor_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS lessons_pkey;
ALTER TABLE IF EXISTS ONLY public.lesson_feedback DROP CONSTRAINT IF EXISTS lesson_feedback_pkey;
ALTER TABLE IF EXISTS ONLY public.lesson_completions DROP CONSTRAINT IF EXISTS lesson_completions_pkey;
ALTER TABLE IF EXISTS ONLY public.learning_sessions DROP CONSTRAINT IF EXISTS learning_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.evidence DROP CONSTRAINT IF EXISTS evidence_pkey;
ALTER TABLE IF EXISTS ONLY public.courses DROP CONSTRAINT IF EXISTS courses_pkey;
ALTER TABLE IF EXISTS ONLY public.cohorts DROP CONSTRAINT IF EXISTS cohorts_pkey;
ALTER TABLE IF EXISTS ONLY public.cohort_mentor_assignments DROP CONSTRAINT IF EXISTS cohort_mentor_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.cohort_enrollments DROP CONSTRAINT IF EXISTS cohort_enrollments_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.student_profiles;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.review_scores;
DROP TABLE IF EXISTS public.review_criteria;
DROP TABLE IF EXISTS public.progress_weight_configs;
DROP TABLE IF EXISTS public.progress_signals;
DROP TABLE IF EXISTS public.modules;
DROP TABLE IF EXISTS public.mentorship_applications;
DROP TABLE IF EXISTS public.mentor_profiles;
DROP TABLE IF EXISTS public.lessons;
DROP TABLE IF EXISTS public.lesson_feedback;
DROP TABLE IF EXISTS public.lesson_completions;
DROP TABLE IF EXISTS public.learning_sessions;
DROP TABLE IF EXISTS public.evidence;
DROP TABLE IF EXISTS public.courses;
DROP TABLE IF EXISTS public.cohorts;
DROP TABLE IF EXISTS public.cohort_mentor_assignments;
DROP TABLE IF EXISTS public.cohort_enrollments;
DROP TABLE IF EXISTS public.attendance;
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."Role";
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'STUDENT',
    'MENTOR',
    'SUPER_ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id text NOT NULL,
    "cohortId" text NOT NULL,
    "authorId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    link text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id text NOT NULL,
    "learningSessionId" text NOT NULL,
    "studentId" text NOT NULL,
    "cohortId" text NOT NULL,
    status text NOT NULL,
    "markedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "markedBy" text NOT NULL
);


--
-- Name: cohort_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cohort_enrollments (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "cohortId" text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cohort_mentor_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cohort_mentor_assignments (
    id text NOT NULL,
    "cohortId" text NOT NULL,
    "mentorProfileId" text NOT NULL
);


--
-- Name: cohorts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cohorts (
    id text NOT NULL,
    "courseId" text NOT NULL,
    name text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text[]
);


--
-- Name: evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evidence (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "lessonId" text NOT NULL,
    "cohortId" text NOT NULL,
    "evidenceType" text NOT NULL,
    "storageKey" text,
    "externalUrl" text,
    metadata jsonb NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'submitted'::text NOT NULL
);


--
-- Name: learning_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_sessions (
    id text NOT NULL,
    "lessonId" text NOT NULL,
    "deliveryType" text NOT NULL,
    "deliveryConfig" jsonb NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "durationMins" integer
);


--
-- Name: lesson_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_completions (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "lessonId" text NOT NULL,
    "cohortId" text NOT NULL,
    "completedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: lesson_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_feedback (
    id text NOT NULL,
    "lessonId" text NOT NULL,
    "cohortId" text NOT NULL,
    "studentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    responses jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id text NOT NULL,
    "moduleId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "order" integer NOT NULL,
    "assignmentsUrl" text,
    "scheduledAt" timestamp(3) without time zone,
    "submissionRequired" boolean DEFAULT false NOT NULL,
    cancelled boolean DEFAULT false NOT NULL,
    slides jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: mentor_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mentor_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    specializations text[],
    capacity integer NOT NULL
);


--
-- Name: mentorship_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mentorship_applications (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "currentRole" text,
    "targetRole" text,
    timeline text,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id text NOT NULL,
    "cohortId" text NOT NULL,
    title text NOT NULL,
    "order" integer NOT NULL
);


--
-- Name: progress_signals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progress_signals (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "cohortId" text NOT NULL,
    "signalType" text NOT NULL,
    value double precision NOT NULL,
    "computedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: progress_weight_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progress_weight_configs (
    id text NOT NULL,
    "cohortId" text NOT NULL,
    "signalType" text NOT NULL,
    weight double precision NOT NULL
);


--
-- Name: review_criteria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_criteria (
    id text NOT NULL,
    "cohortId" text NOT NULL,
    name text NOT NULL,
    weight double precision DEFAULT 1.0 NOT NULL,
    "order" integer NOT NULL
);


--
-- Name: review_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_scores (
    id text NOT NULL,
    "reviewId" text NOT NULL,
    "criterionId" text NOT NULL,
    score integer NOT NULL,
    comment text
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "evidenceId" text NOT NULL,
    "mentorId" text NOT NULL,
    "overallComment" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id text NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "firstName" text,
    "lastName" text,
    phone text,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0bfc9cc8-afd6-4970-9185-1e0e4127ba51	a7b248dee3509214dfc2c34186fa5c1dc95b5753934f3470f8c92ac8400acb4f	2026-08-11 10:22:42.42136+00	20260805050002_init	\N	\N	2026-08-11 10:22:42.019539+00	1
bbeb50c5-d165-4933-9324-6e8fe539ee61	48edb86af585dd370f8b84e550f7f3e977d3c122bf8f7567dfb566c0b1446496	2026-08-11 10:22:42.520321+00	20260806064719_migration1	\N	\N	2026-08-11 10:22:42.423271+00	1
7c3b53e9-9bd3-4645-8568-7b07627d82fe	4712f50e27bcafd912b17064b5a07ed20359968922cb7772a4e773912135eca4	2026-08-18 01:02:55.833492+00	20260817120000_move_schedule_to_lessons	\N	\N	2026-08-18 01:02:55.708584+00	1
aa7ce5e3-cb81-4457-8aa6-7deeda94c329	beb2aa02fe96499d6772db53c3c1a7d281fc88ba62f1a2ac402a309f55dbe1d9	2026-08-11 10:22:42.529808+00	20260806091150_add_lesson_material_to_shared_files	\N	\N	2026-08-11 10:22:42.522203+00	1
6b118085-4ee9-464b-880a-dc5e43ad67aa	fc349c2839ea241325699107c35ff7e67e98917c5e222fac134e835959e9a376	2026-08-11 10:22:42.616312+00	20260807112615_add_lesson_completion	\N	\N	2026-08-11 10:22:42.531775+00	1
88ac737d-addd-41ce-b676-7cab00754698	91966cddcd2967beeffd5bcc8cc5f2672029907d53ab65601132f1ca65442bc0	2026-08-11 10:22:42.623133+00	20260809180352_add_lesson_slides_url	\N	\N	2026-08-11 10:22:42.618094+00	1
8a239911-1818-465c-ac20-3b802573f48a	7af9a9a7f5698ebb48eb9cb444e83322f28d7b62a40e523cd17be583222535f9	2026-08-18 01:02:55.90835+00	20260817140000_add_lesson_submission_required	\N	\N	2026-08-18 01:02:55.890771+00	1
c857f128-4b5b-46cf-a503-e47e530c3f42	caea452c0942ac988a754206d0706295acb9600d256ed2c932a8a42ff4cf6a14	2026-08-11 10:22:42.629879+00	20260809190353_add_lesson_taught_at	\N	\N	2026-08-11 10:22:42.624903+00	1
c0c70f6c-df7e-43a2-9fd7-d3457228287e	736db5cf95448b7beac23602b57455af3b49a0239800fde0bdaaebf65348742c	2026-08-11 10:22:42.63668+00	20260809211336_add_user_name_and_phone	\N	\N	2026-08-11 10:22:42.631532+00	1
906082e4-7a39-4b33-95a7-1baabc1fcb62	9595de71fb44a30831284545d780113c3d17a6ccc358ecbcc8b3515dee14e542	2026-08-11 10:22:42.714245+00	20260809215049_add_module_schedule_and_lesson_feedback	\N	\N	2026-08-11 10:22:42.638295+00	1
ba67a295-9611-4559-ab9b-78f2056156b6	d6cd56b98d6fd92ac96dee3c653f1e88db68c0b6a40f24b4599c9a7bc390be88	2026-08-18 01:02:55.916215+00	20260817160000_derive_taught_add_cancelled	\N	\N	2026-08-18 01:02:55.910162+00	1
3ff6a196-4f19-463d-94a8-4a3a4ed13032	19c2dd91fb23bfc613fde2f4038f50966c9260f7a0f58eaa748a3e0729ae6648	2026-08-11 10:22:42.722703+00	20260809230000_simplify_feedback_one_way	\N	\N	2026-08-11 10:22:42.715984+00	1
3d654835-9f0a-4ddc-baf6-4b04217da27a	ab777e6757ebdf647fb56aa9888e8c2db2bf31356e2a0a2fe0847c4ef28ca174	2026-08-11 10:22:42.729976+00	20260810081648_add_user_is_active	\N	\N	2026-08-11 10:22:42.724547+00	1
ca9deec4-f2fa-45cf-920f-af841421a378	9359682e3d2d5b26c80c1f77782fe5f6caf004c316a2c1e7c410d673072c2f05	2026-08-11 10:22:42.73793+00	20260810105028_add_assignments_url	\N	\N	2026-08-11 10:22:42.731683+00	1
f1d07406-0841-4053-a38f-2998159df634	c0b1faa14922c4b49ac75bf2acfdf94f3a601aa9bbc3a6f7db293271b96e1148	2026-08-18 02:04:37.930198+00	20260818020435_add_mentorship_applications	\N	\N	2026-08-18 02:04:36.573496+00	1
47060f9c-6cb5-4b81-bf58-93069f4a32a1	e9e5a43a83fed26de14749a3a0ce1cfb8bd89754a4916df5657d60e613125425	2026-08-11 10:22:42.813251+00	20260811082808_add_announcements	\N	\N	2026-08-11 10:22:42.739617+00	1
cb3933c7-2c2b-4956-860b-ec72ea2fd6bc	617d415dcf7242fddaffb0f204006ed9681c01a13b761fd429fe72a1932428d8	2026-08-11 10:22:42.920233+00	20260811090000_drop_shared_files	\N	\N	2026-08-11 10:22:42.829954+00	1
46516f64-d760-4d1e-8c1d-95e59393ac52	9cd90fa8f8a656e31f6224a0a249e3f645d2269aa82608efbb744109b808503c	2026-08-18 15:00:48.61528+00	20260818145855_multiple_slides	\N	\N	2026-08-18 15:00:48.551267+00	1
bd334ddd-1d01-45ee-ab34-f64b9dee64c2	426e9427c255448af47e015b6731bd30870b2e048ac38c2bf7b60692fa74cff9	2026-09-04 12:05:19.530441+00	20260902201835_structured_feedback	\N	\N	2026-09-04 12:05:19.521841+00	1
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, "cohortId", "authorId", title, content, link, "createdAt", "updatedAt") FROM stdin;
cmsoklz180001jm01qddcyvs9	cmsojkh710007c7r8mmofhp6w	cmsojkb400000c7r8703tag1c	announcement check!!!!	123	https://drive.google.com/drive/folders/10g8M6FJY0WJfyeAE-ffPOisT4T72NY0k	2026-08-11 11:22:01.244	2026-08-11 11:22:01.244
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance (id, "learningSessionId", "studentId", "cohortId", status, "markedAt", "markedBy") FROM stdin;
\.


--
-- Data for Name: cohort_enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cohort_enrollments (id, "studentId", "cohortId", status, "enrolledAt") FROM stdin;
cmsojkkft000bc7r8dhi3zozy	cmsojkdb00002c7r8aghfrvpn	cmsojkh710007c7r8mmofhp6w	active	2026-08-11 10:52:56.058
cmsojstij000ben01nmdjebjo	cmsojsm9l0007en01chgn80hb	cmsojkh710007c7r8mmofhp6w	active	2026-08-11 10:59:21.067
cmsys8eul0004dl01uddtqor9	cmsys7jod0000dl0163mb87vk	cmsojkh710007c7r8mmofhp6w	active	2026-08-18 14:53:07.245
cmtnagb9e0004k801wu0jwlec	cmtnafxrv0000k8013m373qh0	cmsojkh710007c7r8mmofhp6w	active	2026-09-04 18:29:37.154
\.


--
-- Data for Name: cohort_mentor_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cohort_mentor_assignments (id, "cohortId", "mentorProfileId") FROM stdin;
cmsojki9x0009c7r8o1ql24d8	cmsojkh710007c7r8mmofhp6w	cmsojkb410001c7r86fwj4pgb
\.


--
-- Data for Name: cohorts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cohorts (id, "courseId", name, "startDate", "endDate") FROM stdin;
cmsojkh710007c7r8mmofhp6w	cmsojkgbo0005c7r871bb59n5	Cohort 1	2026-07-14 00:00:00	2026-10-06 00:00:00
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, title, description, category) FROM stdin;
cmsojkgbo0005c7r871bb59n5	Agentic AI	Build and ship agentic AI applications end to end.	{AI,Engineering}
\.


--
-- Data for Name: evidence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evidence (id, "studentId", "lessonId", "cohortId", "evidenceType", "storageKey", "externalUrl", metadata, "submittedAt", status) FROM stdin;
\.


--
-- Data for Name: learning_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.learning_sessions (id, "lessonId", "deliveryType", "deliveryConfig", "scheduledAt", "durationMins") FROM stdin;
\.


--
-- Data for Name: lesson_completions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lesson_completions (id, "studentId", "lessonId", "cohortId", "completedAt") FROM stdin;
\.


--
-- Data for Name: lesson_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lesson_feedback (id, "lessonId", "cohortId", "studentId", "createdAt", responses) FROM stdin;
cmtmx2job0001gy01tqa8be6s	cmsysnh0x0003lb01wo3n81hj	cmsojkh710007c7r8mmofhp6w	cmsojkdb00002c7r8aghfrvpn	2026-09-04 12:14:59.867	{"Upcoming topics": "rag", "Project heaviness": "Yes, it is very heavy", "Feedback on this class": "yes", "Suggestions for improvement": "nice "}
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lessons (id, "moduleId", title, content, "order", "assignmentsUrl", "scheduledAt", "submissionRequired", cancelled, slides) FROM stdin;
cmsysnh0x0003lb01wo3n81hj	cmsysmgb80001lb01syvap1n0	Fundamentals of Agentic AI		1	\N	2026-08-19 12:00:00	f	f	[{"url": "https://docs.google.com/presentation/d/1KieLxGTbHY0YlRpvk5BCsMCY3prAM8nq/edit?usp=drive_link&ouid=106440402676253669026&rtpof=true&sd=true", "title": "Fundamentals_ppt"}, {"url": "https://docs.google.com/presentation/d/19xgEPt3oUaYGJWQ4gu_q3B74GG3d_AFx/edit?usp=sharing&ouid=106440402676253669026&rtpof=true&sd=true", "title": "History_ai"}]
cmsysv7rm0007lb01bcwcsth9	cmsysrr5x0005lb01d88dg9hw	RAG: From Retrieval to Evaluation		1	\N	2026-08-26 13:00:00	f	f	[{"url": "https://docs.google.com/presentation/d/1HeoA8XuYw3VfqWNNLOlE7FrQP3sgGcaD/edit?usp=drive_link&ouid=106440402676253669026&rtpof=true&sd=true", "title": "RAG_ppt"}]
\.


--
-- Data for Name: mentor_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mentor_profiles (id, "userId", specializations, capacity) FROM stdin;
cmsojkb410001c7r86fwj4pgb	cmsojkb400000c7r8703tag1c	{"Agentic AI"}	20
cmsomyu0s0007h301bsdwghhq	cmsojkdb00002c7r8aghfrvpn	{}	20
\.


--
-- Data for Name: mentorship_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mentorship_applications (id, name, email, "currentRole", "targetRole", timeline, status, "createdAt") FROM stdin;
cmsy0wjdc0000mm01xy3rrebp	Adamya jain	adamyajain1309@gmail.com	n/a	n/a	na	pending	2026-08-18 02:08:03.601
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.modules (id, "cohortId", title, "order") FROM stdin;
cmsysmgb80001lb01syvap1n0	cmsojkh710007c7r8mmofhp6w	Fundamentals of Agentic AI	1
cmsysrr5x0005lb01d88dg9hw	cmsojkh710007c7r8mmofhp6w	Retrieval Augmented Generation (RAG)	2
cmsysxlec0009lb01icip7tzt	cmsojkh710007c7r8mmofhp6w	Module 3	3
cmsysxr1k000blb01ofwwms6b	cmsojkh710007c7r8mmofhp6w	Module 4	4
cmsysxvg9000dlb01nv9esbep	cmsojkh710007c7r8mmofhp6w	Module 5	5
cmsysy0ci000flb012qintrb2	cmsojkh710007c7r8mmofhp6w	Module 6	6
cmsysy4v6000hlb01x6p16hqx	cmsojkh710007c7r8mmofhp6w	Module 7	7
cmsysy989000jlb016bt8wrgn	cmsojkh710007c7r8mmofhp6w	Module 8	8
cmsysyipb000llb0116v8rpwz	cmsojkh710007c7r8mmofhp6w	Module 9	9
cmsysyrhr000nlb013ex8pr0e	cmsojkh710007c7r8mmofhp6w	Module 10	10
cmsysywg5000plb01nagql1d0	cmsojkh710007c7r8mmofhp6w	Module 11	11
cmsysz0x6000rlb012dzg5dy1	cmsojkh710007c7r8mmofhp6w	Module 12	12
\.


--
-- Data for Name: progress_signals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.progress_signals (id, "studentId", "cohortId", "signalType", value, "computedAt") FROM stdin;
\.


--
-- Data for Name: progress_weight_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.progress_weight_configs (id, "cohortId", "signalType", weight) FROM stdin;
\.


--
-- Data for Name: review_criteria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_criteria (id, "cohortId", name, weight, "order") FROM stdin;
\.


--
-- Data for Name: review_scores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_scores (id, "reviewId", "criterionId", score, comment) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, "evidenceId", "mentorId", "overallComment", "createdAt") FROM stdin;
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_profiles (id, "userId") FROM stdin;
cmsojkdb00003c7r83us70bvi	cmsojkdb00002c7r8aghfrvpn
cmsojsm9n0009en01ui5bbzko	cmsojsm9l0007en01chgn80hb
cmsomyxic0009h301i2df5sx6	cmsojkb400000c7r8703tag1c
cmsys7jog0002dl014dy60zb3	cmsys7jod0000dl0163mb87vk
cmtnafxry0002k801s1hbg03t	cmtnafxrv0000k8013m373qh0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, "passwordHash", role, "createdAt", "firstName", "lastName", phone, "isActive") FROM stdin;
cmsojkb400000c7r8703tag1c	mentor@careerrise.dev	$2a$10$ofpjimrgkv7th.gW6Zu5q.XYwdXZlgiQeya8uKh.LpgySdISgxl/m	MENTOR	2026-08-11 10:52:43.961	\N	\N	\N	t
cmsojket60004c7r8dpdyzpoe	admin@careerrise.dev	$2a$10$ofpjimrgkv7th.gW6Zu5q.XYwdXZlgiQeya8uKh.LpgySdISgxl/m	SUPER_ADMIN	2026-08-11 10:52:48.762	\N	\N	\N	t
cmsojkdb00002c7r8aghfrvpn	student@careerrise.dev	$2a$10$ofpjimrgkv7th.gW6Zu5q.XYwdXZlgiQeya8uKh.LpgySdISgxl/m	STUDENT	2026-08-11 10:52:46.812	\N	\N	\N	t
cmsojsm9l0007en01chgn80hb	adamyajain1309@gmail.com	$2a$10$lLwgGrv4muQOJohYLE0pV.sY9THJ/or5Q5u.K88VHmVs4wUppQdUa	SUPER_ADMIN	2026-08-11 10:59:11.674	Adamya	jain	07389 358793	t
cmsys7jod0000dl0163mb87vk	jainadamya13@gmail.com	$2a$10$UTeizOOcdBwob3WdvmgyA.eToI4bpB8YUjfkdmOVJ03j5Y4.SKGs6	STUDENT	2026-08-18 14:52:26.845	Adamya	jain	07389 358793	t
cmtnafxrv0000k8013m373qh0	akshaysharma.iimk@gmail.com	$2a$10$pZ13rREoeoNM7zB9oSWNeeU6FnxvkCz3/.tJaVZkKzt4MazQkPz32	STUDENT	2026-09-04 18:29:19.675	Akshay	Sharma	\N	t
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: cohort_enrollments cohort_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohort_enrollments
    ADD CONSTRAINT cohort_enrollments_pkey PRIMARY KEY (id);


--
-- Name: cohort_mentor_assignments cohort_mentor_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohort_mentor_assignments
    ADD CONSTRAINT cohort_mentor_assignments_pkey PRIMARY KEY (id);


--
-- Name: cohorts cohorts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: evidence evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT evidence_pkey PRIMARY KEY (id);


--
-- Name: learning_sessions learning_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions
    ADD CONSTRAINT learning_sessions_pkey PRIMARY KEY (id);


--
-- Name: lesson_completions lesson_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_completions
    ADD CONSTRAINT lesson_completions_pkey PRIMARY KEY (id);


--
-- Name: lesson_feedback lesson_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_feedback
    ADD CONSTRAINT lesson_feedback_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: mentor_profiles mentor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentor_profiles
    ADD CONSTRAINT mentor_profiles_pkey PRIMARY KEY (id);


--
-- Name: mentorship_applications mentorship_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentorship_applications
    ADD CONSTRAINT mentorship_applications_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: progress_signals progress_signals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress_signals
    ADD CONSTRAINT progress_signals_pkey PRIMARY KEY (id);


--
-- Name: progress_weight_configs progress_weight_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress_weight_configs
    ADD CONSTRAINT progress_weight_configs_pkey PRIMARY KEY (id);


--
-- Name: review_criteria review_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_criteria
    ADD CONSTRAINT review_criteria_pkey PRIMARY KEY (id);


--
-- Name: review_scores review_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_scores
    ADD CONSTRAINT review_scores_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: announcements_cohortId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "announcements_cohortId_createdAt_idx" ON public.announcements USING btree ("cohortId", "createdAt");


--
-- Name: attendance_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "attendance_cohortId_idx" ON public.attendance USING btree ("cohortId");


--
-- Name: attendance_learningSessionId_studentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "attendance_learningSessionId_studentId_key" ON public.attendance USING btree ("learningSessionId", "studentId");


--
-- Name: attendance_studentId_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "attendance_studentId_cohortId_idx" ON public.attendance USING btree ("studentId", "cohortId");


--
-- Name: cohort_enrollments_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cohort_enrollments_cohortId_idx" ON public.cohort_enrollments USING btree ("cohortId");


--
-- Name: cohort_enrollments_studentId_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cohort_enrollments_studentId_cohortId_idx" ON public.cohort_enrollments USING btree ("studentId", "cohortId");


--
-- Name: cohort_mentor_assignments_cohortId_mentorProfileId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cohort_mentor_assignments_cohortId_mentorProfileId_key" ON public.cohort_mentor_assignments USING btree ("cohortId", "mentorProfileId");


--
-- Name: cohorts_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cohorts_courseId_idx" ON public.cohorts USING btree ("courseId");


--
-- Name: evidence_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "evidence_cohortId_idx" ON public.evidence USING btree ("cohortId");


--
-- Name: evidence_studentId_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "evidence_studentId_cohortId_idx" ON public.evidence USING btree ("studentId", "cohortId");


--
-- Name: learning_sessions_lessonId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "learning_sessions_lessonId_idx" ON public.learning_sessions USING btree ("lessonId");


--
-- Name: lesson_completions_studentId_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lesson_completions_studentId_cohortId_idx" ON public.lesson_completions USING btree ("studentId", "cohortId");


--
-- Name: lesson_completions_studentId_lessonId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "lesson_completions_studentId_lessonId_key" ON public.lesson_completions USING btree ("studentId", "lessonId");


--
-- Name: lesson_feedback_cohortId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lesson_feedback_cohortId_createdAt_idx" ON public.lesson_feedback USING btree ("cohortId", "createdAt");


--
-- Name: lesson_feedback_lessonId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lesson_feedback_lessonId_idx" ON public.lesson_feedback USING btree ("lessonId");


--
-- Name: lessons_moduleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lessons_moduleId_idx" ON public.lessons USING btree ("moduleId");


--
-- Name: mentor_profiles_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "mentor_profiles_userId_key" ON public.mentor_profiles USING btree ("userId");


--
-- Name: modules_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "modules_cohortId_idx" ON public.modules USING btree ("cohortId");


--
-- Name: progress_signals_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "progress_signals_cohortId_idx" ON public.progress_signals USING btree ("cohortId");


--
-- Name: progress_signals_studentId_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "progress_signals_studentId_cohortId_idx" ON public.progress_signals USING btree ("studentId", "cohortId");


--
-- Name: progress_weight_configs_cohortId_signalType_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "progress_weight_configs_cohortId_signalType_key" ON public.progress_weight_configs USING btree ("cohortId", "signalType");


--
-- Name: review_criteria_cohortId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "review_criteria_cohortId_idx" ON public.review_criteria USING btree ("cohortId");


--
-- Name: review_scores_reviewId_criterionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "review_scores_reviewId_criterionId_key" ON public.review_scores USING btree ("reviewId", "criterionId");


--
-- Name: reviews_evidenceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "reviews_evidenceId_key" ON public.reviews USING btree ("evidenceId");


--
-- Name: student_profiles_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "student_profiles_userId_key" ON public.student_profiles USING btree ("userId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: announcements announcements_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: announcements announcements_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "announcements_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_learningSessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_learningSessionId_fkey" FOREIGN KEY ("learningSessionId") REFERENCES public.learning_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_markedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendance attendance_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cohort_enrollments cohort_enrollments_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohort_enrollments
    ADD CONSTRAINT "cohort_enrollments_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cohort_enrollments cohort_enrollments_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohort_enrollments
    ADD CONSTRAINT "cohort_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cohort_mentor_assignments cohort_mentor_assignments_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohort_mentor_assignments
    ADD CONSTRAINT "cohort_mentor_assignments_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cohort_mentor_assignments cohort_mentor_assignments_mentorProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohort_mentor_assignments
    ADD CONSTRAINT "cohort_mentor_assignments_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES public.mentor_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cohorts cohorts_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT "cohorts_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evidence evidence_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT "evidence_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evidence evidence_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT "evidence_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.lessons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evidence evidence_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence
    ADD CONSTRAINT "evidence_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: learning_sessions learning_sessions_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_sessions
    ADD CONSTRAINT "learning_sessions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.lessons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lesson_completions lesson_completions_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_completions
    ADD CONSTRAINT "lesson_completions_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lesson_completions lesson_completions_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_completions
    ADD CONSTRAINT "lesson_completions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.lessons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lesson_completions lesson_completions_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_completions
    ADD CONSTRAINT "lesson_completions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lesson_feedback lesson_feedback_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_feedback
    ADD CONSTRAINT "lesson_feedback_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lesson_feedback lesson_feedback_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_feedback
    ADD CONSTRAINT "lesson_feedback_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public.lessons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lesson_feedback lesson_feedback_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_feedback
    ADD CONSTRAINT "lesson_feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lessons lessons_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mentor_profiles mentor_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mentor_profiles
    ADD CONSTRAINT "mentor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: modules modules_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT "modules_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progress_signals progress_signals_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress_signals
    ADD CONSTRAINT "progress_signals_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progress_signals progress_signals_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress_signals
    ADD CONSTRAINT "progress_signals_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progress_weight_configs progress_weight_configs_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress_weight_configs
    ADD CONSTRAINT "progress_weight_configs_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review_criteria review_criteria_cohortId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_criteria
    ADD CONSTRAINT "review_criteria_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES public.cohorts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review_scores review_scores_criterionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_scores
    ADD CONSTRAINT "review_scores_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES public.review_criteria(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review_scores review_scores_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_scores
    ADD CONSTRAINT "review_scores_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public.reviews(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_evidenceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES public.evidence(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_mentorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_profiles student_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict VYOSqF5HfIR8G7KMcnpo61tulep3n1RwaLIlCZ6L48I0Ghah9u3oXXviE8skYEo

