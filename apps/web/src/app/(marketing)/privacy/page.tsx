import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Eye, FileText, Database, UserCheck, Bell } from "lucide-react";
import { PageHeader } from "@/features/marketing/components/page-header";
import { Reveal } from "@/components/common/reveal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Career Rise collects, uses, and safeguards your personal and learning data.",
};

const keyPrinciples = [
  {
    icon: Lock,
    title: "Data Protection First",
    description:
      "We apply industry-standard encryption, secure session tokens, and strict access controls to keep your data safe.",
  },
  {
    icon: Eye,
    title: "No Data Selling",
    description:
      "We never sell, rent, or monetize your personal information or coursework to third-party advertisers.",
  },
  {
    icon: UserCheck,
    title: "You Own Your Work",
    description:
      "Your project submissions, code repositories, and portfolio evidence remain your intellectual property.",
  },
];

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 1, 2026";

  return (
    <>
      <PageHeader
        eyebrow="Legal & Privacy"
        title="Privacy Policy"
        description="At Career Rise (by iAgentLabs), we are committed to protecting your privacy and being transparent about how your data is handled."
      />

      {/* Highlight Cards */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {keyPrinciples.map((item, i) => (
              <Reveal key={item.title} delay={0.05 * i} className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4.5" />
                </span>
                <h3 className="mt-3 text-base font-medium text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Main Policy Content */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="prose prose-neutral dark:prose-invert max-w-none space-y-12 text-foreground/90">
            <div className="text-xs text-muted-foreground">
              <span>Last updated: {lastUpdated}</span> • <span>Governing Jurisdiction: India</span>
            </div>

            {/* 1. Introduction */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="size-6 text-primary shrink-0" />
                1. Introduction & Scope
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This Privacy Policy describes how <strong>iAgentLabs</strong> ("Career Rise", "we", "us", or "our"), 
                operating in India, collects, uses, stores, and protects personal information obtained from learners, 
                mentors, and visitors ("you" or "User") through our cohort-based learning platform, website, and related services 
                (collectively, the "Platform").
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                By registering for an account, applying for mentorship, or browsing Career Rise, you acknowledge that you have 
                read, understood, and agreed to the practices outlined in this policy.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Database className="size-6 text-primary shrink-0" />
                2. Information We Collect
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We collect information you provide directly, as well as data generated automatically during your use of the Platform:
              </p>
              
              <div className="space-y-3 pl-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">A. Account & Profile Information</h3>
                  <p className="text-sm text-muted-foreground">
                    When you register or update your account, we collect your first name, last name, email address, phone number (optional), 
                    role (<code className="text-xs bg-muted px-1 py-0.5 rounded">Student</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">Mentor</code>, or <code className="text-xs bg-muted px-1 py-0.5 rounded">Admin</code>), 
                    and authentication credentials. For mentors, we also collect technical specializations, experience, and mentoring capacity.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">B. 1:1 Mentorship Application Data</h3>
                  <p className="text-sm text-muted-foreground">
                    When submitting a mentorship application, we collect your name, email, current employment role, target career role, 
                    and preferred timeline to evaluate match readiness.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">C. Coursework & Educational Evidence</h3>
                  <p className="text-sm text-muted-foreground">
                    To facilitate cohort learning, we collect and store:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 mt-1 space-y-1">
                    <li>Project submissions and links (e.g., GitHub repositories, Figma designs, Google Drive folders, PDF documents, video recordings).</li>
                    <li>Attendance records for scheduled live webinars and classroom sessions.</li>
                    <li>Lesson and module completion milestones.</li>
                    <li>Mentor evaluations, rubric scores, review comments, and student feedback responses.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">D. Technical & Log Data</h3>
                  <p className="text-sm text-muted-foreground">
                    We automatically record connection details such as IP address, browser type, operating system, device metadata, 
                    and session timestamps to maintain session security and diagnose technical errors.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. How We Use Your Information */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="size-6 text-primary shrink-0" />
                3. How We Use Your Information
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We use the data collected strictly for legitimate educational, operational, and security purposes:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1.5">
                <li><strong>Deliver Cohort Education:</strong> Granting course access, managing enrollments, and tracking learning progress signals.</li>
                <li><strong>Facilitate Mentorship & Reviews:</strong> Enabling mentors to review submitted assignments, assign rubric scores, and deliver constructive feedback.</li>
                <li><strong>Application Review:</strong> Processing admissions for cohorts and matching students with specialized mentors.</li>
                <li><strong>Communications:</strong> Sending cohort announcements, schedule updates, assignment reminders, and essential account notifications.</li>
                <li><strong>Platform Security:</strong> Authenticating user logins with secure tokens, detecting fraudulent activity, and enforcing access controls.</li>
              </ul>
            </div>

            {/* 4. Data Sharing & Disclosures */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <UserCheck className="size-6 text-primary shrink-0" />
                4. How Data is Shared
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We believe in strict data containment. Your personal data is never sold, traded, or rented to third-party marketers. Data is only shared in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1.5">
                <li><strong>With Mentors & Instructors:</strong> Mentors assigned to your cohort have access to your submissions, attendance, and feedback to evaluate your progress.</li>
                <li><strong>Cohort Peers:</strong> Group learning activities and cohort-wide announcements may display your profile name and shared discussions within your private cohort group.</li>
                <li><strong>Essential Service Providers:</strong> Trusted third-party cloud infrastructure (database hosting, caching, transactional email delivery) under strict data protection agreements.</li>
                <li><strong>Legal Compliance:</strong> When required to comply with applicable laws, court orders, or lawful government requests in India or relevant jurisdictions.</li>
              </ul>
            </div>

            {/* 5. Data Security & Storage */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Lock className="size-6 text-primary shrink-0" />
                5. Data Security & Retention
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We implement robust technical and organizational measures to safeguard your personal information:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1.5">
                <li>Passwords are hashed using industry-standard <code>bcrypt</code> algorithms and are never stored in plaintext.</li>
                <li>API communication and platform access occur strictly over encrypted HTTPS/TLS connections.</li>
                <li>Authentication is managed using secure JSON Web Tokens (JWT) with restricted lifespan.</li>
                <li>Access to administrative functions is strictly governed by role-based authorization controls.</li>
              </ul>
              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                We retain your account and academic history for as long as your account remains active to provide continuous access to your course history and evidence of completion. You may request account deactivation or data erasure at any time.
              </p>
            </div>

            {/* 6. Your Rights & Choices */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Eye className="size-6 text-primary shrink-0" />
                6. Your Rights & Choices
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Under applicable Indian data privacy regulations (including the Information Technology Act and the Digital Personal Data Protection Act) as well as global privacy principles, you have the right to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground pl-2 space-y-1.5">
                <li><strong>Access:</strong> Request confirmation of whether your personal data is being processed and obtain a copy.</li>
                <li><strong>Correction:</strong> Update or rectify incomplete or inaccurate profile information directly via your settings or by contacting us.</li>
                <li><strong>Erasure:</strong> Request the deletion or deactivation of your account and personal records.</li>
                <li><strong>Withdrawal of Consent:</strong> Opt out of non-essential communications or withdraw consent for data processing at any time.</li>
              </ul>
            </div>

            {/* 7. Cookies & Local Storage */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Database className="size-6 text-primary shrink-0" />
                7. Cookies & Session Storage
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Career Rise uses essential cookies and local storage mechanisms solely for authentication, session continuity, 
                and remembering your user preferences. We do not use intrusive cross-site tracking or advertising cookies.
              </p>
            </div>

            {/* 8. Age Requirements & Children's Privacy */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="size-6 text-primary shrink-0" />
                8. Children's Privacy
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our Platform is intended for university students, professionals, and individuals aged 16 years and older. 
                We do not knowingly collect or solicit personal data from children under the age of 16. If we become aware that 
                we have collected personal data from a child under 16 without verified parental consent, we will promptly delete that data.
              </p>
            </div>

            {/* 9. Changes to This Policy */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Bell className="size-6 text-primary shrink-0" />
                9. Changes to This Policy
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect modifications in our platform features or relevant legal requirements. 
                When updates are made, we will update the "Last updated" date at the top of this page. Significant changes may also be communicated via 
                email or a platform announcement.
              </p>
            </div>

            {/* 10. Contact Us */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-6 sm:p-8 space-y-3">
              <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                <Mail className="size-5 text-primary" />
                10. Contact Us & Grievance Redressal
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have any questions, concerns, or requests regarding this Privacy Policy, your personal data, or wish to exercise any of your privacy rights, please reach out to us:
              </p>
              <div className="text-sm text-foreground pt-2 space-y-1">
                <p><strong>Entity:</strong> iAgentLabs (Career Rise)</p>
                <p><strong>Jurisdiction:</strong> India</p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:hello@iagentlabs.com" className="font-medium text-primary hover:underline">
                    hello@iagentlabs.com
                  </a>
                </p>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Have general platform questions? You can also reach our team via our{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Page
                </Link>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
