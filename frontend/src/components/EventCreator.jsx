import { useState } from "react";
import { Calendar, Clock, Users, Plus } from "lucide-react";

const EventCreator = ({ onSubmit }) => {
  const [dateType, setDateType] = useState("specific"); // "specific" or "weekly"
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    selectedDays: [], // For weekly recurrence
    startTime: "09:00",
    endTime: "17:00",
    duration: 60, // minutes
  });

  const daysOfWeek = [
    { value: 0, label: "Monday" },
    { value: 1, label: "Tuesday" },
    { value: 2, label: "Wednesday" },
    { value: 3, label: "Thursday" },
    { value: 4, label: "Friday" },
    { value: 5, label: "Saturday" },
    { value: 6, label: "Sunday" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...eventData,
      dateType,
    });
  };

  const handleInputChange = (field, value) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDayToggle = (day) => {
    setEventData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  return (
    <div className="event-creator">
      <div className="creator-header">
        <h2>Create New Event</h2>
        <p>Set up your event details and time preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">
            <Calendar size={20} />
            Event Title
          </label>
          <input
            type="text"
            id="title"
            value={eventData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Team meeting, Lunch, etc."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            <Users size={20} />
            Description
          </label>
          <textarea
            id="description"
            value={eventData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="What's this event about?"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateType">
            <Calendar size={20} />
            Date Selection Type
          </label>
          <div className="date-type-selector">
            <label className="radio-option">
              <input
                type="radio"
                name="dateType"
                value="specific"
                checked={dateType === "specific"}
                onChange={(e) => setDateType(e.target.value)}
              />
              <span className="radio-label">Specific Dates</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="dateType"
                value="daysOfWeek"
                checked={dateType === "daysOfWeek"}
                onChange={(e) => setDateType(e.target.value)}
              />
              <span className="radio-label">Days of Week</span>
            </label>
          </div>
        </div>

        {dateType === "specific" && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={eventData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={eventData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {dateType === "daysOfWeek" && (
          <div className="form-group">
            <label>Select Days of Week</label>
            <div className="days-selector">
              {daysOfWeek.map((day) => (
                <label key={day.value} className="day-option">
                  <input
                    type="checkbox"
                    checked={eventData.selectedDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                  />
                  <span className="day-label">{day.label}</span>
                </label>
              ))}
            </div>
            {eventData.selectedDays.length === 0 && (
              <p className="error-message">
                Please select at least one day of the week
              </p>
            )}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">
              <Clock size={20} />
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              value={eventData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">
              <Clock size={20} />
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              value={eventData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <select
              id="duration"
              value={eventData.duration}
              onChange={(e) =>
                handleInputChange("duration", parseInt(e.target.value))
              }
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="create-button"
          disabled={
            dateType === "daysOfWeek" && eventData.selectedDays.length === 0
          }
        >
          <Plus size={20} />
          Create Event
        </button>
      </form>
    </div>
  );
};

export default EventCreator;
