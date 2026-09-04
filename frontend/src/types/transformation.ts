export type OutputType =
  | "presentation"
  | "executive_summary"
  | "advisory"
  | "infographic"
  | "video_package"
  | "social_post";

export interface SocialConfig {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'newsletter';
  tone: 'thought_leadership' | 'punchy_viral' | 'official_pr' | 'technical_breakdown';
  persona: 'c_suite' | 'developers' | 'general_public';
  format: 'single_post' | 'thread';
}

export interface TransformationParams {
  audience: string;
  tone: string;
  language: string;
  detail_level: string;
  objective: string;
  style: string;
  custom_instructions?: string;
  social_config?: SocialConfig;
}

export interface TransformationCreatePayload extends TransformationParams {
  session_id: string;
  source_document_id?: string;
  cco_version_id?: string;
  output_types: OutputType[];
}

export interface TransformationStatusItem {
  transformation_id: string;
  status: "QUEUED" | "PROCESSING" | "GENERATING" | "VERIFYING" | "RENDERING" | "COMPLETED" | "FAILED" | "REVIEW_REQUIRED";
  progress_percentage: number;
  message?: string;
  artifacts?: any[];
}
