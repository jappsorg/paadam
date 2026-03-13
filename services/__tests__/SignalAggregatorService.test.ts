import { SignalAggregatorService } from "../SignalAggregatorService";

jest.mock("@/firebaseConfig", () => ({ db: {} }));
jest.mock("@/services/StudentProfileService", () => ({
  studentProfileService: {
    getProfile: jest.fn(),
  },
}));
jest.mock("@/services/SessionService", () => ({
  sessionService: {
    getEmotionalMemorySummary: jest.fn(),
  },
}));
jest.mock("@/services/ThemeAffinityService", () => ({
  themeAffinityService: {
    getAffinities: jest.fn(),
  },
}));
jest.mock("@/services/NarrativeArcService", () => ({
  narrativeArcService: {
    getActiveArc: jest.fn(),
    getArcHistory: jest.fn(),
    buildNarrativeContext: jest.fn(),
    checkAndMarkAbandoned: jest.fn(),
  },
}));

describe("SignalAggregatorService", () => {
  let service: SignalAggregatorService;

  beforeEach(() => {
    service = SignalAggregatorService.getInstance();
    jest.clearAllMocks();
  });

  describe("buildStudentContext", () => {
    it("aggregates data from all services into StudentContext", async () => {
      const { studentProfileService } = require("@/services/StudentProfileService");
      const { sessionService } = require("@/services/SessionService");
      const { themeAffinityService } = require("@/services/ThemeAffinityService");
      const { narrativeArcService } = require("@/services/NarrativeArcService");

      studentProfileService.getProfile.mockResolvedValue({
        id: "s1",
        name: "Maya",
        grade: "2",
        characterId: "ada",
        skillMastery: { addition: { masteryLevel: 85 } },
        learningDisposition: {},
      });

      sessionService.getEmotionalMemorySummary.mockResolvedValue({
        recentMood: "positive",
        commonFrustrations: ["carrying"],
        celebrationPatterns: ["completing worksheets"],
        energyPatterns: "high in morning",
        focusPatterns: "good with short sessions",
      });

      themeAffinityService.getAffinities.mockResolvedValue({
        cooking: { fractions: 0.88, addition: 0.75 },
      });

      narrativeArcService.getActiveArc.mockResolvedValue(null);
      narrativeArcService.getArcHistory.mockResolvedValue([]);
      narrativeArcService.checkAndMarkAbandoned.mockResolvedValue(undefined);

      const context = await service.buildStudentContext("s1");

      expect(context.studentId).toBe("s1");
      expect(context.studentName).toBe("Maya");
      expect(context.grade).toBe("2");
      expect(context.themeAffinities).toHaveProperty("cooking");
      expect(context.frustrationTriggers).toContain("carrying");
    });
  });

  describe("computeSessionSignals", () => {
    it("computes normalized signals from session data", () => {
      const sessionData = {
        questionsAttempted: [
          { isCorrect: true, timeSpent: 5000, attemptNumber: 1 },
          { isCorrect: true, timeSpent: 8000, attemptNumber: 1 },
          { isCorrect: false, timeSpent: 12000, attemptNumber: 1 },
          { isCorrect: false, timeSpent: 6000, attemptNumber: 2 }, // retry
        ],
        emotionalStates: [
          { emotion: "curious", intensity: 3 },
          { emotion: "proud", intensity: 4 },
          { emotion: "frustrated", intensity: 2 },
        ],
        totalQuestions: 5,
        questionsCompleted: 4,
      };

      const signals = service.computeSessionSignals(
        "session-1",
        "student-1",
        "cooking",
        "fractions",
        sessionData,
      );

      expect(signals.accuracy).toBeGreaterThan(0);
      expect(signals.accuracy).toBeLessThanOrEqual(1);
      expect(signals.engagement).toBeGreaterThan(0);
      expect(signals.emotionScore).toBeGreaterThan(0);
      expect(signals.retryScore).toBeGreaterThan(0);
    });
  });
});
