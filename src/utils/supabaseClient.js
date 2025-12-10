<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("⚠️ Variáveis de ambiente do Supabase não configuradas!");
}

=======
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("⚠️ Variáveis de ambiente do Supabase não configuradas!");
}

>>>>>>> e432c81afbfcf20f9e060b437fc8dcafc90f5cf5
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);