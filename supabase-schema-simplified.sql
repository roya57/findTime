-- Simplified schema using JSON approach
-- Drop existing tables if they exist
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Create simplified events table with JSON columns
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
  participants JSONB DEFAULT '[]'::jsonb, -- Array of participant objects
  availability_data JSONB DEFAULT '{}'::jsonb, -- Nested availability structure
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access
CREATE POLICY "Allow public read access to events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to events" ON events
  FOR UPDATE USING (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Example of how the JSON structure will look:
-- participants: [
--   {"id": 1, "name": "John", "email": "john@example.com"},
--   {"id": 2, "name": "Jane", "email": null}
-- ]
-- 
-- availability_data: {
--   "1": {  // participant ID
--     "2025-08-13": {"09:00": true, "10:00": false, "11:00": true},
--     "2025-08-14": {"09:00": false, "10:00": true}
--   },
--   "2": {
--     "2025-08-13": {"09:00": true, "10:00": true, "11:00": false}
--   }
-- }
