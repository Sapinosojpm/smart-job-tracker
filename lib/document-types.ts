export type DocType = 'resume' | 'cover-letter';

export type ResumeExperience = {
  title: string;
  company: string;
  date: string;
  bullets: string[];
};

export type ResumeProject = {
  name: string;
  link: string;
  bullets: string[];
};

export type ResumeEducation = {
  degree: string;
  school: string;
  date: string;
};

export type ResumeData = {
  fullName: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  summary: string;
  skills: Record<string, string>;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
};

export type LetterData = {
  recipient: string;
  company: string;
  role: string;
  jobDescription: string;
  content: string;
  salary?: string;
  hoursPerWeek?: string;
  workType?: string;
};
