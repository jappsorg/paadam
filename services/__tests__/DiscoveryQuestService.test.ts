import { DiscoveryQuestService } from "../DiscoveryQuestService";

describe("DiscoveryQuestService", () => {
  let service: DiscoveryQuestService;

  beforeEach(() => {
    service = DiscoveryQuestService.getInstance();
  });

  describe("getDiscoveryPhase", () => {
    it("returns theme_discovery for 0 worksheets", () => {
      expect(service.getDiscoveryPhase(0)).toBe("theme_discovery");
    });
    it("returns theme_contrast for 1 worksheet", () => {
      expect(service.getDiscoveryPhase(1)).toBe("theme_contrast");
    });
    it("returns skill_probe for 2 worksheets", () => {
      expect(service.getDiscoveryPhase(2)).toBe("skill_probe");
    });
    it("returns complete for 3+ worksheets", () => {
      expect(service.getDiscoveryPhase(3)).toBe("complete");
      expect(service.getDiscoveryPhase(10)).toBe("complete");
    });
  });

  describe("generateDiscoveryPlan", () => {
    it("generates easy theme_discovery plan using first favorite theme", () => {
      const plan = service.generateDiscoveryPlan("s1", "2", "Ada", "theme_discovery", ["cooking", "space"], null);
      expect(plan.theme).toBe("cooking");
      expect(plan.difficulty).toBe("easy");
      expect(plan.subject).toBe("addition");
      expect(plan.character).toBe("Ada");
      expect(plan.arcBeat.position).toBe(1);
    });

    it("generates theme_contrast plan with different theme", () => {
      const plan = service.generateDiscoveryPlan("s1", "2", "Max", "theme_contrast", ["cooking", "space"], null);
      expect(plan.theme).toBe("space");
      expect(plan.difficulty).toBe("easy");
      expect(plan.character).toBe("Max");
    });

    it("generates medium difficulty skill_probe using best theme", () => {
      const plan = service.generateDiscoveryPlan("s1", "4", "Luna", "skill_probe", ["cooking"], "cooking");
      expect(plan.theme).toBe("cooking");
      expect(plan.difficulty).toBe("medium");
      expect(plan.subject).toBe("fractions");
      expect(plan.character).toBe("Luna");
    });

    it("picks grade-appropriate subject", () => {
      const planK = service.generateDiscoveryPlan("s1", "K", "Ada", "theme_discovery", ["animals"], null);
      expect(planK.subject).toBe("counting");

      const plan5 = service.generateDiscoveryPlan("s1", "5", "Ada", "theme_discovery", ["animals"], null);
      expect(plan5.subject).toBe("fractions");
    });

    it("throws for complete phase", () => {
      expect(() => service.generateDiscoveryPlan("s1", "2", "Ada", "complete", [], null)).toThrow("complete");
    });
  });
});
