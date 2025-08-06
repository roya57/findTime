import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import EventCreator from "./components/EventCreator";
import AvailabilityGrid from "./components/AvailabilityGrid";
import ParticipantList from "./components/ParticipantList";
import EventDetails from "./components/EventDetails";
import {
  createEvent,
  getEvent,
  addParticipant,
  getParticipants,
  updateAvailability,
  getAvailability,
  subscribeToEvent,
  unsubscribeFromEvent,
} from "../lib/db.js";

// Main App Component
function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>FindTime</h1>
          <p>Schedule time that works for everyone</p>
        </header>
        <Routes>
          <Route path="/" element={<CreateEvent />} />
          <Route path="/event/:eventId" element={<EventView />} />
        </Routes>
      </div>
    </Router>
  );
}

// Create Event Component
function CreateEvent() {
  const navigate = useNavigate();

  const generateUniqueId = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  const handleEventCreated = async (eventData) => {
    try {
      const uniqueId = generateUniqueId();
      const eventWithUrl = {
        ...eventData,
        id: uniqueId,
        shareUrl: `${window.location.origin}/event/${uniqueId}`,
        createdAt: new Date().toISOString(),
      };

      // Save to Supabase
      await createEvent(eventWithUrl);

      // Navigate to the unique event URL instead of staying on create page
      navigate(`/event/${uniqueId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  return (
    <main className="app-main">
      <EventCreator onEventCreated={handleEventCreated} />
    </main>
  );
}

// Event View Component (for shared URLs)
function EventView() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const savedEvent = await getEvent(eventId);
        if (savedEvent) {
          setEvent(savedEvent);

          // Load participants
          const eventParticipants = await getParticipants(eventId);
          setParticipants(eventParticipants);

          // Load availability
          const eventAvailability = await getAvailability(eventId);
          const availabilityMap = {};
          eventAvailability.forEach((item) => {
            const key = `${item.participant_id}-${item.date}-${item.time_slot}`;
            availabilityMap[key] = item.is_available;
          });
          setAvailability(availabilityMap);

          // Set up real-time subscription
          const sub = subscribeToEvent(eventId, (payload) => {
            console.log("Real-time update:", payload);
            // Reload data when changes occur
            loadEvent();
          });
          setSubscription(sub);
        } else {
          // Event not found, redirect to create page
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Error loading event:", error);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadEvent();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        unsubscribeFromEvent(subscription);
      }
    };
  }, [eventId, navigate]);

  const handleParticipantsChange = async (newParticipants) => {
    console.log(
      "EventView handleParticipantsChange called with:",
      newParticipants
    );
    console.log("Array length:", newParticipants.length);
    console.log("Array type:", typeof newParticipants);
    console.log("Is array:", Array.isArray(newParticipants));
    console.log("JSON stringified:", JSON.stringify(newParticipants, null, 2));

    // Debug function availability
    console.log("addParticipant function:", typeof addParticipant);
    console.log("event object:", event);
    console.log("event.id:", event?.id);

    // Test if we can access the database functions
    console.log("Available functions:", {
      createEvent: typeof createEvent,
      getEvent: typeof getEvent,
      addParticipant: typeof addParticipant,
      getParticipants: typeof getParticipants,
      updateAvailability: typeof updateAvailability,
      getAvailability: typeof getAvailability,
      subscribeToEvent: typeof subscribeToEvent,
      unsubscribeFromEvent: typeof unsubscribeFromEvent,
    });

    setParticipants(newParticipants);
    if (event) {
      console.log("Event exists, processing participants...");
      try {
        // Save participants to Supabase
        for (const participant of newParticipants) {
          console.log("Processing participant:", participant);
          if (!participant.id) {
            console.log("Adding new participant to database:", participant);
            // New participant - add to database
            const savedParticipant = await addParticipant(event.id, {
              name: participant.name,
              email: participant.email,
            });
            console.log("Saved participant:", savedParticipant);
            participant.id = savedParticipant.id;
          } else {
            console.log("Participant already has ID:", participant.id);
          }
        }
      } catch (error) {
        console.error("Error saving participants:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
    } else {
      console.log("No event found, skipping database save");
    }
  };

  const handleAvailabilityChange = async (newAvailability) => {
    setAvailability(newAvailability);
    if (event && participants.length > 0) {
      try {
        // Save availability to Supabase
        for (const [key, isAvailable] of Object.entries(newAvailability)) {
          const [participantId, date, timeSlot] = key.split("-");
          const participant = participants.find((p) => p.id == participantId);
          if (participant) {
            await updateAvailability(
              event.id,
              participant.id,
              date,
              timeSlot,
              isAvailable
            );
          }
        }
      } catch (error) {
        console.error("Error saving availability:", error);
      }
    }
  };

  if (loading) {
    return (
      <main className="app-main">
        <div className="loading">
          <p>Loading event...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className="app-main">
      <div className="shared-event-view">
        <div className="shared-event-header">
          <h2>Shared Event</h2>
          <p>This event was shared with you</p>
        </div>

        <EventDetails event={event} />
        <ParticipantList
          participants={participants}
          setParticipants={handleParticipantsChange}
        />
        <AvailabilityGrid
          event={event}
          participants={participants}
          availability={availability}
          setAvailability={handleAvailabilityChange}
          readOnly={false}
        />
      </div>
    </main>
  );
}

export default App;
