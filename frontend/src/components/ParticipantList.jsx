import { useState } from "react";
import { Users, UserPlus, UserMinus, Mail } from "lucide-react";

const ParticipantList = ({ participants, setParticipants }) => {
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
  });

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (newParticipant.name.trim()) {
      setParticipants((prev) => [
        ...prev,
        {
          name: newParticipant.name.trim(),
          email: newParticipant.email.trim() || null,
          availability: {},
        },
      ]);
      setNewParticipant({ name: "", email: "" });
    }
  };

  const handleRemoveParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleInputChange = (field, value) => {
    setNewParticipant((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="participant-list">
      <div className="participant-header">
        <h3>
          <Users size={20} />
          Participants ({participants.length})
        </h3>
      </div>

      <form onSubmit={handleAddParticipant} className="add-participant-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="participantName">Name *</label>
            <input
              type="text"
              id="participantName"
              value={newParticipant.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="participantEmail">
              <Mail size={16} />
              Email (optional)
            </label>
            <input
              type="email"
              id="participantEmail"
              value={newParticipant.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email (optional)"
            />
          </div>

          <button type="submit" className="add-button">
            <UserPlus size={16} />
            Add
          </button>
        </div>
      </form>

      <div className="participants">
        {participants.length === 0 ? (
          <p className="no-participants">No participants added yet</p>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="participant-item">
              <div className="participant-info">
                <span className="participant-name">{participant.name}</span>
                {participant.email && (
                  <span className="participant-email">{participant.email}</span>
                )}
              </div>
              <button
                onClick={() => handleRemoveParticipant(participant.id)}
                className="remove-button"
                title="Remove participant"
              >
                <UserMinus size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
