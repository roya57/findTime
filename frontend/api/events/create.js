import { createEvent, setupDatabase } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Setup database tables if they don't exist
    await setupDatabase();

    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.id || !eventData.title || !eventData.dateType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the event
    const event = await createEvent(eventData);
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
} 