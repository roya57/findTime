import { addParticipant, getParticipants, removeParticipant, setupDatabase } from '../../../lib/db.js';

export default async function handler(req, res) {
  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    // Setup database tables if they don't exist
    await setupDatabase();

    if (req.method === 'GET') {
      const participants = await getParticipants(eventId);
      res.status(200).json(participants);
    } else if (req.method === 'POST') {
      const participantData = req.body;
      
      if (!participantData.name || !participantData.email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      
      const participant = await addParticipant(eventId, participantData);
      res.status(201).json(participant);
    } else if (req.method === 'DELETE') {
      const { participantId } = req.body;
      
      if (!participantId) {
        return res.status(400).json({ error: 'Participant ID is required' });
      }
      
      await removeParticipant(participantId);
      res.status(200).json({ message: 'Participant removed successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling participants:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
} 