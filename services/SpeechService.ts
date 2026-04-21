/**
 * Speech Service
 *
 * Wraps expo-speech to provide auto-read-aloud for young students.
 * Grade-aware: K-1 auto-reads, 2+ tap-to-read.
 * Character-aware: adjusts pitch/rate per character personality.
 * Supports queued speech so messages play in sequence without stomping.
 */

import * as Speech from "expo-speech";
import { Grade } from "@/types/adaptive-learning";

// Character voice profiles — maps character personality to TTS params
const CHARACTER_VOICES: Record<string, { pitch: number; rate: number }> = {
  ada: { pitch: 1.1, rate: 0.9 }, // calm, gentle owl
  max: { pitch: 1.2, rate: 1.05 }, // energetic puppy
  luna: { pitch: 1.15, rate: 0.85 }, // creative, patient cat
};

const DEFAULT_VOICE = { pitch: 1.1, rate: 0.9 };

// Grades that get auto-read (pre-readers / emergent readers)
const AUTO_READ_GRADES: Grade[] = ["K", "1"];

// Safety timeout — if onDone/onStopped never fires (e.g. web), reset after this
const SPEECH_TIMEOUT_MS = 15000;

interface QueuedUtterance {
  text: string;
  characterId?: string;
  onDone?: () => void;
}

class SpeechServiceClass {
  private speaking = false;
  private queue: QueuedUtterance[] = [];
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Whether a given grade should auto-read content
   */
  shouldAutoRead(grade?: Grade | null): boolean {
    if (!grade) return false;
    return AUTO_READ_GRADES.includes(grade);
  }

  /**
   * Speak text immediately with character voice personality.
   * Stops any current speech and clears the queue.
   */
  async speak(
    text: string,
    options?: {
      characterId?: string;
      onDone?: () => void;
    }
  ): Promise<void> {
    if (!text.trim()) return;

    // Clear queue and stop current speech
    this.queue = [];
    await this.stopInternal();

    this.playUtterance({
      text,
      characterId: options?.characterId,
      onDone: options?.onDone,
    });
  }

  /**
   * Add text to the speech queue. Plays after any current speech finishes.
   * If nothing is playing, starts immediately.
   */
  enqueue(
    text: string,
    options?: {
      characterId?: string;
      onDone?: () => void;
    }
  ): void {
    if (!text.trim()) return;

    const utterance: QueuedUtterance = {
      text,
      characterId: options?.characterId,
      onDone: options?.onDone,
    };

    if (!this.speaking) {
      this.playUtterance(utterance);
    } else {
      this.queue.push(utterance);
    }
  }

  /**
   * Stop any current speech and clear the queue
   */
  async stop(): Promise<void> {
    this.queue = [];
    await this.stopInternal();
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.speaking;
  }

  // --- Private ---

  private playUtterance(utterance: QueuedUtterance): void {
    const voiceProfile =
      CHARACTER_VOICES[utterance.characterId || ""] || DEFAULT_VOICE;

    this.speaking = true;
    this.clearTimeout();

    // Safety timeout in case onDone never fires
    this.timeoutId = setTimeout(() => {
      this.handleSpeechEnd(utterance.onDone);
    }, SPEECH_TIMEOUT_MS);

    Speech.speak(utterance.text, {
      language: "en-US",
      pitch: voiceProfile.pitch,
      rate: voiceProfile.rate,
      onDone: () => this.handleSpeechEnd(utterance.onDone),
      onStopped: () => this.handleSpeechEnd(),
      onError: () => this.handleSpeechEnd(),
    });
  }

  private handleSpeechEnd(onDone?: () => void): void {
    // Guard against double-firing (timeout + onDone both triggering)
    if (!this.speaking) return;

    this.clearTimeout();
    this.speaking = false;
    onDone?.();

    // Play next queued utterance
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.playUtterance(next);
    }
  }

  private async stopInternal(): Promise<void> {
    this.clearTimeout();
    if (this.speaking) {
      Speech.stop();
      this.speaking = false;
    }
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const SpeechService = new SpeechServiceClass();
