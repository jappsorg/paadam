import { AdaptivePlannerService } from "../AdaptivePlannerService";
import { StudentContext, LearningPlan, PIVOT_THRESHOLDS } from "@/types/adaptive-pipeline";

jest.mock("@/firebaseConfig", () => ({ db: {} }));
jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));
jest.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: jest.fn(() => jest.fn()),
}));
jest.mock("@/services/SignalAggregatorService", () => ({
  signalAggregatorService: {
    buildStudentContext: jest.fn(),
  },
}));
jest.mock("@/services/NarrativeArcService", () => ({
  narrativeArcService: {
    createArcFromPlan: jest.fn(),
    saveArc: jest.fn(),
    advanceBeat: jest.fn(),
    updateArc: jest.fn(),
    getActiveArc: jest.fn(),
    buildNarrativeContext: jest.fn(),
  },
}));
jest.mock("@/services/ThemeAffinityService", () => ({
  themeAffinityService: {
    penalizeTheme: jest.fn(),
  },
}));

describe("AdaptivePlannerService", () => {
  let service: AdaptivePlannerService;

  beforeEach(() => {
    service = AdaptivePlannerService.getInstance();
    jest.clearAllMocks();
  });

  describe("detectPivotNeeded", () => {
    it("returns shouldPivot=true when 2+ triggers fire", () => {
      const recentSessions = [
        { completionRate: 0.4, emotionalState: "frustrated", speedChange: 0.1, accuracyChange: -0.1 },
        { completionRate: 0.5, emotionalState: "frustrated", speedChange: 0.2, accuracyChange: -0.15 },
      ];

      const decision = service.detectPivotNeeded(recentSessions);
      expect(decision.shouldPivot).toBe(true);
      expect(decision.triggers.length).toBeGreaterThanOrEqual(2);
    });

    it("returns shouldPivot=false with good engagement", () => {
      const recentSessions = [
        { completionRate: 0.9, emotionalState: "happy", speedChange: 0.0, accuracyChange: 0.05 },
        { completionRate: 0.85, emotionalState: "curious", speedChange: -0.1, accuracyChange: 0.02 },
      ];

      const decision = service.detectPivotNeeded(recentSessions);
      expect(decision.shouldPivot).toBe(false);
    });

    it("returns shouldPivot=true immediately when student explicitly requests change", () => {
      const recentSessions = [
        { completionRate: 0.9, emotionalState: "happy", speedChange: 0.0, accuracyChange: 0.05 },
      ];

      const decision = service.detectPivotNeeded(recentSessions, true);
      expect(decision.shouldPivot).toBe(true);
      expect(decision.triggers).toContain("student_requested_change");
      expect(decision.confidence).toBe(1);
    });
  });

  describe("buildPlannerPrompt", () => {
    it("creates a structured prompt from StudentContext", () => {
      const context: StudentContext = {
        studentId: "s1",
        studentName: "Maya",
        grade: "2",
        character: "ada",
        skillMastery: {},
        themeAffinities: { cooking: { fractions: 0.88 } },
        activeArc: null,
        recentEmotions: [],
        frustrationTriggers: ["carrying"],
        misconceptions: ["Needs review: carrying"],
        learningVelocity: "moderate",
        arcHistory: [],
      };

      const prompt = service.buildPlannerPrompt(context);
      expect(prompt).toContain("Maya");
      expect(prompt).toContain("Grade 2");
      expect(prompt).toContain("cooking");
      expect(prompt).toContain("carrying");
    });
  });
});
