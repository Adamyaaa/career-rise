export interface ProCurriculumTemplateSession {
  weekNumber: number;
  title: string;
  format: string;
  mentorType: "senior_mentor" | "senior_specialist";
  durationMins: number;
}

export const PRO_12_WEEK_CURRICULUM: ProCurriculumTemplateSession[] = [
  {
    weekNumber: 1,
    title: "Kickoff: career audit, positioning, 12-week plan",
    format: "1:1 with your senior mentor, 75 min",
    mentorType: "senior_mentor",
    durationMins: 75,
  },
  {
    weekNumber: 2,
    title: "Resume + LinkedIn overhaul",
    format: "1:1 with senior specialist, revised documents delivered",
    mentorType: "senior_specialist",
    durationMins: 60,
  },
  {
    weekNumber: 3,
    title: "Portfolio and profile deep dive",
    format: "1:1 with senior specialist",
    mentorType: "senior_specialist",
    durationMins: 60,
  },
  {
    weekNumber: 4,
    title: "Positioning and senior-role narrative",
    format: "1:1 with your senior mentor, 75 min",
    mentorType: "senior_mentor",
    durationMins: 75,
  },
  {
    weekNumber: 5,
    title: "Domain session #1: senior-role preparation",
    format: "1:1 with senior specialist",
    mentorType: "senior_specialist",
    durationMins: 60,
  },
  {
    weekNumber: 6,
    title: "Application strategy and target-company selection",
    format: "1:1 with your senior mentor, 75 min",
    mentorType: "senior_mentor",
    durationMins: 75,
  },
  {
    weekNumber: 7,
    title: "Mock interview #1: behavioural",
    format: "1:1 with senior specialist, written feedback",
    mentorType: "senior_specialist",
    durationMins: 60,
  },
  {
    weekNumber: 8,
    title: "Midpoint recalibration",
    format: "1:1 with your senior mentor, 75 min",
    mentorType: "senior_mentor",
    durationMins: 75,
  },
  {
    weekNumber: 9,
    title: "Domain session #2: technical and leadership scenarios",
    format: "1:1 with senior specialist",
    mentorType: "senior_specialist",
    durationMins: 60,
  },
  {
    weekNumber: 10,
    title: "Mock interview #2: domain and technical",
    format: "1:1 with senior specialist, written feedback",
    mentorType: "senior_specialist",
    durationMins: 60,
  },
  {
    weekNumber: 11,
    title: "Offer strategy and negotiation coaching",
    format: "1:1 with your senior mentor, 75 min",
    mentorType: "senior_mentor",
    durationMins: 75,
  },
  {
    weekNumber: 12,
    title: "Close: transition strategy, 90-day plan in the new role",
    format: "1:1 with your senior mentor, 75 min",
    mentorType: "senior_mentor",
    durationMins: 75,
  },
];
