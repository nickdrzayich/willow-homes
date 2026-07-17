import AdmZip from "adm-zip";

// Excel stores the modern "threaded comment" text in a separate part from
// the cell it's attached to. The chain is:
//   workbook.xml (sheet name -> r:id)
//   -> _rels/workbook.xml.rels (r:id -> worksheets/sheetN.xml)
//   -> worksheets/_rels/sheetN.xml.rels (-> threadedComments/threadedCommentM.xml)
//   -> threadedCommentM.xml (cell ref -> text)
export function extractThreadedComments(xlsxPath: string, sheetName: string): Map<string, string> {
  const zip = new AdmZip(xlsxPath);

  const read = (path: string): string => {
    const entry = zip.getEntry(path);
    if (!entry) throw new Error(`Missing part in xlsx: ${path}`);
    return entry.getData().toString("utf-8");
  };

  const workbookXml = read("xl/workbook.xml");
  const sheetMatch = workbookXml.match(
    new RegExp(`<sheet[^>]*name="${escapeRegExp(sheetName)}"[^>]*r:id="([^"]+)"`)
  );
  if (!sheetMatch) throw new Error(`Sheet "${sheetName}" not found in workbook.xml`);
  const sheetRId = sheetMatch[1];

  const workbookRels = read("xl/_rels/workbook.xml.rels");
  const sheetTargetMatch = workbookRels.match(
    new RegExp(`<Relationship Id="${sheetRId}"[^>]*Target="([^"]+)"`)
  );
  if (!sheetTargetMatch) throw new Error(`No worksheet target for ${sheetRId}`);
  const sheetFileName = sheetTargetMatch[1].split("/").pop()!;

  const sheetRelsPath = `xl/worksheets/_rels/${sheetFileName}.rels`;
  const sheetRelsEntry = zip.getEntry(sheetRelsPath);
  if (!sheetRelsEntry) return new Map();
  const sheetRels = sheetRelsEntry.getData().toString("utf-8");

  const threadedMatch = sheetRels.match(
    /<Relationship[^>]*Type="[^"]*threadedComment"[^>]*Target="([^"]+)"/
  );
  if (!threadedMatch) return new Map();

  const threadedPath = `xl/${threadedMatch[1].replace(/^\.\.\//, "")}`;
  const threadedXml = read(threadedPath);

  const comments = new Map<string, string>();
  const commentRegex = /<x18tc:threadedComment ref="([^"]+)"[^>]*>[\s\S]*?<x18tc:text[^>]*>([\s\S]*?)<\/x18tc:text>/g;
  let match: RegExpExecArray | null;
  while ((match = commentRegex.exec(threadedXml))) {
    const [, ref, rawText] = match;
    // Only keep the first (root) comment per cell; replies aren't relevant here.
    if (!comments.has(ref)) {
      comments.set(ref, decodeXmlEntities(rawText));
    }
  }
  return comments;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Threaded comments in this sheet are often "Company Name\n--detail\n--detail".
// The company name is reliably the first non-empty line.
export function companyNameFromComment(commentText: string): string {
  const firstLine = commentText.split("\n").find((line) => line.trim().length > 0) ?? "";
  return firstLine.replace(/^--\s*/, "").trim();
}
