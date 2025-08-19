import { supabase } from "./supabase.js";

// Create a new event
export async function createEvent(eventData) {
  try {
    console.log("Creating event with data:", eventData);

    const { data, error } = await supabase
      .from("events")
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw error;
    }

    console.log("Event created successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to create event:", error);
    throw error;
  }
}

// Get an event by ID
export async function getEvent(eventId) {
  try {
    console.log("Getting event:", eventId);

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Error getting event:", error);
      throw error;
    }

    // Transform snake_case to camelCase for frontend compatibility
    const transformedEvent = {
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
      participants: data.participants || [],
      availabilityData: data.availability_data || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Generate share URL dynamically
    transformedEvent.shareUrl = `${window.location.origin}/event/${eventId}`;

    console.log("Transformed event:", transformedEvent);
    return transformedEvent;
  } catch (error) {
    console.error("Failed to get event:", error);
    throw error;
  }
}

// Add a participant to an event
export async function addParticipant(eventId, participantData) {
  try {
    console.log("Adding participant to event:", eventId, participantData);

    // Get current event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("participants")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Error getting event for participant:", eventError);
      throw eventError;
    }

    // Generate new participant ID
    const newParticipantId = Date.now();
    const newParticipant = {
      id: newParticipantId,
      name: participantData.name,
      email: participantData.email || null,
    };

    // Add to participants array
    const updatedParticipants = [...(event.participants || []), newParticipant];

    // Update the event
    const { data, error } = await supabase
      .from("events")
      .update({ participants: updatedParticipants })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Error adding participant:", error);
      throw error;
    }

    console.log("Participant added successfully:", data);
    return newParticipant;
  } catch (error) {
    console.error("Failed to add participant:", error);
    throw error;
  }
}

// Update availability for a participant
export async function updateAvailability(
  eventId,
  participantId,
  date,
  timeSlot,
  isAvailable
) {
  try {
    console.log("Updating availability:", {
      eventId,
      participantId,
      date,
      timeSlot,
      isAvailable,
    });

    // Get current event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("availability_data")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Error getting event for availability update:", eventError);
      throw error;
    }

    // Create new availability structure
    const currentAvailability = event.availability_data || {};
    const participantAvailability = currentAvailability[participantId] || {};
    const dateAvailability = participantAvailability[date] || {};

    // Update the specific time slot
    dateAvailability[timeSlot] = isAvailable;
    participantAvailability[date] = dateAvailability;
    currentAvailability[participantId] = participantAvailability;

    // Update the event
    const { data, error } = await supabase
      .from("events")
      .update({ availability_data: currentAvailability })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Error updating availability:", error);
      throw error;
    }

    console.log("Availability updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to update availability:", error);
    throw error;
  }
}

// Update entire availability data (for bulk updates)
export async function updateAvailabilityBulk(eventId, availabilityData) {
  try {
    console.log("Updating availability bulk for event:", eventId);

    const { data, error } = await supabase
      .from("events")
      .update({ availability_data: availabilityData })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Error updating availability bulk:", error);
      throw error;
    }

    console.log("Bulk availability updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to update availability bulk:", error);
    throw error;
  }
}

// Subscribe to real-time changes
export function subscribeToEvent(eventId, callback) {
  return supabase
    .channel(`event:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events",
        filter: `id=eq.${eventId}`,
      },
      callback
    )
    .subscribe();
}

// Unsubscribe from real-time changes
export function unsubscribeFromEvent(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

// Test function to verify database access
export async function testDatabase() {
  try {
    console.log("Testing database access...");

    const { data, error } = await supabase
      .from("events")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Database test failed:", error);
      return false;
    }

    console.log("Database test successful");
    return true;
  } catch (error) {
    console.error("Database test error:", error);
    return false;
  }
}
