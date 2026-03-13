import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import {
  NarrativeArc,
  ArcBeat,
  ArcSummary,
  LearningPlan,
  ARC_ABANDON_DAYS,
} from "@/types/adaptive-pipeline";

export class NarrativeArcService {
  private static instance: NarrativeArcService;
  private static COLLECTION = "narrative_arcs";

  static getInstance(): NarrativeArcService {
    if (!NarrativeArcService.instance) {
      NarrativeArcService.instance = new NarrativeArcService();
    }
    return NarrativeArcService.instance;
  }

  createArcFromPlan(studentId: string, plan: LearningPlan): NarrativeArc {
    return {
      id: "", // set on Firestore save
      studentId,
      theme: plan.theme,
      title: plan.arcTitle,
      character: plan.character,
      targetSkills: [plan.subject],
      totalBeats: plan.arcBeat.totalBeats,
      currentBeat: 0,
      status: "active",
      beats: [],
      narrativeContext: "",
      createdAt: new Date(),
      completedAt: null,
      pivotReason: null,
    };
  }

  advanceBeat(arc: NarrativeArc, beat: ArcBeat): NarrativeArc {
    const updated = { ...arc };
    updated.beats = [...arc.beats, beat];
    updated.currentBeat = beat.position;

    if (beat.position >= arc.totalBeats) {
      updated.status = "completed";
      updated.completedAt = new Date();
    }

    return updated;
  }

  pivotArc(arc: NarrativeArc, reason: string): NarrativeArc {
    return {
      ...arc,
      status: "pivoted",
      pivotReason: reason,
      completedAt: new Date(),
    };
  }

  buildNarrativeContext(arc: NarrativeArc, pastArcs: ArcSummary[]): string {
    const lines: string[] = [];
    lines.push(`Active arc: ${arc.title} (${arc.theme}).`);
    lines.push(`Beat ${arc.currentBeat} of ${arc.totalBeats} complete. ${arc.character} is the guide.`);

    if (arc.beats.length > 0) {
      const summaries = arc.beats.map((b) => b.narrativeSummary).join(", ");
      lines.push(`Story so far: ${summaries}.`);
      const lastBeat = arc.beats[arc.beats.length - 1];
      if (lastBeat.cliffhanger) {
        lines.push(`Cliffhanger: ${lastBeat.cliffhanger}`);
      }
    }

    const coveredSkills = [...new Set(arc.beats.flatMap((b) => b.skillsFocused))];
    if (coveredSkills.length > 0) {
      lines.push(`Skills covered: ${coveredSkills.join(", ")}.`);
    }

    lines.push(`Target skills: ${arc.targetSkills.join(", ")}.`);

    if (pastArcs.length > 0) {
      const pastSummary = pastArcs
        .slice(0, 3)
        .map((a) => `${a.title} (${a.status}, ${a.completedBeats} beats)`)
        .join(", ");
      lines.push(`Past arcs: ${pastSummary}.`);
    }

    return lines.join("\n");
  }

  async saveArc(studentId: string, arc: NarrativeArc): Promise<string> {
    const colRef = collection(db, `users/${studentId}/${NarrativeArcService.COLLECTION}`);
    const docRef = doc(colRef);
    const arcWithId = { ...arc, id: docRef.id };
    await setDoc(docRef, arcWithId);
    return docRef.id;
  }

  async getActiveArc(studentId: string): Promise<NarrativeArc | null> {
    const colRef = collection(db, `users/${studentId}/${NarrativeArcService.COLLECTION}`);
    const q = query(colRef, where("status", "==", "active"), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as NarrativeArc;
  }

  async updateArc(studentId: string, arc: NarrativeArc): Promise<void> {
    const docRef = doc(db, `users/${studentId}/${NarrativeArcService.COLLECTION}`, arc.id);
    await setDoc(docRef, arc);
  }

  async getArcHistory(studentId: string, maxArcs: number = 5): Promise<ArcSummary[]> {
    const colRef = collection(db, `users/${studentId}/${NarrativeArcService.COLLECTION}`);
    const q = query(colRef, where("status", "!=", "active"), orderBy("completedAt", "desc"), limit(maxArcs));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data() as NarrativeArc;
      return {
        id: data.id,
        theme: data.theme,
        title: data.title,
        status: data.status,
        totalBeats: data.totalBeats,
        completedBeats: data.beats.length,
        targetSkills: data.targetSkills,
      };
    });
  }

  async checkAndMarkAbandoned(studentId: string): Promise<void> {
    const active = await this.getActiveArc(studentId);
    if (!active) return;

    const lastActivity = active.beats.length > 0
      ? active.beats[active.beats.length - 1].completedAt
      : active.createdAt;

    if (!lastActivity) return;

    const daysSince = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= ARC_ABANDON_DAYS) {
      const abandoned = { ...active, status: "abandoned" as const, completedAt: new Date() };
      await this.updateArc(studentId, abandoned);
    }
  }
}

export const narrativeArcService = NarrativeArcService.getInstance();
