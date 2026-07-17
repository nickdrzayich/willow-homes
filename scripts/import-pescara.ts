/**
 * One-time import of the legacy Pescara 8/1 bid spreadsheet into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-pescara.ts                # dry run (default) — prints a summary, writes nothing
 *   npx tsx scripts/import-pescara.ts --commit        # actually creates the project/trades/bids
 *
 * Options:
 *   --file <path>          xlsx path (default: the Downloads copy referenced below)
 *   --sheet <name>          worksheet name (default: "Pescara 81 Bid Sheet")
 *   --owner-email <email>   must already have a Supabase account (default: info@willowhomesco.com)
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 * (service-role bypasses RLS, which this script needs since it runs outside a user session).
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";
import type { Database, BidStatus } from "@/lib/types";
import { extractThreadedComments, companyNameFromComment } from "./lib/threaded-comments";

const DEFAULT_FILE = "/Users/nickdrzayich/Downloads/_Pescara 8_1 Bid Sheet (1).xlsx";
const DEFAULT_SHEET = "Pescara 81 Bid Sheet";
const DEFAULT_OWNER_EMAIL = "info@willowhomesco.com";

const TRADE_ROW_START = 5;
const TRADE_ROW_END = 73;
const BID_COLUMNS = ["D", "E", "F", "G"] as const;
const WINNER_COLUMN = "I";
const TRADE_NAME_COLUMN = "B";
const TRADE_QTY_COLUMN = "C";
const PROJECT_NAME_CELL = "B2";
const PROJECT_ADDRESS_CELL = "D2";
const PROJECT_SQFT_CELL = "H2";

const FILL_STATUS_MAP: Record<string, BidStatus> = {
  FF00FF00: "actual",
  FFFFFF00: "estimate",
  FF00FFFF: "sent",
};
const SKIP_FILLS = new Set(["FFFF0000", "FFEFEFEF"]);

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string, fallback: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : fallback;
  };
  return {
    commit: args.includes("--commit"),
    file: get("--file", DEFAULT_FILE),
    sheet: get("--sheet", DEFAULT_SHEET),
    ownerEmail: get("--owner-email", DEFAULT_OWNER_EMAIL),
  };
}

interface ParsedBid {
  column: string;
  amount: number | null;
  status: BidStatus;
  companyName: string | null;
}

interface ParsedTrade {
  row: number;
  name: string;
  qty: number;
  bids: ParsedBid[];
  winnerValue: number | null;
}

function fillArgb(cell: ExcelJS.Cell): string | undefined {
  const fill = cell.fill;
  if (fill && fill.type === "pattern") {
    return fill.fgColor?.argb;
  }
  return undefined;
}

async function parseWorkbook(file: string, sheetName: string): Promise<{
  projectName: string;
  address: string | null;
  sqft: number | null;
  trades: ParsedTrade[];
}> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found in ${file}`);

  const comments = extractThreadedComments(file, sheetName);

  const projectName = String(sheet.getCell(PROJECT_NAME_CELL).value ?? "Untitled project");
  const address = sheet.getCell(PROJECT_ADDRESS_CELL).value
    ? String(sheet.getCell(PROJECT_ADDRESS_CELL).value)
    : null;
  const sqftValue = sheet.getCell(PROJECT_SQFT_CELL).value;
  const sqft = typeof sqftValue === "number" ? sqftValue : null;

  const trades: ParsedTrade[] = [];

  for (let row = TRADE_ROW_START; row <= TRADE_ROW_END; row++) {
    const nameCell = sheet.getCell(`${TRADE_NAME_COLUMN}${row}`);
    const name = nameCell.value ? String(nameCell.value).trim() : "";
    if (!name) continue;

    const qtyValue = sheet.getCell(`${TRADE_QTY_COLUMN}${row}`).value;
    const qty = typeof qtyValue === "number" ? qtyValue : 1;

    const bids: ParsedBid[] = [];
    for (const col of BID_COLUMNS) {
      const cell = sheet.getCell(`${col}${row}`);
      const argb = fillArgb(cell);
      const rawValue = cell.value;
      const amount = typeof rawValue === "number" ? rawValue : null;
      const commentText = comments.get(`${col}${row}`);

      const hasAnything = amount !== null || Boolean(commentText);
      if (!hasAnything && (!argb || SKIP_FILLS.has(argb))) continue;
      if (argb && SKIP_FILLS.has(argb) && !hasAnything) continue;

      const status: BidStatus = (argb && FILL_STATUS_MAP[argb]) || "sent";
      const companyName = commentText ? companyNameFromComment(commentText) : null;

      bids.push({ column: col, amount, status, companyName: companyName || null });
    }

    const winnerRaw = sheet.getCell(`${WINNER_COLUMN}${row}`).value;
    const winnerValue = typeof winnerRaw === "number" ? winnerRaw : null;

    trades.push({ row, name, qty, bids, winnerValue });
  }

  return { projectName, address, sqft, trades };
}

async function main() {
  const { commit, file, sheet, ownerEmail } = parseArgs();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  }
  const supabase = createClient<Database>(supabaseUrl, serviceKey);

  console.log(`${commit ? "COMMIT" : "DRY RUN"} — parsing ${file} (sheet "${sheet}")`);
  const parsed = await parseWorkbook(file, sheet);

  console.log(`\nProject: ${parsed.projectName}`);
  console.log(`Address: ${parsed.address ?? "(none)"}`);
  console.log(`Sqft: ${parsed.sqft ?? "(none)"}`);
  console.log(`Trades found: ${parsed.trades.length}`);

  const parsedBidCount = parsed.trades.reduce((sum, t) => sum + t.bids.length, 0);
  const parsedCompanyNames = new Set(
    parsed.trades.flatMap((t) => t.bids.map((b) => b.companyName).filter((n): n is string => Boolean(n)))
  );
  console.log(`Bids found in spreadsheet: ${parsedBidCount}`);
  console.log(`Distinct company names found in comments: ${parsedCompanyNames.size}`);

  const { data: owner, error: ownerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", ownerEmail)
    .maybeSingle();

  if (ownerError || !owner) {
    throw new Error(
      `No profile found for ${ownerEmail}. Sign up in the app first, then re-run this script.`
    );
  }

  const { data: existingCompanies } = await supabase.from("companies").select("id, name");
  const existingByLowerName = new Map(
    (existingCompanies ?? []).map((c) => [c.name.trim().toLowerCase(), c.id])
  );
  const namesSeenThisRun = new Set<string>();

  const statusCounts: Record<BidStatus, number> = { sent: 0, estimate: 0, actual: 0 };
  const needsReview: string[] = [];
  let companiesCreated = 0;
  let bidsTotal = 0;

  let projectId: string | null = null;
  if (commit) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: parsed.projectName,
        address: parsed.address,
        sqft: parsed.sqft,
        created_by: owner.id,
      })
      .select("id")
      .single();
    if (projectError || !project) throw new Error(`Could not create project: ${projectError?.message}`);
    projectId = project.id;
    console.log(`\nCreated project ${projectId}`);
  }

  for (const trade of parsed.trades) {
    let tradeId: string | null = null;
    if (commit && projectId) {
      const { data: tradeRow, error: tradeError } = await supabase
        .from("trades")
        .insert({ project_id: projectId, name: trade.name, qty: trade.qty, sort_order: trade.row })
        .select("id")
        .single();
      if (tradeError || !tradeRow) throw new Error(`Could not create trade "${trade.name}": ${tradeError?.message}`);
      tradeId = tradeRow.id;
    }

    const createdBidIds: { column: string; amount: number | null; id: string | null }[] = [];

    for (const bid of trade.bids) {
      statusCounts[bid.status]++;
      bidsTotal++;

      let companyId: string | null = null;
      if (bid.companyName) {
        const key = bid.companyName.trim().toLowerCase();
        const existingId = existingByLowerName.get(key);
        if (existingId) {
          companyId = existingId;
        } else if (commit) {
          const { data: newCompany, error: companyError } = await supabase
            .from("companies")
            .insert({ name: bid.companyName })
            .select("id")
            .single();
          if (companyError || !newCompany) {
            throw new Error(`Could not create company "${bid.companyName}": ${companyError?.message}`);
          }
          companyId = newCompany.id;
          existingByLowerName.set(key, companyId);
          companiesCreated++;
        } else if (!namesSeenThisRun.has(key)) {
          companiesCreated++;
        }
        namesSeenThisRun.add(key);
      }

      let bidId: string | null = null;
      if (commit && tradeId) {
        const { data: bidRow, error: bidError } = await supabase
          .from("bids")
          .insert({
            trade_id: tradeId,
            company_id: companyId,
            amount: bid.amount,
            status: bid.status,
            created_by: owner.id,
          })
          .select("id")
          .single();
        if (bidError || !bidRow) throw new Error(`Could not create bid on "${trade.name}": ${bidError?.message}`);
        bidId = bidRow.id;
      }

      createdBidIds.push({ column: bid.column, amount: bid.amount, id: bidId });
    }

    if (trade.winnerValue !== null) {
      const winningBid = createdBidIds.find(
        (b) => b.amount !== null && Math.abs(b.amount - trade.winnerValue!) < 0.01
      );
      if (winningBid) {
        if (commit && winningBid.id) {
          await supabase.from("bids").update({ is_winner: true }).eq("id", winningBid.id);
        }
      } else {
        needsReview.push(
          `Row ${trade.row} "${trade.name}": winner amount ${trade.winnerValue} matches no parsed bid`
        );
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Bids parsed: ${bidsTotal}`);
  console.log(`  sent: ${statusCounts.sent}, estimate: ${statusCounts.estimate}, actual: ${statusCounts.actual}`);
  console.log(`Companies ${commit ? "created" : "would create"}: ${companiesCreated}`);
  console.log(`Companies reused (already existed): ${namesSeenThisRun.size - companiesCreated}`);

  if (needsReview.length) {
    console.log(`\nNeeds manual review (${needsReview.length}) — set the winner by hand in the app for these:`);
    for (const line of needsReview) console.log(`  - ${line}`);
  }

  if (!commit) {
    console.log(`\nThis was a dry run — nothing was written. Re-run with --commit to import for real.`);
  } else {
    console.log(`\nDone. Project "${parsed.projectName}" is ready at /projects/${projectId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
