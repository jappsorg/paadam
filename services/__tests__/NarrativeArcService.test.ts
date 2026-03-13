import { NarrativeArcService } from "../NarrativeArcService";
import { NarrativeArc, ArcBeat, LearningPlan } from "@/types/adaptive-pipeline";

jest.mock("@/firebaseConfig", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(() => ({ id: "arc-123" })),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: { fromDate: (d: Date) => d, now: () => new Date() },
}));

describe("NarrativeArcService", () => {
  let service: NarrativeArcService;

  beforeEach(() => {
    service = NarrativeArcService.getInstance();
    jest.clearAllMocks();
  });

  describe("createArcFromPlan", () => {
    it("creates a NarrativeArc from a LearningPlan", () => {
      const plan: LearningPlan = {
        theme: "cooking",
        character: "Ada",
        arcTitle: "Chef's Kitchen Challenge",
        arcBeat: { position: 1, totalBeats: 4, narrative: "The bakery needs help!", cliffhanger: "But the oven broke!" },
        subject: "fractions",
        difficulty: "medium",
        pedagogicalStrategy: "Use recipe halving",
        misconceptionsToAddress: ["forgets to carry"],
        characterBehavior: "Ada guides patiently",
        emotionalTone: "encouraging",
        questionGuidance: ["Use food portions"],
      };

      const arc = service.createArcFromPlan("student-1", plan);

      expect(arc.theme).toBe("cooking");
      expect(arc.title).toBe("Chef's Kitchen Challenge");
      expect(arc.totalBeats).toBe(4);
      expect(arc.currentBeat).toBe(0);
      expect(arc.status).toBe("active");
      expect(arc.beats).toEqual([]);
      expect(arc.studentId).toBe("student-1");
    });
  });

  describe("advanceBeat", () => {
    it("adds a beat and increments currentBeat", () => {
      const arc: NarrativeArc = {
        id: "arc-1",
        studentId: "s1",
        theme: "cooking",
        title: "Chef's Challenge",
        character: "Ada",
        targetSkills: ["fractions"],
        totalBeats: 4,
        currentBeat: 0,
        status: "active",
        beats: [],
        narrativeContext: "",
        createdAt: new Date(),
        completedAt: null,
        pivotReason: null,
      };

      const beat: ArcBeat = {
        position: 1,
        worksheetId: "ws-1",
        narrativeSummary: "Gathered ingredients",
        cliffhanger: "The oven is too hot!",
        skillsFocused: ["fractions"],
        completedAt: new Date(),
      };

      const updated = service.advanceBeat(arc, beat);
      expect(updated.currentBeat).toBe(1);
      expect(updated.beats).toHaveLength(1);
      expect(updated.beats[0].narrativeSummary).toBe("Gathered ingredients");
    });

    it("marks arc as completed when last beat is reached", () => {
      const arc: NarrativeArc = {
        id: "arc-1",
        studentId: "s1",
        theme: "cooking",
        title: "Chef's Challenge",
        character: "Ada",
        targetSkills: ["fractions"],
        totalBeats: 2,
        currentBeat: 1,
        status: "active",
        beats: [{ position: 1, worksheetId: "ws-1", narrativeSummary: "Beat 1", cliffhanger: "", skillsFocused: ["fractions"], completedAt: new Date() }],
        narrativeContext: "",
        createdAt: new Date(),
        completedAt: null,
        pivotReason: null,
      };

      const beat: ArcBeat = {
        position: 2,
        worksheetId: "ws-2",
        narrativeSummary: "Final beat",
        cliffhanger: "",
        skillsFocused: ["fractions"],
        completedAt: new Date(),
      };

      const updated = service.advanceBeat(arc, beat);
      expect(updated.status).toBe("completed");
      expect(updated.completedAt).not.toBeNull();
    });
  });

  describe("pivotArc", () => {
    it("sets status to pivoted with reason", () => {
      const arc: NarrativeArc = {
        id: "arc-1",
        studentId: "s1",
        theme: "cooking",
        title: "Chef's Challenge",
        character: "Ada",
        targetSkills: ["fractions"],
        totalBeats: 4,
        currentBeat: 2,
        status: "active",
        beats: [],
        narrativeContext: "",
        createdAt: new Date(),
        completedAt: null,
        pivotReason: null,
      };

      const pivoted = service.pivotArc(arc, "engagement_drop");
      expect(pivoted.status).toBe("pivoted");
      expect(pivoted.pivotReason).toBe("engagement_drop");
    });
  });

  describe("buildNarrativeContext", () => {
    it("compresses arc into a short context string", () => {
      const arc: NarrativeArc = {
        id: "arc-1",
        studentId: "s1",
        theme: "cooking",
        title: "Chef's Kitchen Challenge",
        character: "Ada",
        targetSkills: ["fractions", "measurement"],
        totalBeats: 4,
        currentBeat: 2,
        status: "active",
        beats: [
          { position: 1, worksheetId: "w1", narrativeSummary: "Gathered ingredients", cliffhanger: "But the recipe is wrong!", skillsFocused: ["measurement"], completedAt: new Date() },
          { position: 2, worksheetId: "w2", narrativeSummary: "Fixed the recipe", cliffhanger: "Now the oven is too hot!", skillsFocused: ["fractions"], completedAt: new Date() },
        ],
        narrativeContext: "",
        createdAt: new Date(),
        completedAt: null,
        pivotReason: null,
      };

      const context = service.buildNarrativeContext(arc, []);
      expect(context).toContain("Chef's Kitchen Challenge");
      expect(context).toContain("cooking");
      expect(context).toContain("Beat 2 of 4");
      expect(context).toContain("Gathered ingredients");
      expect(context).toContain("Now the oven is too hot!");
    });
  });
});
