export default async function handler(req, res) {
  // Enable Global CORS so your public streaming app can read data
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing required 'id' parameter." });
  }

  try {
    const firebaseEndpoint = `https://midnight-anime-api-default-rtdb.asia-southeast1.firebasedatabase.app/animes/${id}.json`;
    
    const dbResponse = await fetch(firebaseEndpoint);
    const data = await dbResponse.json();

    if (!data) {
      return res.status(404).json({ error: "No video stream linked for this AniList ID." });
    }

    // Return ONLY the clean data to your public streaming webapp
    return res.status(200).json({
      anilistId: data.anilistId,
      streamUrl: data.streamUrl
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal connection error with database clusters." });
  }
}
