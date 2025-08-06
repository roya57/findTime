import { updateAvailability, getAvailability, getAvailabilityCount, setupDatabase } from '../../../lib/db.js';

export default async function handler(req, res) {
  try {
    // Setup database tables if they don't exist
    await setupDatabase();

    if (req.method === 'POST') {
      const { eventId, participantId, date, timeSlot, isAvailable } = req.body;
      
      if (!eventId || !participantId || !date || !timeSlot) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const availability = await updateAvailability(eventId, participantId, date, timeSlot, isAvailable);
      res.status(200).json(availability);
    } else if (req.method === 'GET') {
      const { eventId } = req.query;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }
      
      const availability = await getAvailability(eventId);
      res.status(200).json(availability);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling availability:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
} 