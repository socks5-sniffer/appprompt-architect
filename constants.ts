import { ProjectType } from './types';

export const POPULAR_STACKS = {
  MODERN_REACT: {
    name: "Modern React (T3-ish)",
    frontend: "React 18+, TypeScript, Vite",
    backend: "Next.js API Routes or Node.js/Express",
    database: "PostgreSQL with Prisma",
    styling: "Tailwind CSS",
    deployment: "Vercel / Railway",
    tools: ["Zod", "React Query", "Lucide Icons"]
  },
  FIREBASE_SERVERLESS: {
    name: "Serverless Firebase",
    frontend: "React (Vite) / Vue",
    backend: "Firebase Cloud Functions",
    database: "Cloud Firestore",
    styling: "Tailwind CSS",
    deployment: "Firebase Hosting",
    tools: ["Firebase Auth", "Firebase Storage", "Cloud Functions"]
  },
  MERN: {
    name: "MERN Stack",
    frontend: "React, Redux",
    backend: "Node.js, Express",
    database: "MongoDB with Mongoose",
    styling: "Styled Components",
    deployment: "Heroku / AWS",
    tools: ["JWT", "Axios"]
  },
  PYTHON_DATA: {
    name: "Python Data/AI App",
    frontend: "Streamlit or React",
    backend: "FastAPI or Flask",
    database: "PostgreSQL / Vector DB",
    styling: "Tailwind CSS",
    deployment: "Docker / GCP",
    tools: ["Pandas", "PyTorch", "LangChain"]
  }
};

export const TYPE_SUGGESTIONS: Record<ProjectType, string[]> = {
  [ProjectType.WEB_APP]: ["React", "Vue", "Next.js", "Angular", "Svelte"],
  [ProjectType.MOBILE_APP]: ["React Native", "Flutter", "SwiftUI", "Kotlin"],
  [ProjectType.API_SERVICE]: ["Node.js", "Go", "Python (FastAPI)", "Rust"],
  [ProjectType.CLI_TOOL]: ["Rust", "Go", "Node.js (Oclif)", "Python (Click)"],
  [ProjectType.GAME]: ["Unity", "Godot", "Phaser.js", "Unreal Engine"],
  [ProjectType.OTHER]: ["Custom Stack"]
};

export const TECH_FIELD_SUGGESTIONS = {
  frontend: ["React", "Vue", "Angular", "Svelte"],
  backend: ["Node.js", "Django", "Ruby on Rails", "Spring", "Firebase Functions"],
  database: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Cloud Firestore"],
  deployment: ["Vercel", "Netlify", "AWS", "Heroku", "Docker", "Firebase Hosting"],
  styling: ["Tailwind CSS", "Material UI", "Bootstrap", "Styled Components", "CSS Modules"]
};

export const SECURITY_CHECKLIST = [
  "OWASP Top 10 Compliance",
  "JWT Authentication",
  "Role-Based Access Control (RBAC)",
  "Data Encryption at Rest/Transit",
  "Rate Limiting",
  "Input Validation (Zod/Joi)"
];

export const SPRING_BOOT_SECURITY_REQS = `Spring Boot Security Standards:
- Core Framework: Mandate the use of Spring Security for all authentication and authorization logic.
- Filter Chain Integrity: Require configuration of the Security Filter Chain to ensure automatic protection against CSRF (for session-based apps), Session Fixation, and Clickjacking (via header configuration).
- Granular Authorization: Implement Method-Level Security using @PreAuthorize and/or @PostAuthorize annotations to enforce fine-grained Role-Based Access Control (RBAC).
- Password Encoder: Explicitly configure a PasswordEncoder bean using Argon2id (or BCrypt as the minimum acceptable standard).
- Endpoint Hardening: Secure all Spring Actuator endpoints with appropriate authentication and authorization.`;

export const POSTGRES_RLS_REQS = `PostgreSQL / Supabase Security Standards (RLS):
- Data Isolation: Mandate that Row-Level Security (RLS) must be enabled on all tables containing user-specific or sensitive data.
- Policy Implementation: Policies must be defined to enforce strict data isolation (e.g., a user can only select/update/delete rows where tenant_id or user_id matches the session context).
- Bypass Prevention: Ensure that access to the database is restricted to a single role that is NOT a superuser and does NOT have the BYPASSRLS privilege, forcing the application to adhere to all policies.`;

export const FIREBASE_SECURITY_REQS = `Firebase / Firestore Security Standards:
- Firestore Rules: Mandate strict granular Security Rules for Firestore to prevent unauthorized read/write access. Use 'request.auth != null' for authenticated access and validate data schemas.
- Firebase Auth: Enforce email verification and strong password policies via Firebase Auth settings.
- Cloud Functions: Ensure all Cloud Functions are protected with appropriate CORS settings and use 'context.auth' to verify the caller's identity.
- Data Validation: Use Security Rules to enforce data integrity (e.g., verifying field types and existence).`;

export const IAP_VALIDATION_REQS = `In-App Purchase (IAP) Validation Requirements:
- Mandate server-side receipt validation for all In-App Purchases (IAPs).
- The backend must forward the receipt received from the Unity client to the respective platform's API (Apple App Store / Google Play Store) to verify its authenticity and uniqueness before granting any in-game items or currency.
- This prevents "cracked" or replay attacks.`;

export const COMMON_FEATURES = [
  "User Authentication (Social/Email)",
  "Dark/Light Mode Toggle",
  "Payment Gateway (Stripe/PayPal)",
  "Real-time Notifications",
  "Search & Filtering",
  "File Upload & Storage",
  "Admin Dashboard",
  "Analytics Dashboard",
  "Multi-language Support (i18n)",
  "Activity Logging / Audit Trails"
];