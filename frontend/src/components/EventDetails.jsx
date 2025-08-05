import { Calendar, Clock, Users, MapPin, Copy, Share2 } from "lucide-react";
import { useState } from "react";

const EventDetails = ({ event }) => {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDayLabel = (dayValue) => {
    const dayMap = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    };
    return dayMap[dayValue] || dayValue;
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(event.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="event-details">
      <div className="event-header">
        <h2>{event.title}</h2>
        {event.description && (
          <p className="event-description">{event.description}</p>
        )}
      </div>

      <div className="event-info">
        <div className="info-item">
          <Calendar size={20} />
          <div>
            <span className="label">Date Type:</span>
            <span className="value">
              {event.dateType === "specific"
                ? "Specific Dates"
                : "Days of Week"}
            </span>
          </div>
        </div>

        {event.dateType === "specific" ? (
          <div className="info-item">
            <Calendar size={20} />
            <div>
              <span className="label">Date Range:</span>
              <span className="value">
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>
          </div>
        ) : (
          <div className="info-item">
            <Calendar size={20} />
            <div>
              <span className="label">Selected Days:</span>
              <span className="value">
                {event.selectedDays && event.selectedDays.length > 0
                  ? event.selectedDays.map(getDayLabel).join(", ")
                  : "No days selected"}
              </span>
            </div>
          </div>
        )}

        <div className="info-item">
          <Clock size={20} />
          <div>
            <span className="label">Time Window:</span>
            <span className="value">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
        </div>

        <div className="info-item">
          <Users size={20} />
          <div>
            <span className="label">Duration:</span>
            <span className="value">{event.duration} minutes</span>
          </div>
        </div>

        {event.shareUrl && (
          <div className="info-item share-url-item">
            <Share2 size={20} />
            <div className="share-url-container">
              <span className="label">Share URL:</span>
              <div className="url-display">
                <input
                  type="text"
                  value={event.shareUrl}
                  readOnly
                  className="url-input"
                />
                <button
                  onClick={handleCopyUrl}
                  className="copy-button"
                  title="Copy URL"
                >
                  <Copy size={16} />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
