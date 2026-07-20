export interface DocumentReference {
  id: string;
  reason: string;
  confidence: "high" | "medium" | "low";
}

export interface ReferenceParser {
  consume(chunk: string): void;
  finalize(): DocumentReference[];
  reset(): void;
}

/**
 * MarkdownReferenceParser incrementally parses streamed AI responses to extract
 * structured document references from the '## Referenced Documents' markdown section.
 */
export class MarkdownReferenceParser implements ReferenceParser {
  private buffer: string = "";
  private references: DocumentReference[] = [];

  public consume(chunk: string): void {
    this.buffer += chunk;
    this.parseBuffer();
  }

  public finalize(): DocumentReference[] {
    this.parseBuffer();
    return [...this.references];
  }

  public reset(): void {
    this.buffer = "";
    this.references = [];
  }

  private parseBuffer(): void {
    const sectionIndex = this.buffer.indexOf("## Referenced Documents");
    if (sectionIndex === -1) {
      return;
    }

    let sectionText = this.buffer.substring(sectionIndex + "## Referenced Documents".length);
    // Stop if next section ## Response Metadata appears
    const metaIndex = sectionText.indexOf("## Response Metadata");
    if (metaIndex !== -1) {
      sectionText = sectionText.substring(0, metaIndex);
    }

    const items: DocumentReference[] = [];
    const itemBlocks = sectionText.split(/\n-\s+id:\s*/i);

    for (let i = 1; i < itemBlocks.length; i++) {
      const block = itemBlocks[i].trim();
      const lines = block.split("\n");
      const id = lines[0].trim().replace(/^["']|["']$/g, "");

      let reason = "";
      let confidence: "high" | "medium" | "low" = "high";

      for (let j = 1; j < lines.length; j++) {
        const line = lines[j].trim();
        if (line.startsWith("reason:")) {
          reason = line.replace(/^reason:\s*/i, "").trim().replace(/^["']|["']$/g, "");
        } else if (line.startsWith("confidence:")) {
          const confStr = line.replace(/^confidence:\s*/i, "").trim().toLowerCase();
          if (confStr === "medium") confidence = "medium";
          if (confStr === "low") confidence = "low";
        }
      }

      if (id) {
        items.push({
          id,
          reason: reason || "Referenced in response context",
          confidence,
        });
      }
    }

    this.references = items;
  }
}
