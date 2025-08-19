import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { addParticipant } from "../lib/db.js";

function ParticipantList({ participants, onParticipantsChange, eventId }) {
  const [newParticipant, setNewParticipant] = useState({ name: "", email: "" });

  const handleAddParticipant = async () => {
    if (!newParticipant.name.trim()) return;

    try {
      console.log("Adding new participant:", newParticipant);

      // Add participant to database
      const savedParticipant = await addParticipant(eventId, newParticipant);

      // Update local state
      const updatedParticipants = [...participants, savedParticipant];
      onParticipantsChange(updatedParticipants);

      // Clear form
      setNewParticipant({ name: "", email: "" });

      console.log("Participant added successfully:", savedParticipant);
    } catch (error) {
      console.error("Failed to add participant:", error);
      alert("Failed to add participant: " + error.message);
    }
  };

  const handleRemoveParticipant = (participantId) => {
    try {
      console.log("Removing participant:", participantId);

      // Remove from local state
      const updatedParticipants = participants.filter(
        (p) => p.id !== participantId
      );
      onParticipantsChange(updatedParticipants);

      console.log("Participant removed successfully");
    } catch (error) {
      console.error("Failed to remove participant:", error);
      alert("Failed to remove participant: " + error.message);
    }
  };

  return (
    <div className="participant-list">
      <div className="add-participant">
        <h3>Join Event</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Your Name"
            value={newParticipant.name}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, name: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={newParticipant.email}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, email: e.target.value })
            }
          />
          <button onClick={handleAddParticipant}>Join</button>
        </div>
      </div>

      <div className="participants">
        <h3>Current Participants</h3>
        {participants.length === 0 ? (
          <p>No participants yet. Be the first to join!</p>
        ) : (
          <ul>
            {participants.map((participant) => (
              <li key={participant.id} className="participant-item">
                <span className="participant-name">{participant.name}</span>
                {participant.email && (
                  <span className="participant-email">
                    ({participant.email})
                  </span>
                )}
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveParticipant(participant.id)}
                  title="Remove participant"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ParticipantList;
