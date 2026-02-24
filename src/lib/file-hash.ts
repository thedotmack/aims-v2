import { createHash } from "crypto";

/**
 * Compute a SHA-256 content hash for optimistic locking.
 *
 * Used to detect concurrent edits: the client sends the hash it received
 * when loading the file, and the server compares it to the current hash
 * before allowing a save.
 */
export function computeContentHash(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}
