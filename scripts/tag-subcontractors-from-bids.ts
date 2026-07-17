/**
 * Backfills subcontractor category tags from their bid history on a project:
 * for each company with a bid on a trade in the given project, tags them
 * with that trade's name (e.g. a company with a bid under "Electrical"
 * gets tagged "Electrical"). Existing tags are kept (union, not overwrite),
 * so this is safe to re-run across multiple projects over time.
 *
 * Usage:
 *   npx tsx scripts/tag-subcontractors-from-bids.ts                  # dry run
 *   npx tsx scripts/tag-subcontractors-from-bids.ts --commit         # apply
 *   npx tsx scripts/tag-subcontractors-from-bids.ts --project-name "Other Project" --commit
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

const DEFAULT_PROJECT_NAME = "Pescara Estates Lot 8 Block 1";

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string, fallback: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : fallback;
  };
  return {
    commit: args.includes("--commit"),
    projectName: get("--project-name", DEFAULT_PROJECT_NAME),
  };
}

async function main() {
  const { commit, projectName } = parseArgs();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  }
  const supabase = createClient<Database>(supabaseUrl, serviceKey);

  console.log(`${commit ? "COMMIT" : "DRY RUN"} — tagging subcontractors from bids on "${projectName}"`);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("name", projectName)
    .single();
  if (projectError || !project) {
    throw new Error(`Project "${projectName}" not found: ${projectError?.message}`);
  }

  const { data: trades, error: tradesError } = await supabase
    .from("trades")
    .select("id, name, bids(company_id)")
    .eq("project_id", project.id);
  if (tradesError) throw new Error(`Could not load trades: ${tradesError.message}`);

  // company_id -> set of category names derived from this project's bids
  const derived = new Map<string, Set<string>>();
  for (const trade of trades ?? []) {
    for (const bid of trade.bids ?? []) {
      if (!bid.company_id) continue;
      if (!derived.has(bid.company_id)) derived.set(bid.company_id, new Set());
      derived.get(bid.company_id)!.add(trade.name);
    }
  }

  console.log(`Found ${derived.size} subcontractors with bids across ${trades?.length ?? 0} products/services.`);

  const companyIds = Array.from(derived.keys());
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name, category_names")
    .in("id", companyIds);
  if (companiesError) throw new Error(`Could not load companies: ${companiesError.message}`);

  let updated = 0;
  let unchanged = 0;

  for (const company of companies ?? []) {
    const existing = new Set(company.category_names ?? []);
    const toAdd = derived.get(company.id) ?? new Set();
    const merged = new Set([...existing, ...toAdd]);

    const isNewTags = [...toAdd].some((c) => !existing.has(c));
    if (!isNewTags) {
      unchanged++;
      continue;
    }

    updated++;
    const finalTags = Array.from(merged).sort();
    console.log(`  ${company.name}: ${finalTags.join(", ")}`);

    if (commit) {
      const { error: updateError } = await supabase
        .from("companies")
        .update({ category_names: finalTags })
        .eq("id", company.id);
      if (updateError) console.error(`    Failed to update ${company.name}: ${updateError.message}`);
    }
  }

  console.log(`\n${commit ? "Updated" : "Would update"}: ${updated}. Already tagged correctly: ${unchanged}.`);
  if (!commit) console.log("This was a dry run — nothing was written. Re-run with --commit to apply.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
