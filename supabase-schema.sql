-- Create events table
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
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
  participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL,
  is_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, participant_id, date, time_slot)
);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (for now)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow public read access to events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to events" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to participants" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to participants" ON participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access to participants" ON participants
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access to availability" ON availability
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to availability" ON availability
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to availability" ON availability
  FOR UPDATE USING (true);

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE availability; 