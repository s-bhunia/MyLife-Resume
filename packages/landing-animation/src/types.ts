export interface LyricLine {
  text: string;
  font: "devanagari" | "helvetiker";
  startTime: number;
  holdDuration: number;
}

export interface FlashEvent {
  time: number;
  duration: number;
  intensity: number;
}

export interface AnimationSequence {
  id: string;
  audioUrl: string;
  lyrics: LyricLine[];
  chords: string[][];
  flashEvents?: FlashEvent[];
  [background: `background${string}`]: string | undefined;
}
