import { getEvent, updateEvent, setupDatabase } from '../../../lib/db.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    // Setup database tables if they don't exist
    await setupDatabase();

    if (req.method === 'GET') {
      const event = await getEvent(id);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.status(200).json(event);
    } else if (req.method === 'PUT') {
      const updates = req.body;
      const event = await updateEvent(id, updates);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.status(200).json(event);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling event:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
} 