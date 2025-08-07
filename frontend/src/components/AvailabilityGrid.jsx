import { useState, useEffect } from "react";
import {
  format,
  addDays,
  parseISO,
  isSameDay,
  startOfWeek,
  addWeeks,
} from "date-fns";
import { Calendar, Clock, Check, X } from "lucide-react";

const AvailabilityGrid = ({
  event,
  participants,
  availability,
  setAvailability,
  onComplete,
  readOnly = false,
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [dates, setDates] = useState([]);

  // Generate time slots and dates when event changes
  useEffect(() => {
    if (!event) return;

    // Generate dates based on date type
    let dateArray = [];

    if (event.dateType === "specific") {
      // Generate dates between start and end date
      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);

      let currentDate = startDate;
      while (currentDate <= endDate) {
        dateArray.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }
    } else if (event.dateType === "weekly" && event.selectedDays) {
      // Generate one date for each selected day of the week (next occurrence)
      const today = new Date();
      const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday start

      const dayToNumber = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      };

      // Find the next occurrence of each selected day
      event.selectedDays.forEach((day) => {
        const dayNumber = dayToNumber[day];
        if (dayNumber !== undefined) {
          // Start from this week
          let date = addDays(startOfThisWeek, dayNumber);

          // If the day has already passed this week, move to next week
          if (date < today) {
            date = addDays(date, 7);
          }

          dateArray.push(date);
        }
      });
    }

    setDates(dateArray);

    // Generate time slots
    const slots = [];
    const startTime = new Date(`2000-01-01T${event.startTime}`);
    const endTime = new Date(`2000-01-01T${event.endTime}`);
    const duration = event.duration;

    let currentTime = startTime;
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      if (slotEnd <= endTime) {
        slots.push({
          start: format(currentTime, "HH:mm"),
          end: format(slotEnd, "HH:mm"),
          display: format(currentTime, "h:mm a"),
        });
      }
      currentTime = slotEnd;
    }
    setTimeSlots(slots);
  }, [event]);

  const toggleAvailability = (participantId, date, timeSlot) => {
    if (readOnly) return;

    const key = `${participantId}-${format(date, "yyyy-MM-dd")}-${
      timeSlot.start
    }`;
    setAvailability((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getAvailabilityCount = (date, timeSlot) => {
    return participants.filter((participant) => {
      const key = `${participant.id}-${format(date, "yyyy-MM-dd")}-${
        timeSlot.start
      }`;
      return availability[key];
    }).length;
  };

  const getBestTimes = () => {
    const timeCounts = {};

    dates.forEach((date) => {
      timeSlots.forEach((slot) => {
        const count = getAvailabilityCount(date, slot);
        const key = `${format(date, "yyyy-MM-dd")}-${slot.start}`;
        timeCounts[key] = {
          date,
          slot,
          count,
          participants: participants.filter((participant) => {
            const availKey = `${participant.id}-${format(date, "yyyy-MM-dd")}-${
              slot.start
            }`;
            return availability[availKey];
          }),
        };
      });
    });

    return Object.values(timeCounts)
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getDayName = (date) => {
    const dayMap = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };
    return dayMap[date.getDay()];
  };

  const bestTimes = getBestTimes();

  return (
    <div className="availability-grid">
      <div className="grid-header">
        <h3>
          <Calendar size={20} />
          Availability Grid
        </h3>
        {!readOnly && (
          <div className="participant-selector">
            <label>Select yourself to mark availability:</label>
            <select
              value={selectedParticipant || ""}
              onChange={(e) => setSelectedParticipant(e.target.value || null)}
            >
              <option value="">Choose your name...</option>
              {participants.map((p, index) => (
                <option key={p.id || index} value={p.id || index}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!readOnly && selectedParticipant && (
        <div className="instructions">
          <p>Click on time slots to mark your availability</p>
        </div>
      )}

      {dates.length === 0 ? (
        <div className="no-dates-message">
          <p>
            No dates available for scheduling. Please check your event
            configuration.
          </p>
        </div>
      ) : (
        <>
          <div className="grid-container">
            <div className="time-column">
              <div className="time-header">Time</div>
              {timeSlots.map((slot) => (
                <div key={slot.start} className="time-slot">
                  {slot.display}
                </div>
              ))}
            </div>

            {dates.map((date) => (
              <div key={format(date, "yyyy-MM-dd")} className="date-column">
                <div
                  className={`date-header ${
                    event.dateType === "specific" ? "specific-dates" : ""
                  }`}
                >
                  {event.dateType === "specific" ? (
                    <>
                      {format(date, "EEE")}
                      <br />
                      <span className="date-number">
                        {format(date, "MMM d")}
                      </span>
                    </>
                  ) : (
                    getDayName(date)
                  )}
                </div>
                {timeSlots.map((slot) => {
                  const key = `${selectedParticipant}-${format(
                    date,
                    "yyyy-MM-dd"
                  )}-${slot.start}`;
                  const isAvailable = availability[key];
                  const count = getAvailabilityCount(date, slot);
                  const isBestTime = bestTimes.some(
                    (bt) =>
                      isSameDay(bt.date, date) && bt.slot.start === slot.start
                  );

                  return (
                    <div
                      key={`${format(date, "yyyy-MM-dd")}-${slot.start}`}
                      className={`grid-cell ${isAvailable ? "available" : ""} ${
                        isBestTime ? "best-time" : ""
                      }`}
                      onClick={() =>
                        toggleAvailability(selectedParticipant, date, slot)
                      }
                    >
                      {isAvailable && <Check size={16} />}
                      {count > 0 && <span className="count">{count}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {bestTimes.length > 0 && (
            <div className="best-times">
              <h4>
                <Clock size={16} />
                Best Available Times
              </h4>
              <div className="best-times-list">
                {bestTimes.map((item, index) => (
                  <div key={index} className="best-time-item">
                    <span className="date">
                      {event.dateType === "specific"
                        ? format(item.date, "EEE, MMM d")
                        : `${getDayName(item.date)}, ${format(
                            item.date,
                            "MMM d"
                          )}`}
                    </span>
                    <span className="time">{item.slot.display}</span>
                    <span className="participants">
                      {item.count} participant{item.count > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!readOnly && participants.length > 0 && dates.length > 0 && (
        <button
          onClick={onComplete}
          className="complete-button"
          disabled={Object.keys(availability).length === 0}
        >
          Complete Scheduling
        </button>
      )}
    </div>
  );
};

export default AvailabilityGrid;
