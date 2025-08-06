import { sql } from '@vercel/postgres';

// Database schema setup
export async function setupDatabase() {
  try {
    // Create events table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date_type VARCHAR(50) NOT NULL,
        start_date DATE,
        end_date DATE,
        selected_days JSONB,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        duration INTEGER NOT NULL,
        share_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create participants table
    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create availability table
    await sql`
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time_slot VARCHAR(10) NOT NULL,
        is_available BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, participant_id, date, time_slot)
      )
    `;

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

// Event functions
export async function createEvent(eventData) {
  const { 
    id, title, description, dateType, startDate, endDate, 
    selectedDays, startTime, endTime, duration, shareUrl 
  } = eventData;

  try {
    const result = await sql`
      INSERT INTO events (
        id, title, description, date_type, start_date, end_date, 
        selected_days, start_time, end_time, duration, share_url
      ) VALUES (
        ${id}, ${title}, ${description}, ${dateType}, ${startDate}, ${endDate},
        ${JSON.stringify(selectedDays)}, ${startTime}, ${endTime}, ${duration}, ${shareUrl}
      ) RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function getEvent(eventId) {
  try {
    const result = await sql`
      SELECT * FROM events WHERE id = ${eventId}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
}

export async function updateEvent(eventId, updates) {
  try {
    const result = await sql`
      UPDATE events 
      SET 
        title = COALESCE(${updates.title}, title),
        description = COALESCE(${updates.description}, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${eventId}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

// Participant functions
export async function addParticipant(eventId, participantData) {
  const { name, email } = participantData;
  
  try {
    const result = await sql`
      INSERT INTO participants (event_id, name, email)
      VALUES (${eventId}, ${name}, ${email})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
}

export async function getParticipants(eventId) {
  try {
    const result = await sql`
      SELECT * FROM participants 
      WHERE event_id = ${eventId}
      ORDER BY created_at ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting participants:', error);
    throw error;
  }
}

export async function removeParticipant(participantId) {
  try {
    await sql`
      DELETE FROM participants WHERE id = ${participantId}
    `;
    return true;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
}

// Availability functions
export async function updateAvailability(eventId, participantId, date, timeSlot, isAvailable) {
  try {
    const result = await sql`
      INSERT INTO availability (event_id, participant_id, date, time_slot, is_available)
      VALUES (${eventId}, ${participantId}, ${date}, ${timeSlot}, ${isAvailable})
      ON CONFLICT (event_id, participant_id, date, time_slot)
      DO UPDATE SET 
        is_available = EXCLUDED.is_available,
        created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
}

export async function getAvailability(eventId) {
  try {
    const result = await sql`
      SELECT 
        a.*,
        p.name as participant_name,
        p.email as participant_email
      FROM availability a
      JOIN participants p ON a.participant_id = p.id
      WHERE a.event_id = ${eventId}
      ORDER BY a.date, a.time_slot
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting availability:', error);
    throw error;
  }
}

export async function getAvailabilityCount(eventId, date, timeSlot) {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM availability 
      WHERE event_id = ${eventId} 
        AND date = ${date} 
        AND time_slot = ${timeSlot}
        AND is_available = true
    `;
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting availability count:', error);
    throw error;
  }
} 