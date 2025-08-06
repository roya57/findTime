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
import { createEvent, getEvent, addParticipant, getParticipants, updateAvailability, getAvailability, subscribeToEvent, unsubscribeFromEvent } from "../lib/db.js";

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
  const [currentView, setCurrentView] = useState("create");
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [availability, setAvailability] = useState({});

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
      
      setEvent(eventWithUrl);
      setCurrentView("schedule");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  const handleScheduleComplete = () => {
    setCurrentView("details");
  };

  const handleParticipantsChange = async (newParticipants) => {
    setParticipants(newParticipants);
    if (event) {
      try {
        // Save participants to Supabase
        for (const participant of newParticipants) {
          if (!participant.id) {
            // New participant - add to database
            const savedParticipant = await addParticipant(event.id, {
              name: participant.name,
              email: participant.email
            });
            participant.id = savedParticipant.id;
          }
        }
      } catch (error) {
        console.error("Error saving participants:", error);
      }
    }
  };

  const handleAvailabilityChange = async (newAvailability) => {
    setAvailability(newAvailability);
    if (event && participants.length > 0) {
      try {
        // Save availability to Supabase
        for (const [key, isAvailable] of Object.entries(newAvailability)) {
          const [participantId, date, timeSlot] = key.split('-');
          const participant = participants.find(p => p.id == participantId);
          if (participant) {
            await updateAvailability(event.id, participant.id, date, timeSlot, isAvailable);
          }
        }
      } catch (error) {
        console.error("Error saving availability:", error);
      }
    }
  };

  return (
    <main className="app-main">
      {currentView === "create" && (
        <EventCreator onEventCreated={handleEventCreated} />
      )}

      {currentView === "schedule" && event && (
        <div className="schedule-view">
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
            onComplete={handleScheduleComplete}
          />
        </div>
      )}

      {currentView === "details" && event && (
        <div className="details-view">
          <EventDetails event={event} />
          <AvailabilityGrid
            event={event}
            participants={participants}
            availability={availability}
            setAvailability={handleAvailabilityChange}
            readOnly={true}
          />
        </div>
      )}
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
          eventAvailability.forEach(item => {
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
    setParticipants(newParticipants);
    if (event) {
      try {
        // Save participants to Supabase
        for (const participant of newParticipants) {
          if (!participant.id) {
            // New participant - add to database
            const savedParticipant = await addParticipant(event.id, {
              name: participant.name,
              email: participant.email
            });
            participant.id = savedParticipant.id;
          }
        }
      } catch (error) {
        console.error("Error saving participants:", error);
      }
    }
  };

  const handleAvailabilityChange = async (newAvailability) => {
    setAvailability(newAvailability);
    if (event && participants.length > 0) {
      try {
        // Save availability to Supabase
        for (const [key, isAvailable] of Object.entries(newAvailability)) {
          const [participantId, date, timeSlot] = key.split('-');
          const participant = participants.find(p => p.id == participantId);
          if (participant) {
            await updateAvailability(event.id, participant.id, date, timeSlot, isAvailable);
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
