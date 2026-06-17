export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, ep } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing required 'id' parameter." });
  }

  try {
    // Pull the entire anime series node from Firebase
    const firebaseEndpoint = `https://midnight-anime-api-default-rtdb.asia-southeast1.firebasedatabase.app/animes/${id}.json`;
    const dbResponse = await fetch(firebaseEndpoint);
    const data = await dbResponse.json();

    if (!data || !data.episodes) {
      return res.status(404).json({ error: "No episodes found for this anime ID." });
    }

    // SCENARIO A: User requested a specific episode (e.g., ?id=21511&ep=1)
    if (ep) {
      const targetStream = data.episodes[ep];
      if (!targetStream) {
        return res.status(404).json({ error: `Episode ${ep} has not been uploaded yet.` });
      }
      return res.status(200).json({
        anilistId: data.anilistId,
        episode: ep,
        streamUrl: targetStream
      });
    }

    // SCENARIO B: User just requested the ID (?id=21511). Return all episodes for building selectors!
    return res.status(200).json({
      anilistId: data.anilistId,
      totalEpisodesAvailable: Object.keys(data.episodes).length,
      episodes: data.episodes
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal connection error with database clusters." });
  }
}
