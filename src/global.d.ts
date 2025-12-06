declare global {
  interface Selection {
    /**
     * Non-standard but widely supported API:
     * selection.modify(action, direction, granularity)
     */
    modify?: (
      alter: "move" | "extend",
      direction: "forward" | "backward" | "left" | "right",
      granularity: "character" | "word" | "line" | "sentence" | "paragraph" | "lineboundary" | "documentboundary"
    ) => void;
  }
}

export {};
