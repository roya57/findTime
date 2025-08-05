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

// Storage functions
const saveEvent = (event) => {
  const events = JSON.parse(localStorage.getItem("findTimeEvents") || "{}");
  events[event.id] = event;
  localStorage.setItem("findTimeEvents", JSON.stringify(events));
};

const getEvent = (eventId) => {
  const events = JSON.parse(localStorage.getItem("findTimeEvents") || "{}");
  return events[eventId] || null;
};

const saveEventData = (eventId, data) => {
  const events = JSON.parse(localStorage.getItem("findTimeEvents") || "{}");
  if (events[eventId]) {
    events[eventId] = { ...events[eventId], ...data };
    localStorage.setItem("findTimeEvents", JSON.stringify(events));
  }
};

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

  const handleEventCreated = (eventData) => {
    const uniqueId = generateUniqueId();
    const eventWithUrl = {
      ...eventData,
      id: uniqueId,
      shareUrl: `${window.location.origin}/event/${uniqueId}`,
      createdAt: new Date().toISOString(),
    };
    setEvent(eventWithUrl);
    saveEvent(eventWithUrl);
    setCurrentView("schedule");
  };

  const handleScheduleComplete = () => {
    setCurrentView("details");
  };

  const handleParticipantsChange = (newParticipants) => {
    setParticipants(newParticipants);
    if (event) {
      saveEventData(event.id, { participants: newParticipants });
    }
  };

  const handleAvailabilityChange = (newAvailability) => {
    setAvailability(newAvailability);
    if (event) {
      saveEventData(event.id, { availability: newAvailability });
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

  useEffect(() => {
    const loadEvent = () => {
      const savedEvent = getEvent(eventId);
      if (savedEvent) {
        setEvent(savedEvent);
        setParticipants(savedEvent.participants || []);
        setAvailability(savedEvent.availability || {});
      } else {
        // Event not found, redirect to create page
        navigate("/", { replace: true });
      }
      setLoading(false);
    };

    loadEvent();
  }, [eventId, navigate]);

  const handleParticipantsChange = (newParticipants) => {
    setParticipants(newParticipants);
    if (event) {
      saveEventData(event.id, { participants: newParticipants });
    }
  };

  const handleAvailabilityChange = (newAvailability) => {
    setAvailability(newAvailability);
    if (event) {
      saveEventData(event.id, { availability: newAvailability });
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
