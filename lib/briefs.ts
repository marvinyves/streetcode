import { getSupabaseClient, type Brief } from "@/lib/supabase/client";

export async function getLatestBrief(): Promise<Brief | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getBriefByDate(date: string): Promise<Brief | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllBriefDates(): Promise<
  Pick<Brief, "date" | "brief_en">[]
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("date, brief_en")
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRecentBriefs(limit: number): Promise<Brief[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
