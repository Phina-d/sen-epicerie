import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("SUPABASE URL :", supabaseUrl);
console.log(
  "SUPABASE KEY présente :",
  Boolean(supabasePublishableKey)
);
console.log(
  "SUPABASE KEY commence par :",
  supabasePublishableKey?.substring(0, 15)
);

if (!supabaseUrl) {
  throw new Error(
    "VITE_SUPABASE_URL est manquante."
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "VITE_SUPABASE_PUBLISHABLE_KEY est manquante."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);