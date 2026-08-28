export type {
  SourceType,
  CitationAuthor,
  CitationGeneratorError,
  CitationGeneratorOutput as CitationResult,
} from "@tooloralabs/tools";

export function emptyAuthor(): { firstName: string; lastName: string } {
  return { firstName: "", lastName: "" };
}
