import { supabase } from "./supabase.js";

// Event functions
export async function createEvent(eventData) {
  const {
    id,
    title,
    description,
    dateType,
    startDate,
    endDate,
    selectedDays,
    startTime,
    endTime,
    duration,
  } = eventData;

  try {
    const { data, error } = await supabase
      .from("events")
      .insert({
        id,
        title,
        description,
        date_type: dateType,
        start_date: startDate || null,
        end_date: endDate || null,
        selected_days: selectedDays || null,
        start_time: startTime,
        end_time: endTime,
        duration,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

export async function getEvent(eventId) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned

    if (data) {
      // Transform snake_case to camelCase for frontend compatibility
      // Generate share URL dynamically from event ID
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        dateType: data.date_type,
        startDate: data.start_date,
        endDate: data.end_date,
        selectedDays: data.selected_days,
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration,
        shareUrl: `${window.location.origin}/event/${data.id}`,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    return data;
  } catch (error) {
    console.error("Error getting event:", error);
    throw error;
  }
}

export async function updateEvent(eventId, updates) {
  try {
    const { data, error } = await supabase
      .from("events")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

// Participant functions
export async function addParticipant(eventId, participantData) {
  const { name, email } = participantData;

  console.log("addParticipant called with:", { eventId, participantData });
  console.log("Extracted name:", name);
  console.log("Extracted email:", email);
  console.log("Email type:", typeof email);
  console.log("Email value:", email);

  try {
    // First, verify the event exists
    console.log("Checking if event exists:", eventId);
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Event not found:", eventError);
      throw new Error(`Event with ID ${eventId} not found`);
    }

    console.log("Event found:", eventData);

    const insertData = {
      event_id: eventId,
      name,
      email: email || null,
    };

    console.log("Data to insert:", insertData);
    console.log("Supabase client:", supabase);

    const { data, error } = await supabase
      .from("participants")
      .insert(insertData)
      .select()
      .single();

    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Successfully added participant:", data);
    return data;
  } catch (error) {
    console.error("Error adding participant:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
}

export async function getParticipants(eventId) {
  try {
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting participants:", error);
    throw error;
  }
}

export async function removeParticipant(participantId) {
  try {
    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing participant:", error);
    throw error;
  }
}

// Test function to check availability table access
export async function testAvailabilityTable() {
  try {
    console.log("Testing availability table access...");
    
    // Try a simple select to see if the table exists
    const { data, error } = await supabase
      .from("availability")
      .select("count", { count: "exact", head: true })
      .limit(1);

    console.log("Availability table test result:", { data, error });
    
    if (error) {
      console.error("Availability table test failed:", error);
      return false;
    }
    
    console.log("Availability table is accessible");
    return true;
  } catch (error) {
    console.error("Error testing availability table:", error);
    return false;
  }
}

// Availability functions
export async function updateAvailability(
  eventId,
  participantId,
  date,
  timeSlot,
  isAvailable
) {
  console.log("updateAvailability called with:", {
    eventId,
    participantId,
    date,
    timeSlot,
    isAvailable,
  });
  console.log("Data types:", {
    eventId: typeof eventId,
    participantId: typeof participantId,
    date: typeof date,
    timeSlot: typeof timeSlot,
    isAvailable: typeof isAvailable,
  });

  try {
    const insertData = {
      event_id: eventId,
      participant_id: participantId,
      date,
      time_slot: timeSlot,
      is_available: isAvailable,
    };

    console.log("Data to upsert:", insertData);
    console.log("Supabase client:", supabase);

    const { data, error } = await supabase
      .from("availability")
      .upsert(insertData, {
        onConflict: "event_id,participant_id,date,time_slot",
      })
      .select()
      .single();

    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Supabase error in updateAvailability:", error);
      throw error;
    }

    console.log("Successfully updated availability:", data);
    return data;
  } catch (error) {
    console.error("Error updating availability:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
}

export async function getAvailability(eventId) {
  try {
    const { data, error } = await supabase
      .from("availability")
      .select(
        `
          *,
          participants (
            name,
            email
          )
        `
      )
      .eq("event_id", eventId)
      .order("date", { ascending: true })
      .order("time_slot", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting availability:", error);
    throw error;
  }
}

export async function getAvailabilityCount(eventId, date, timeSlot) {
  try {
    const { count, error } = await supabase
      .from("availability")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("date", date)
      .eq("time_slot", timeSlot)
      .eq("is_available", true);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error getting availability count:", error);
    throw error;
  }
}

// Real-time subscriptions
export function subscribeToEvent(eventId, callback) {
  return supabase
    .channel(`event-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "availability",
        filter: `event_id=eq.${eventId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "participants",
        filter: `event_id=eq.${eventId}`,
      },
      callback
    )
    .subscribe();
}

export function unsubscribeFromEvent(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}
