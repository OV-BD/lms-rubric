
import type { RubricCategory } from './types';

export const PLATFORMS = ['KnowBe4', 'Kognics.ai', 'Cypher', 'Kaltura', 'Other'];

export const RUBRIC_CATEGORIES: RubricCategory[] = [
  {
    id: 'scalability',
    name: 'Scalability & User Management',
    weight: 0.20,
    items: [
      { id: 'user_group_management', description: 'Ease of creating, managing, and assigning users to specific groups/departments for targeted training. Ability to handle high user rotation efficiently.' },
      { id: 'scalability_high_rotation', description: 'Ability to scale user licenses up/down seamlessly and cost-effectively to accommodate high employee turnover without financial penalty.' },
      { id: 'learning_paths_curricula', description: 'Ability to create structured learning paths, course curricula, and development roadmaps beyond basic single-course assignments.' },
      { id: 'mobile_learning_experience', description: 'Availability and quality of mobile app/responsive design for learners to access content on various devices.' },
      { id: 'language_localization', description: 'Support for multiple languages for both content and platform interface.' },
    ],
  },
  {
    id: 'authoring_content',
    name: 'Authoring & Content Creation',
    weight: 0.25,
    items: [
      { id: 'content_variety_interactivity', description: 'Ability to incorporate diverse media (video, audio, text, images), interactive elements (quizzes, simulations, drag-and-drop, branching scenarios), and dynamic content that adapts to user input.' },
      { id: 'ease_of_use_authoring', description: 'How intuitive and user-friendly the authoring interface is for non-technical content creators. Minimal learning curve.' },
      { id: 'customization_branding', description: 'Flexibility to customize content look & feel, add branding (logos, colors), and tailor modules to organizational specifics (beyond phishing templates).' },
      { id: 'accessibility_features', description: 'Features supporting learners with disabilities (e.g., closed captions, screen reader compatibility, keyboard navigation).' },
    ],
  },
  {
    id: 'learning_engagement',
    name: 'Learning Experience & Engagement',
    weight: 0.20,
    items: [
      { id: 'gamification_features', description: 'Robustness and effectiveness of gamification elements (badges, leaderboards, points, rewards) in motivating and sustaining learner engagement.' },
      { id: 'personalized_learning', description: 'Ability to deliver personalized learning experiences, recommendations, and adaptive learning paths based on individual needs and progress.' },
      { id: 'feedback_mechanisms', description: 'Effectiveness of real-time feedback, interactive assessments, and other mechanisms to reinforce learning and provide insights.' },
      { id: 'collaboration_features', description: 'Support for collaborative learning (e.g., group discussions, peer-to-peer interaction).' },
    ],
  },
  {
    id: 'integrations',
    name: 'Integrations & Ecosystem',
    weight: 0.15,
    items: [
      { id: 'sso_integration', description: 'Ease and robustness of Single Sign-On (SSO) integration with our existing identity providers (e.g., Google Workspace).' },
      { id: 'hr_crm_integration', description: 'Seamless integration with HRIS and CRM systems for user data synchronization and holistic business insights.' },
      { id: 'api_extensibility', description: 'Availability and quality of APIs for custom integrations and data exchange with other internal systems.' },
    ],
  },
  {
    id: 'data_analytics',
    name: 'Data Analytics & Business Impact',
    weight: 0.20,
    items: [
      { id: 'impact_measurement', description: 'Ability to tie content performance and learning outcomes to tangible business goals and real-life scenarios (e.g., sales uplift, reduced incidents, improved productivity).' },
      { id: 'custom_reporting', description: 'Flexibility to create custom reports, dashboards, and visualize data beyond standard pre-built reports.' },
      { id: 'predictive_analytics', description: 'Use of AI/ML for predictive insights (e.g., identifying at-risk learners, forecasting training needs, predicting business impact).' },
      { id: 'data_exportability', description: 'Ease of exporting raw and processed data for external analysis and warehousing.' },
    ],
  },
];
