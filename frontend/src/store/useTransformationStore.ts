import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { OutputType, TransformationParams, TransformationStatusItem, SocialConfig } from "@/types/transformation";

interface TransformationStoreState {
  selectedOutputTypes: OutputType[];
  params: TransformationParams;
  socialConfig: SocialConfig;
  currentTransformation: TransformationStatusItem | null;
  
  toggleOutputType: (type: OutputType) => void;
  setParams: (params: Partial<TransformationParams>) => void;
  setSocialConfig: (config: Partial<SocialConfig>) => void;
  setCurrentTransformation: (transformation: TransformationStatusItem | null) => void;
  resetPlanner: () => void;
}

export const useTransformationStore = create<TransformationStoreState>()(
  devtools(
    (set) => ({
      selectedOutputTypes: ["executive_summary", "presentation", "advisory"],
      params: {
        audience: "senior leadership",
        tone: "formal",
        language: "English",
        detail_level: "concise",
        objective: "decision briefing",
        style: "executive",
        custom_instructions: "",
        social_config: {
          platform: "linkedin",
          tone: "thought_leadership",
          persona: "c_suite",
          format: "single_post",
        },
      },
      socialConfig: {
        platform: "linkedin",
        tone: "thought_leadership",
        persona: "c_suite",
        format: "single_post",
      },
      currentTransformation: null,

      toggleOutputType: (type: OutputType) => {
        set((state) => {
          const exists = state.selectedOutputTypes.includes(type);
          return {
            selectedOutputTypes: exists
              ? state.selectedOutputTypes.filter((t) => t !== type)
              : [...state.selectedOutputTypes, type],
          };
        });
      },

      setParams: (newParams) => {
        set((state) => {
          const updatedParams = { ...state.params, ...newParams };
          const updatedSocial = newParams.social_config
            ? { ...state.socialConfig, ...newParams.social_config }
            : state.socialConfig;
          return {
            params: updatedParams,
            socialConfig: updatedSocial,
          };
        });
      },

      setSocialConfig: (newConfig) => {
        set((state) => {
          const updated = { ...state.socialConfig, ...newConfig };
          return {
            socialConfig: updated,
            params: { ...state.params, social_config: updated },
          };
        });
      },

      setCurrentTransformation: (transformation) => set({ currentTransformation: transformation }),

      resetPlanner: () =>
        set({
          selectedOutputTypes: ["executive_summary", "presentation", "advisory"],
          params: {
            audience: "senior leadership",
            tone: "formal",
            language: "English",
            detail_level: "concise",
            objective: "decision briefing",
            style: "executive",
            custom_instructions: "",
            social_config: {
              platform: "linkedin",
              tone: "thought_leadership",
              persona: "c_suite",
              format: "single_post",
            },
          },
          socialConfig: {
            platform: "linkedin",
            tone: "thought_leadership",
            persona: "c_suite",
            format: "single_post",
          },
          currentTransformation: null,
        }),
    }),
    { name: "TransformationStore" }
  )
);

