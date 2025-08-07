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
      <div className="availability-header">
        <h3>
          <Calendar size={20} />
          Select Your Availability
        </h3>
        <p className="availability-subtitle">
          Click on the time slots when you're available to attend
        </p>
      </div>

      {participants.length === 0 ? (
        <div className="no-participants-message">
          <p>Add yourself as a participant first to select your availability</p>
        </div>
      ) : (
        <>
          <div className="participant-selector">
            <label htmlFor="participantSelect">Select yourself:</label>
            <select
              id="participantSelect"
              value={selectedParticipant || ""}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="participant-dropdown"
            >
              <option value="">Choose your name...</option>
              {participants.map((participant, index) => (
                <option
                  key={participant.id || index}
                  value={participant.id || index}
                >
                  {participant.name}
                </option>
              ))}
            </select>
          </div>

          {selectedParticipant && (
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
                <div key={date.toISOString()} className="date-column">
                  <div className="date-header">
                    <div className="day-name">
                      {event.dateType === "specific"
                        ? format(date, "EEE")
                        : getDayName(date)}
                    </div>
                    {event.dateType === "specific" && (
                      <div className="date-number">{format(date, "MMM d")}</div>
                    )}
                  </div>

                  {timeSlots.map((timeSlot) => (
                    <div
                      key={`${date.toISOString()}-${timeSlot.start}`}
                      className={`availability-cell ${
                        availability[
                          `${selectedParticipant}-${format(
                            date,
                            "yyyy-MM-dd"
                          )}-${timeSlot.start}`
                        ]
                          ? "available"
                          : "unavailable"
                      }`}
                      onClick={() =>
                        toggleAvailability(selectedParticipant, date, timeSlot)
                      }
                    >
                      {availability[
                        `${selectedParticipant}-${format(date, "yyyy-MM-dd")}-${
                          timeSlot.start
                        }`
                      ] ? (
                        <Check size={16} />
                      ) : (
                        <X size={16} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {selectedParticipant && (
            <div className="availability-summary">
              <h4>Best Meeting Times</h4>
              <div className="best-times">
                {getBestTimes().map((time, index) => (
                  <div key={index} className="best-time">
                    <Clock size={16} />
                    {time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AvailabilityGrid;
