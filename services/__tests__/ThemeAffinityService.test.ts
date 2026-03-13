import { ThemeAffinityService } from "../ThemeAffinityService";
import { SessionSignals, SIGNAL_WEIGHTS, DECAY_HALF_LIFE_DAYS } from "@/types/adaptive-pipeline";

// Mock Firestore
jest.mock("@/firebaseConfig", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: { fromDate: (d: Date) => d, now: () => new Date() },
}));

describe("ThemeAffinityService", () => {
  let service: ThemeAffinityService;

  beforeEach(() => {
    service = ThemeAffinityService.getInstance();
    jest.clearAllMocks();
  });

  describe("computeAffinityScore", () => {
    it("computes weighted score from session signals", () => {
      const signals: SessionSignals = {
        sessionId: "s1",
        studentId: "student1",
        theme: "cooking",
        skill: "fractions",
        accuracy: 0.8,
        engagement: 0.9,
        emotionScore: 0.7,
        speedScore: 0.6,
        retryScore: 0.5,
        timestamp: new Date(),
      };

      const score = service.computeAffinityScore(signals);
      const expected =
        0.8 * SIGNAL_WEIGHTS.accuracy +
        0.9 * SIGNAL_WEIGHTS.engagement +
        0.7 * SIGNAL_WEIGHTS.emotion +
        0.6 * SIGNAL_WEIGHTS.speed +
        0.5 * SIGNAL_WEIGHTS.retry;

      expect(score).toBeCloseTo(expected, 4);
    });

    it("clamps score between 0 and 1", () => {
      const signals: SessionSignals = {
        sessionId: "s1",
        studentId: "student1",
        theme: "cooking",
        skill: "fractions",
        accuracy: 1,
        engagement: 1,
        emotionScore: 1,
        speedScore: 1,
        retryScore: 1,
        timestamp: new Date(),
      };

      const score = service.computeAffinityScore(signals);
      expect(score).toBeLessThanOrEqual(1);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("applyDecay", () => {
    it("reduces score based on time elapsed", () => {
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - DECAY_HALF_LIFE_DAYS * 24 * 60 * 60 * 1000);

      const decayed = service.applyDecay(1.0, twoWeeksAgo, now);
      expect(decayed).toBeCloseTo(0.5, 1);
    });

    it("returns original score for recent data", () => {
      const now = new Date();
      const decayed = service.applyDecay(0.8, now, now);
      expect(decayed).toBeCloseTo(0.8, 4);
    });
  });

  describe("getBestThemeForSkill", () => {
    it("returns the theme with highest score for a given skill", () => {
      const affinities: Record<string, Record<string, number>> = {
        cooking: { fractions: 0.88, addition: 0.75 },
        dinosaurs: { fractions: 0.65, addition: 0.82 },
        space: { fractions: 0.72, addition: 0.60 },
      };

      const best = service.getBestThemeForSkill(affinities, "fractions");
      expect(best).toBe("cooking");
    });

    it("returns null for unknown skill", () => {
      const affinities: Record<string, Record<string, number>> = {
        cooking: { fractions: 0.88 },
      };

      const best = service.getBestThemeForSkill(affinities, "geometry");
      expect(best).toBeNull();
    });
  });
});
