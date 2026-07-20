export type AIInsertMode =
  | "replace"
  | "append"
  | "prepend"
  | "insertAtCursor";

export type StreamingState =
  | "idle"
  | "starting"
  | "streaming"
  | "finalizing"
  | "saving"
  | "completed"
  | "cancelled"
  | "error";
