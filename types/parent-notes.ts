// types/parent-notes.ts
import { Timestamp } from "firebase/firestore";

export interface ParentNote {
  id?: string;
  studentId: string;
  text: string;
  createdAt: Timestamp;
  consumedByPlanner: boolean;
}
