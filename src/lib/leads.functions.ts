import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { leadSubmissionSchema, toE164 } from "./lead-schema";

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSubmissionSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { contact, answers } = data;
    const { error } = await supabase.from("trading_leads").insert({
      full_name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      phone: toE164(contact.phone, contact.countryCode),
      ...answers,
    });

    if (error) {
      console.error("lead insert failed", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
