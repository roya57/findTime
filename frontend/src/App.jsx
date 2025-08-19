import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import EventCreator from "./components/EventCreator";
import AvailabilityGrid from "./components/AvailabilityGrid";
import ParticipantList from "./components/ParticipantList";
import EventDetails from "./components/EventDetails";
import {
  createEvent,
  getEvent,
  addParticipant,
  updateAvailabilityBulk,
} from "./lib/db.js";
import { supabase } from "./lib/supabase.js";
import "./App.css";

// Main App component with routing
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CreateEvent />} />
          <Route path="/event/:eventId" element={<EventView />} />
        </Routes>
      </div>
    </Router>
  );
}

// Create Event Page
function CreateEvent() {
  const [currentView, setCurrentView] = useState("event");
  const [event, setEvent] = useState({
    title: "",
    description: "",
    dateType: "specific",
    startDate: "",
    endDate: "",
    selectedDays: [],
    startTime: "09:00",
    endTime: "17:00",
    duration: 60,
  });

  const handleEventSubmit = async (eventData) => {
    try {
      console.log("Creating event with data:", eventData);

      // Generate unique ID
      const eventId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Prepare event data for database
      const eventWithId = {
        id: eventId,
        title: eventData.title,
        description: eventData.description,
        date_type: eventData.dateType,
        start_date: eventData.startDate || null,
        end_date: eventData.endDate || null,
        selected_days: eventData.selectedDays || null,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        duration: eventData.duration,
        participants: [],
        availability_data: {},
      };

      console.log("Event data to save:", eventWithId);

      // Save to Supabase
      await createEvent(eventWithId);

      // Navigate to the unique event URL instead of staying on create page
      window.location.href = `/event/${eventId}`;
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event: " + error.message);
    }
  };

  return (
    <div className="create-event-page">
      <h1>Create New Event</h1>
      <EventCreator onSubmit={handleEventSubmit} />
    </div>
  );
}

// Event View Page
function EventView() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      console.log("Loading event data for:", eventId);

      // Load event data
      const eventData = await getEvent(eventId);
      setEvent(eventData);

      // Set participants and availability from JSON data
      setParticipants(eventData.participants || []);
      setAvailability(eventData.availabilityData || {});

      console.log("Event data loaded:", eventData);
      console.log("Participants:", eventData.participants);
      console.log("Availability:", eventData.availabilityData);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load event data:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleParticipantsChange = async (newParticipants) => {
    try {
      console.log("handleParticipantsChange called with:", newParticipants);

      // Update local state
      setParticipants(newParticipants);

      // Update event in database
      const updatedEvent = { ...event, participants: newParticipants };
      setEvent(updatedEvent);

      // Save to database
      const { data, error } = await supabase
        .from("events")
        .update({ participants: newParticipants })
        .eq("id", event.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating participants:", error);
        throw error;
      }

      console.log("Participants updated successfully:", data);
    } catch (error) {
      console.error("Failed to update participants:", error);
      alert("Failed to update participants: " + error.message);
    }
  };

  const handleAvailabilityChange = async (newAvailability) => {
    try {
      console.log("handleAvailabilityChange called with:", newAvailability);

      // Update local state
      setAvailability(newAvailability);

      // Update event in database
      const updatedEvent = { ...event, availabilityData: newAvailability };
      setEvent(updatedEvent);

      // Save to database using bulk update
      await updateAvailabilityBulk(event.id, newAvailability);

      console.log("Availability updated successfully");
    } catch (error) {
      console.error("Failed to update availability:", error);
      alert("Failed to update availability: " + error.message);
    }
  };

  const handleScheduleComplete = async () => {
    try {
      console.log("Final save of availability:", availability);

      // Save final availability to database
      await updateAvailabilityBulk(event.id, availability);

      console.log("Schedule completed successfully");
      alert("Schedule saved successfully!");
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert("Failed to save schedule: " + error.message);
    }
  };

  if (loading) return <div className="loading">Loading event...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  return (
    <div className="event-view">
      <EventDetails event={event} />

      <div className="participants-section">
        <h2>Participants</h2>
        <ParticipantList
          participants={participants}
          onParticipantsChange={handleParticipantsChange}
          eventId={event.id}
        />
      </div>

      <div className="availability-section">
        <h2>Availability Grid</h2>
        <AvailabilityGrid
          event={event}
          participants={participants}
          availability={availability}
          onAvailabilityChange={handleAvailabilityChange}
        />

        <button
          className="complete-scheduling-btn"
          onClick={handleScheduleComplete}
        >
          Complete Scheduling
        </button>
      </div>
    </div>
  );
}

export default App;
