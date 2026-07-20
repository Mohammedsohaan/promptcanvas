import { DocumentEditorRef } from "@/components/editor/editor";

export interface StreamConsumer {
  onChunk(text: string): void;
  onComplete(): void;
  onError(error: Error): void;
}

/**
 * StreamConsumer implementation for TipTap rich text editor.
 */
export class TipTapStreamConsumer implements StreamConsumer {
  private editorRef: React.RefObject<DocumentEditorRef | null>;
  private onTextUpdate: (text: string) => void;
  private buffer: string = "";

  constructor(
    editorRef: React.RefObject<DocumentEditorRef | null>,
    onTextUpdate: (text: string) => void
  ) {
    this.editorRef = editorRef;
    this.onTextUpdate = onTextUpdate;
  }

  public onChunk(text: string): void {
    this.buffer += text;
    this.onTextUpdate(this.buffer);
  }

  public onComplete(): void {
    if (this.editorRef.current) {
      this.editorRef.current.setEditable(true);
    }
  }

  public onError(error: Error): void {
    console.error("TipTapStreamConsumer error:", error);
    if (this.editorRef.current) {
      this.editorRef.current.setEditable(true);
    }
  }

  public getBuffer(): string {
    return this.buffer;
  }
}

/**
 * StreamConsumer implementation for Copilot chat streaming.
 */
export class CopilotStreamConsumer implements StreamConsumer {
  private onChunkCallback: (text: string) => void;
  private onCompleteCallback: () => void;
  private onErrorCallback: (error: Error) => void;
  private buffer: string = "";

  constructor(options: {
    onChunk: (text: string) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
  }) {
    this.onChunkCallback = options.onChunk;
    this.onCompleteCallback = options.onComplete || (() => {});
    this.onErrorCallback = options.onError || (() => {});
  }

  public onChunk(text: string): void {
    this.buffer += text;
    this.onChunkCallback(text);
  }

  public onComplete(): void {
    this.onCompleteCallback();
  }

  public onError(error: Error): void {
    this.onErrorCallback(error);
  }

  public getBuffer(): string {
    return this.buffer;
  }
}
