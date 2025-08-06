import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema setup
export async function setupDatabase() {
  try {
    // Create events table
    const { error: eventsError } = await supabase.rpc(
      "create_events_table",
      {}
    );
    if (eventsError && !eventsError.message.includes("already exists")) {
      console.error("Error creating events table:", eventsError);
    }

    // Create participants table
    const { error: participantsError } = await supabase.rpc(
      "create_participants_table",
      {}
    );
    if (
      participantsError &&
      !participantsError.message.includes("already exists")
    ) {
      console.error("Error creating participants table:", participantsError);
    }

    // Create availability table
    const { error: availabilityError } = await supabase.rpc(
      "create_availability_table",
      {}
    );
    if (
      availabilityError &&
      !availabilityError.message.includes("already exists")
    ) {
      console.error("Error creating availability table:", availabilityError);
    }

    console.log("Database tables setup completed");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}
