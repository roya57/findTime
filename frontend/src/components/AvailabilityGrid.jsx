import React, { useState, useEffect } from "react";
import { format, addDays, startOfWeek, getDay } from "date-fns";

function AvailabilityGrid({
  event,
  participants,
  availability,
  onAvailabilityChange,
}) {
  const [dates, setDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    if (event) {
      console.log("Event data received:", event);
      console.log("Event dateType:", event.dateType);
      console.log("Event startDate:", event.startDate);
      console.log("Event endDate:", event.endDate);
      console.log("Event selectedDays:", event.selectedDays);
      console.log("Event startTime:", event.startTime);
      console.log("Event endTime:", event.endTime);
      console.log("Event duration:", event.duration);

      generateDates();
      generateTimeSlots();
    } else {
      console.log("No event data received");
    }
  }, [event]);

  const generateDates = () => {
    let dateArray = [];

    console.log("generateDates called with dateType:", event.dateType);
    console.log(
      "event.startDate:",
      event.startDate,
      "type:",
      typeof event.startDate
    );
    console.log("event.endDate:", event.endDate, "type:", typeof event.endDate);
    console.log(
      "event.selectedDays:",
      event.selectedDays,
      "type:",
      typeof event.selectedDays
    );

    if (event.dateType === "specific") {
      // For specific dates, generate dates between start and end
      if (event.startDate && event.endDate) {
        console.log(
          "Generating specific dates from:",
          event.startDate,
          "to",
          event.endDate
        );

        // Ensure dates are properly parsed
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);

        console.log(
          "Parsed start date:",
          start,
          "isValid:",
          !isNaN(start.getTime())
        );
        console.log("Parsed end date:", end, "isValid:", !isNaN(end.getTime()));

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          let current = new Date(start);

          while (current <= end) {
            dateArray.push(new Date(current));
            current = addDays(current, 1);
          }
        } else {
          console.error(
            "Invalid date format - start or end date is not a valid date"
          );
        }
      } else {
        console.log("Missing startDate or endDate for specific dates");
        console.log("startDate:", event.startDate);
        console.log("endDate:", event.endDate);
      }
    } else if (event.dateType === "daysOfWeek" || event.dateType === "weekly") {
      // For days of week, show next occurrence of each selected day
      if (event.selectedDays && event.selectedDays.length > 0) {
        console.log("Generating days of week for:", event.selectedDays);
        const today = new Date();
        const nextWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday start

        event.selectedDays.forEach((dayIndex) => {
          const targetDay = addDays(nextWeek, dayIndex);
          // If the day has passed, move to next week
          if (targetDay <= today) {
            targetDay.setDate(targetDay.getDate() + 7);
          }
          dateArray.push(targetDay);
        });
      } else {
        console.log("No selectedDays for days of week");
        console.log("selectedDays value:", event.selectedDays);
      }
    } else {
      console.error("Unknown dateType:", event.dateType);
      console.log("Available dateType values:", ["specific", "daysOfWeek"]);
    }

    console.log("Generated dateArray:", dateArray);
    console.log("Final dates array length:", dateArray.length);
    setDates(dateArray);
  };

  const generateTimeSlots = () => {
    if (!event.startTime || !event.endTime || !event.duration) {
      console.log("Missing time data:", {
        startTime: event.startTime,
        endTime: event.endTime,
        duration: event.duration,
      });
      return;
    }

    console.log(
      "Generating time slots from:",
      event.startTime,
      "to",
      event.endTime,
      "with duration:",
      event.duration
    );

    console.log(
      "startTime type:",
      typeof event.startTime,
      "value:",
      event.startTime
    );
    console.log("endTime type:", typeof event.endTime, "value:", event.endTime);
    console.log(
      "duration type:",
      typeof event.duration,
      "value:",
      event.duration
    );

    try {
      const slots = [];
      const start = new Date(`2000-01-01T${event.startTime}`);
      const end = new Date(`2000-01-01T${event.endTime}`);
      const durationMs = event.duration * 60 * 1000;

      console.log(
        "Parsed start time:",
        start,
        "isValid:",
        !isNaN(start.getTime())
      );
      console.log("Parsed end time:", end, "isValid:", !isNaN(end.getTime()));
      console.log("Duration in ms:", durationMs);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error("Invalid time format - cannot parse start or end time");
        return;
      }

      let current = new Date(start);
      while (current < end) {
        const timeString = format(current, "HH:mm");
        console.log("Adding time slot:", timeString, "from:", current);
        slots.push(timeString);
        current = new Date(current.getTime() + durationMs);
      }

      console.log("Generated timeSlots:", slots);
      setTimeSlots(slots);
    } catch (error) {
      console.error("Error generating time slots:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        startTime: event.startTime,
        endTime: event.endTime,
        duration: event.duration,
      });
    }
  };

  const toggleAvailability = (participantId, date, timeSlot) => {
    if (!participantId) return;

    console.log("Toggling availability for:", {
      participantId,
      date,
      timeSlot,
    });

    // Ensure date is a proper Date object
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (typeof date === "number") {
      dateObj = new Date(date);
    } else {
      console.error("Invalid date format:", date);
      return;
    }

    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date object:", dateObj);
      return;
    }

    console.log("Date object:", dateObj.toString());
    console.log("Date ISO:", dateObj.toISOString());

    const formattedDate = format(dateObj, "yyyy-MM-dd");
    console.log("Formatted date:", formattedDate);

    // Create new availability object
    const newAvailability = { ...availability };

    // Initialize nested structure if it doesn't exist
    if (!newAvailability[participantId]) {
      newAvailability[participantId] = {};
    }
    if (!newAvailability[participantId][formattedDate]) {
      newAvailability[participantId][formattedDate] = {};
    }

    // Toggle the availability
    const currentValue =
      newAvailability[participantId][formattedDate][timeSlot] || false;
    newAvailability[participantId][formattedDate][timeSlot] = !currentValue;

    console.log("New availability object:", newAvailability);

    // Update parent component
    onAvailabilityChange(newAvailability);
  };

  const getAvailabilityCount = (date, timeSlot) => {
    if (!availability) return 0;

    // Ensure date is a proper Date object
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (typeof date === "number") {
      dateObj = new Date(date);
    } else {
      console.error("Invalid date format in getAvailabilityCount:", date);
      return 0;
    }

    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date object in getAvailabilityCount:", dateObj);
      return 0;
    }

    const formattedDate = format(dateObj, "yyyy-MM-dd");

    let count = 0;
    Object.values(availability).forEach((participantAvailability) => {
      if (
        participantAvailability[formattedDate] &&
        participantAvailability[formattedDate][timeSlot]
      ) {
        count++;
      }
    });

    return count;
  };

  const getBestTimes = () => {
    if (!availability || !dates.length || !timeSlots.length) return [];

    const timeSlotCounts = {};

    dates.forEach((date) => {
      const formattedDate = format(date, "yyyy-MM-dd");
      timeSlots.forEach((timeSlot) => {
        const key = `${formattedDate}-${timeSlot}`;
        timeSlotCounts[key] = getAvailabilityCount(date, timeSlot);
      });
    });

    // Sort by count (descending) and return top 3
    return Object.entries(timeSlotCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key, count]) => {
        const [date, time] = key.split("-");
        return { date, time, count };
      });
  };

  if (!event || !dates.length || !timeSlots.length) {
    console.log("Grid loading condition check:", {
      hasEvent: !!event,
      eventKeys: event ? Object.keys(event) : [],
      datesLength: dates.length,
      timeSlotsLength: timeSlots.length,
      event: event,
    });
    return <div className="loading">Loading availability grid...</div>;
  }

  return (
    <div className="availability-grid">
      <div className="grid-header">
        <div className="time-column-header">Time</div>
        {dates.map((date, index) => (
          <div key={index} className="date-column-header">
            <div className="day-name">
              {event.dateType === "daysOfWeek"
                ? format(date, "EEEE")
                : format(date, "EEE")}
            </div>
            {event.dateType === "specific" && (
              <div className="date-small">{format(date, "MMM d")}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-body">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className="time-row">
            <div className="time-slot">{timeSlot}</div>
            {dates.map((date, dateIndex) => {
              const formattedDate = format(date, "yyyy-MM-dd");
              const availabilityCount = getAvailabilityCount(date, timeSlot);
              const isBestTime = getBestTimes().some(
                (bt) => bt.date === formattedDate && bt.time === timeSlot
              );

              return (
                <div
                  key={`${timeSlot}-${dateIndex}`}
                  className={`availability-cell ${
                    isBestTime ? "best-time" : ""
                  }`}
                  onClick={() => {
                    // For now, just show the count
                    // In a real app, you might want to show who's available
                    console.log(
                      `Time slot ${timeSlot} on ${formattedDate} has ${availabilityCount} participants available`
                    );
                  }}
                >
                  <span className="availability-count">
                    {availabilityCount}
                  </span>
                  {isBestTime && <span className="best-time-indicator">★</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="grid-footer">
        <div className="best-times">
          <h4>Best Times:</h4>
          <ul>
            {getBestTimes().map((bestTime, index) => (
              <li key={index}>
                {format(new Date(bestTime.date), "MMM d")} at {bestTime.time}(
                {bestTime.count} participants available)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AvailabilityGrid;
