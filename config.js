// Supabase connection for the Clover Life patient portal.
//
// IMPORTANT: this is deliberately the SAME Supabase project as the staff
// management app (clover-life-diagnostics). The two apps are hosted
// separately, but they must share one database — that's how a booking a
// patient makes here shows up on the clinic's Requests page.
//
// Both values below are meant to be public (this is how Supabase's security
// model works — the real protection is the Row Level Security policies in
// the staff app's supabase/schema.sql, not secrecy of this key). Do NOT put
// your "service_role" key here — only ever the "anon" / "public" key.
window.CLOVER_CONFIG = {
  SUPABASE_URL: "https://yfdtnkvfhthkbxeerxmb.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_wilrQJS_xvihF5kFcIlTwQ_W790HniK",
};
