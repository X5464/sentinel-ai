
/**
 * SENTINEL AI - BACKEND SERVER
 * Deploy this file to Render (Web Service) using Node.js
 * 
 * Dependencies to install (package.json):
 * {
 *   "dependencies": {
 *     "express": "^4.18.2",
 *     "cors": "^2.8.5",
 *     "axios": "^1.6.2",
 *     "dotenv": "^16.3.1"
 *   }
 * }
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for your frontend
app.use(cors());
app.use(express.json());

// --- API KEYS ---
// Ideally set these in Render Environment Variables
// const VT_API_KEY = process.env.VT_API_KEY;
// const ABUSE_IP_KEY = process.env.ABUSE_IP_KEY;

// For immediate testing (Replace with process.env before public release if possible)
const VT_API_KEY = process.env.VT_API_KEY || "3f839e2662f6cbd73c75f5353dca2353e38e45959543749f96576895f7172b20";
const ABUSE_IP_KEY = process.env.ABUSE_IP_KEY || "cc1234731c53e2f3ee7198133b9dc8385cccff5db45a5bfb1f1bb07e838787d87daccf09372dac10";

// --- ROUTES ---

// 1. Root Check
app.get('/', (req, res) => {
  res.send('Sentinel AI Threat Engine is Running 🟢');
});

// 2. IP Scan (AbuseIPDB)
app.post('/api/scan-ip', async (req, res) => {
  const { ip } = req.body;
  
  if (!ip) return res.status(400).json({ error: 'IP address required' });

  try {
    const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: {
        ipAddress: ip,
        maxAgeInDays: '90',
        verbose: ''
      },
      headers: {
        'Key': ABUSE_IP_KEY,
        'Accept': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("AbuseIPDB Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to scan IP', details: error.message });
  }
});

// 3. URL/Domain Scan (VirusTotal)
app.post('/api/scan-url', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    // Step 1: Submit URL for scanning
    const formData = new URLSearchParams();
    formData.append('url', url);

    const scanResp = await axios.post('https://www.virustotal.com/api/v3/urls', formData, {
      headers: { 'x-apikey': VT_API_KEY }
    });
    
    const analysisId = scanResp.data.data.id;

    // Step 2: Retrieve Analysis Results
    // Note: In a real prod app, you might use a webhook or polling. 
    // For simplicity, we just return the analysis ID link or try to fetch immediate report if cached.
    // VirusTotal V3 usually requires the base64 URL identifier for report lookup.
    
    const urlId = Buffer.from(url).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    try {
        const reportResp = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
            headers: { 'x-apikey': VT_API_KEY }
        });
        res.json(reportResp.data);
    } catch (reportError) {
        // If not found in cache, send the queued message
        res.json({ 
            queued: true, 
            message: "Scan queued. Full report available via Analysis ID.",
            analysisId: analysisId,
            scanId: scanResp.data.data.id
        });
    }

  } catch (error) {
    console.error("VirusTotal Error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to scan URL', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
