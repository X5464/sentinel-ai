
/**
 * SENTINEL AI - BACKEND SERVER
 * Deploy this file to Render (Web Service) using Node.js
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
// These must be set in Render Environment Variables or a local .env file
const VT_API_KEY = process.env.VT_API_KEY;
const ABUSE_IP_KEY = process.env.ABUSE_IP_KEY;

// Security Check
if (!VT_API_KEY || !ABUSE_IP_KEY) {
  console.error("⚠️  WARNING: API Keys are missing! Functionality will be limited.");
  console.error("👉 Set VT_API_KEY and ABUSE_IP_KEY in your Render Dashboard or local .env file.");
}

// --- ROUTES ---

// 1. Root Check
app.get('/', (req, res) => {
  res.send('Sentinel AI Threat Engine is Running 🟢');
});

// 2. IP Scan (AbuseIPDB)
app.post('/api/scan-ip', async (req, res) => {
  const { ip } = req.body;
  
  if (!ip) return res.status(400).json({ error: 'IP address required' });
  if (!ABUSE_IP_KEY) return res.status(500).json({ error: 'Server misconfigured: Missing AbuseIPDB Key' });

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
  if (!VT_API_KEY) return res.status(500).json({ error: 'Server misconfigured: Missing VirusTotal Key' });

  try {
    // Step 1: Submit URL for scanning
    const formData = new URLSearchParams();
    formData.append('url', url);

    const scanResp = await axios.post('https://www.virustotal.com/api/v3/urls', formData, {
      headers: { 'x-apikey': VT_API_KEY }
    });
    
    const analysisId = scanResp.data.data.id;

    // Step 2: Retrieve Analysis Results
    // VirusTotal ID generation: base64 encoded URL without padding
    const urlId = Buffer.from(url).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    try {
        const reportResp = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
            headers: { 'x-apikey': VT_API_KEY }
        });
        res.json(reportResp.data);
    } catch (reportError) {
        // If not found in cache or queued, notify frontend
        // This is normal for fresh URLs that are still being analyzed
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
