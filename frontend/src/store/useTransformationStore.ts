import { create } from "zustand";
import { OutputType, TransformationParams, TransformationStatusItem } from "@/types/transformation";

interface TransformationStoreState {
  selectedOutputTypes: OutputType[];
  params: TransformationParams;
  currentTransformation: TransformationStatusItem | null;
  
  toggleOutputType: (type: OutputType) => void;
  setParams: (params: Partial<TransformationParams>) => void;
  setCurrentTransformation: (transformation: TransformationStatusItem | null) => void;
  resetPlanner: () => void;
}

export const useTransformationStore = create<TransformationStoreState>((set) => ({
  selectedOutputTypes: ["executive_summary", "presentation", "advisory"],
  params: {
    audience: "senior leadership",
    tone: "formal",
    language: "English",
    detail_level: "concise",
    objective: "decision briefing",
    style: "executive",
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
    set((state) => ({
      params: { ...state.params, ...newParams },
    }));
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
      },
      currentTransformation: null,
    }),
}));
