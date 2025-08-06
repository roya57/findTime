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
    shareUrl,
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
        share_url: shareUrl,
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

  try {
    const { data, error } = await supabase
      .from("participants")
      .insert({
        event_id: eventId,
        name,
        email,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding participant:", error);
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

// Availability functions
export async function updateAvailability(
  eventId,
  participantId,
  date,
  timeSlot,
  isAvailable
) {
  try {
    const { data, error } = await supabase
      .from("availability")
      .upsert(
        {
          event_id: eventId,
          participant_id: participantId,
          date,
          time_slot: timeSlot,
          is_available: isAvailable,
        },
        {
          onConflict: "event_id,participant_id,date,time_slot",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating availability:", error);
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
