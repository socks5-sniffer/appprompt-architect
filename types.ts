export enum AppStep {
  BASICS = 0,
  TECH_STACK = 1,
  FEATURES = 2,
  CONSTRAINTS = 3,
  REVIEW = 4,
  RESULT = 5
}

export enum ProjectType {
  WEB_APP = 'Web Application',
  MOBILE_APP = 'Mobile Application',
  API_SERVICE = 'API Service',
  CLI_TOOL = 'CLI Tool',
  GAME = 'Game',
  OTHER = 'Other'
}

export type AIProvider = 'gemini' | 'claude' | 'openai';

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  styling: string;
  deployment: string;
  tools: string[];
}

export interface WizardData {
  projectName: string;
  projectDescription: string;
  projectType: ProjectType;
  targetAudience: string;
  techStack: TechStack;
  coreFeatures: string[];
  securityReqs: string;
  securitySpecifics: string;
  designPreferences: string;
  performanceReqs: string;
}

export const INITIAL_DATA: WizardData = {
  projectName: '',
  projectDescription: '',
  projectType: ProjectType.WEB_APP,
  targetAudience: '',
  techStack: {
    frontend: '',
    backend: '',
    database: '',
    styling: '',
    deployment: '',
    tools: []
  },
  coreFeatures: [],
  securityReqs: '',
  securitySpecifics: '',
  designPreferences: '',
  performanceReqs: ''
};
