
import { AnalysisResult, RiskLevel, RiskPattern, ScamCategory } from '../types';

// --- THE HYPERSCALE DATASET (RBI, Police & Hinglish Aligned) ---

export const rawScamPatterns = {
  // 1. FINANCIAL & BANKING (RBI Guidelines)
  kycCompliance: {
    name: "KYC / Account Block",
    words: [
      "kyc update", "kyc pending", "account blocked", "pan update", "aadhar link",
      "submit documents", "compliance", "bank account hold", "service stop",
      "verification required", "re-kyc", "kyc suspended", "update pan", "link aadhar",
      "unblock", "unlock", "reactivate", "unfreeze", "restore access", "kyc expire",
      "pancard", "pan-card", "aadhar-card", "aaddhar", "adhar", "yono", "sbi kyc", 
      "hdfc kyc", "icici kyc", "axis kyc", "pnb kyc", "bob kyc", "cif number",
      "account band", "block ho gaya", "chalu kare", "band ho jayega", "netbanking block"
    ],
    weight: 0.45,
    description: "Threatens account blockage to steal banking credentials (RBI Alert)."
  },
  digitalArrest: {
    name: "Digital Arrest / Fake Authority",
    words: [
      "digital arrest", "house arrest", "cbi", "crime branch", "narcotics", "ncb",
      "money laundering", "fbi", "police verification", "cyber cell", "fir registered",
      "arrest warrant", "court order", "supreme court", "customs officer", "parcel seized",
      "illegal items", "drugs found", "video call statement", "skype interrogation", 
      "teams meeting", "police station", "inspector", "commissioner", "cyber crime office",
      "police thana", "giraftar", "jail", "legal notice", "trai", "telecom department",
      "disconnection notice", "number disconnected"
    ],
    weight: 0.60, // Extremely High Risk
    description: "Impersonates Police/CBI to extort money via 'Digital Arrest' (High Threat)."
  },
  utilityFraud: {
    name: "Electricity / Bill Disconnection",
    words: [
      "electricity bill", "power cut", "connection disconnect", "bill unpaid",
      "update payment", "electricity officer", "light cut", "gas connection",
      "bill overdue", "tonight 9:30", "tonight 10pm", "tonight 9pm", 
      "disconnection notice", "bses", "tata power", "adani power", "pay immediately",
      "bijli", "batti", "connection kat", "meter update", "mahanagar gas", "igl"
    ],
    weight: 0.40,
    description: "Threatens immediate power cut. Official bodies never SMS this."
  },
  
  // 2. HINGLISH & LOCAL CONTEXT (New Layer)
  hinglishUrgency: {
    name: "Hinglish Threats",
    words: [
      "jaldi karo", "turant", "abhi", "khatam", "band hone wala hai", 
      "offer simit", "aakhri mauka", "paise milenge", "account mein", 
      "lottery laga hai", "lucky draw", "jio offer", "airtel offer", 
      "5g upgrade", "free recharge", "muft", "bina shulk", "sarkari yojana",
      "pm yojana", "mudra loan", "awas yojana", "labh uthaye"
    ],
    weight: 0.35,
    description: "Uses Hindi-English mix to target local demographics."
  },

  // 3. EMOTIONAL & SOCIAL ENGINEERING
  familyEmergency: {
    name: "Family Emergency / Impersonation",
    words: [
      "hospital", "accident", "blood urgent", "in jail", "bail money", "kidnapped",
      "lost phone", "new number", "this is my new number", "save my new number",
      "urgent help", "send money", "stuck at airport", "customs duty", "grandson",
      "son", "daughter", "mom", "dad", "injured", "operation", "icu", 
      "phone kho gaya", "naya number", "paise bhejo", "mushkil mein", "papa", "mummy"
    ],
    weight: 0.45,
    description: "Pretends to be family in trouble using an unknown number."
  },
  romanceSextortion: {
    name: "Sextortion / Honey Trap",
    words: [
      "video call", "nude", "private video", "upload social media", "viral", 
      "delete video", "pay money", "beautiful girl", "lonely", "dating", "meetup",
      "horny", "sex", "cam", "show me", "record", "blackmail", "youtube pe daal",
      "badnaam", "delete karwana", "delhi police cyber"
    ],
    weight: 0.55,
    description: "Blackmail using private videos or dating lures."
  },

  // 4. GREED & REWARDS
  fakeRewards: {
    name: "Fake Rewards / Credit Points",
    words: [
      "reward points", "redeem points", "points expiring", "credit card points",
      "cashback", "refund", "itr refund", "income tax refund", "lottery", 
      "you won", "congratulations", "prize money", "claim now", "iphone 15",
      "free gift", "spin and win", "lucky draw", "kbc", "kaun banega", 
      "crorepati", "whatsapp lottery", "winner", "claim reward", "account credit",
      "refund approved", "click to claim"
    ],
    weight: 0.30,
    description: "Lures with fake freebies to steal credit card details."
  },
  jobScams: {
    name: "Job / Task Fraud",
    words: [
      "part time job", "work from home", "daily income", "youtube like", 
      "instagram follow", "telegram task", "prepaid task", "hr manager", 
      "hiring", "recruitment", "salary", "daily wage", "earn 5000", 
      "investment plan", "multiply money", "trading signals", "crypto investment",
      "ghar baithe", "kamao", "online job", "easy money", "merchant task",
      "whatsapp me", "contact hr"
    ],
    weight: 0.35,
    description: "Offers easy money for 'tasks' but asks for upfront deposits."
  },

  // 5. TECHNICAL INDICATORS
  suspiciousLinks: {
    name: "Suspicious Link / APK",
    words: [
      "bit.ly", "tinyurl", "goo.gl", "ngrok", ".apk", "download app", 
      "install app", "support app", "teamviewer", "anydesk", "quicksupport", 
      "rustdesk", "alpemix", "screen share", "remote access", "shorturl",
      "is.gd", "t.ly", "rb.gy", "apk file", "update app", "customer support app"
    ],
    weight: 0.40,
    description: "Contains unsafe links or asks to install remote control apps."
  },
  otpTheft: {
    name: "OTP Theft / Forwarding",
    words: [
      "share otp", "send otp", "forward this message", "tell me code", 
      "verification code", "verify number", "confirm it's you", 
      "google voice", "whatsapp code", "otp batao", "code bhejo", "scan qr",
      "qr code scan", "receive money"
    ],
    weight: 0.40,
    description: "Attempts to steal your login OTP."
  }
};

// --- SAFE CONTEXT PATTERNS ---
// Specific patterns used by legitimate organizations
export const safeIndicators = [
  {
    name: "Transactional OTP",
    keywords: [
      /is your otp/i, /is your one time password/i, /code is \d+/i, 
      /otp for txn/i, /otp for payment/i, /requested by you/i, /valid for \d+ min/i,
      /verification code is/i, /login otp/i, /authentication code/i
    ],
    weight: 0.60,
  },
  {
    name: "Banking Alert",
    keywords: [
      /acct.*credited/i, /acct.*debited/i, /avl bal/i, /available balance/i, 
      /txn.*successful/i, /payment.*received/i, /sent.*rs\./i, /received.*rs\./i,
      /upi ref/i, /imps ref/i, /neft ref/i, /bill payment/i, /recharge successful/i,
      /stmt for/i, /balance in/i, /clear balance/i, /amount due/i, /payment reminder/i
    ],
    weight: 0.85, // Very high safety weight for purely informational messages
  },
  {
    name: "Security Advisory",
    keywords: [
      /do not share/i, /don't share/i, /never asks/i, /beware of fraud/i, 
      /bank never calls/i, /confidential/i, /never share otp/i, /for security reasons/i
    ],
    weight: 0.40,
  },
  {
    name: "Official Info",
    keywords: [
      /account ending in/i, /credited with/i, /debited for/i, /available bal/i, 
      /ref no/i, /txn id/i, /imps ref/i, /upi ref/i, /ticket no/i
    ],
    weight: 0.30,
  }
];

// --- HARD RULES (The "Expert System") ---
// These override weights based on RBI guidelines and specific threat intelligence.
const checkHardRules = (text: string, matches: Set<string>): { ruleHit: boolean, level?: RiskLevel, summary?: string, action?: string } => {
  const lowerText = text.toLowerCase();
  // Check for presence of URL (http or common domains)
  const hasLink = /(http|https|www\.|bit\.ly|tinyurl|\.com|\.in|\.net|\.org|\.xyz)/.test(lowerText);
  // Check for suspicious short links specifically
  const hasSuspiciousLink = /(bit\.ly|tinyurl|goo\.gl|ngrok|\.apk|shorturl|is\.gd|t\.ly|rb\.gy)/.test(lowerText);
  
  // 1. RBI RULE: "Unblock" + "Send OTP" = Critical Phishing
  if ((matches.has('kycCompliance') || lowerText.includes('unblock') || lowerText.includes('block')) && 
      (lowerText.includes('send') || lowerText.includes('share') || lowerText.includes('forward') || lowerText.includes('otp'))) {
    return {
      ruleHit: true,
      level: RiskLevel.CRITICAL,
      summary: "CRITICAL ACCOUNT TAKEOVER THREAT.",
      action: "Banks NEVER ask you to share/send an OTP via SMS to unblock accounts. This is a scam."
    };
  }

  // 2. POLICE RULE: "Digital Arrest" / "CBI" = Critical
  if (matches.has('digitalArrest')) {
    return {
      ruleHit: true,
      level: RiskLevel.CRITICAL,
      summary: "DIGITAL ARREST SCAM (Cyber Crime Alert).",
      action: "Police/CBI/Narco NEVER interrogate via Video Call. This is a scam from abroad. DISCONNECT IMMEDIATELY."
    };
  }

  // 3. APK RULE: "Download .apk" = Malware
  if (lowerText.includes('.apk') || (lowerText.includes('apk') && lowerText.includes('file'))) {
    return {
      ruleHit: true,
      level: RiskLevel.CRITICAL,
      summary: "MALWARE / BANKING TROJAN DETECTED.",
      action: "The sender is trying to install a virus (APK) to steal your banking passwords. DO NOT DOWNLOAD."
    };
  }

  // 4. REMOTE ACCESS RULE: "Download" + "AnyDesk/TeamViewer" = Critical
  if ((lowerText.includes('download') || lowerText.includes('install')) && 
      (lowerText.includes('anydesk') || lowerText.includes('teamviewer') || lowerText.includes('support') || lowerText.includes('quicksupport'))) {
    return {
      ruleHit: true,
      level: RiskLevel.CRITICAL,
      summary: "SCREEN SHARE SCAM DETECTED.",
      action: "They are trying to view your screen to steal money. DO NOT install anything."
    };
  }

  // 5. ELECTRICITY RULE: Personal Number
  const hasPhoneNumber = /\b[6-9]\d{9}\b/.test(text.replace(/\s/g, ''));
  if (matches.has('utilityFraud') && hasPhoneNumber) {
    return {
      ruleHit: true,
      level: RiskLevel.CRITICAL,
      summary: "ELECTRICITY BILL SCAM DETECTED.",
      action: "Electricity boards DO NOT send SMS from personal 10-digit mobile numbers. This is a fraud."
    };
  }

  // 6. RBI RULE - KYC via Link
  // Guidelines: Banks never ask to update KYC via SMS links.
  // If it's a short link with KYC keywords, it's definitely a scam.
  if ((matches.has('kycCompliance') || lowerText.includes('kyc') || lowerText.includes('pan card')) && hasSuspiciousLink) {
     return {
      ruleHit: true,
      level: RiskLevel.CRITICAL,
      summary: "RBI WARNING: FAKE KYC ALERT WITH SUSPICIOUS LINK.",
      action: "Banks NEVER send short-links (bit.ly etc) for KYC updates. This is a scam."
    };
  }
  // General KYC + Link warning
  if (matches.has('kycCompliance') && hasLink) {
      return {
      ruleHit: true,
      level: RiskLevel.HIGH,
      summary: "SUSPICIOUS KYC LINK DETECTED.",
      action: "Banks generally do not ask you to click SMS links for KYC. Log in to your official bank app directly."
    };
  }

  // 7. NEW: REWARD POINTS PHISHING
  // Guidelines: 'Redeem points' urgency is a classic phishing hook.
  if (matches.has('fakeRewards') && hasLink) {
     return {
      ruleHit: true,
      level: RiskLevel.HIGH,
      summary: "FAKE REWARD POINTS SCAM.",
      action: "Reward points do not expire with an urgent link. This attempts to steal credit card details."
    };
  }

  return { ruleHit: false };
};

// --- DATA MAPPING LOGIC ---

export const categories: ScamCategory[] = Object.entries(rawScamPatterns).map(([key, value]) => {
  const rawData = value as any;
  const wordList: string[] = rawData.words || [];
  
  // Advanced Regex: Handles simple typos and spacing
  const regexList = wordList.map(word => {
    // Escape special chars
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Allow variable whitespace between words
    const spaceFlexible = escaped.replace(/\s+/g, '\\s+');
    return new RegExp(spaceFlexible, 'i');
  });

  return {
    name: rawData.name || key,
    weight: (rawData.weight || 0.1) * 100, 
    keywords: regexList,
    description: rawData.description || "Suspicious pattern detected.",
    explanation: rawData.description
  };
});

export const analyzeMessage = (text: string): AnalysisResult => {
  let rawScore = 0;
  let detectedPatterns: RiskPattern[] = [];
  const detectedCategoryIds = new Set<string>();

  // 1. Pattern Matching
  categories.forEach(cat => {
    const matches: string[] = [];
    cat.keywords.forEach(regex => {
        const match = text.match(regex);
        if (match) {
            matches.push(match[0]);
        }
    });

    if (matches.length > 0) {
      rawScore += cat.weight;
      detectedCategoryIds.add(Object.keys(rawScamPatterns).find(key => rawScamPatterns[key as keyof typeof rawScamPatterns].name === cat.name) || 'unknown');
      
      detectedPatterns.push({
        id: cat.name.toLowerCase().replace(/\s/g, '-'),
        name: cat.name,
        description: cat.description,
        detailedDescription: cat.explanation,
        detected: true,
        severity: cat.weight > 40 ? 'high' : 'medium',
        matches: Array.from(new Set(matches)) // FIX: Use Array.from instead of [...Set] to prevent TS2802
      });
    }
  });

  // 2. Safe Indicators
  let safeScore = 0;
  let detectedSafeContexts: string[] = [];
  safeIndicators.forEach(indicator => {
    const matches = indicator.keywords.some(regex => regex.test(text));
    if (matches) {
      safeScore += (indicator.weight * 100);
      detectedSafeContexts.push(indicator.name);
    }
  });

  // 3. HARD RULE CHECK (Overrides)
  const hardRule = checkHardRules(text, detectedCategoryIds);
  
  let finalScore = 0;
  let level = RiskLevel.SAFE;
  let summary = "";
  let recommendations: string[] = [];

  if (hardRule.ruleHit) {
    // HARD RULE OVERRIDE
    finalScore = 100;
    level = hardRule.level || RiskLevel.CRITICAL;
    summary = hardRule.summary || "High Risk Detected";
    recommendations.push(hardRule.action || "Do not proceed.");
    
    // Add specific standard advice based on Hard Rule
    recommendations.push("Block this sender immediately.");
    recommendations.push("Report this to Cyber Crime Helpline: Dial 1930.");

  } else {
    // STANDARD SCORING
    
    // Multipliers for combinations
    let multiplier = 1.0;
    if (detectedCategoryIds.has('kycCompliance') && detectedCategoryIds.has('suspiciousLinks')) multiplier = 1.5;
    if (detectedCategoryIds.has('familyEmergency') && detectedCategoryIds.has('newNumber')) multiplier = 1.4;
    
    rawScore *= multiplier;
    
    // Deduct safe score logic
    // We allow safe score to reduce risk UNLESS specific critical threats (like Digital Arrest) are found.
    // Enhanced Logic: If "Banking Alert" safe indicator is found (very high weight), it should effectively zero out scores from generic keywords like "Account" or "Bank".
    if (!detectedCategoryIds.has('digitalArrest')) {
       rawScore = Math.max(0, rawScore - safeScore);
    }

    finalScore = Math.min(Math.round(rawScore), 100);

    // Determine Level
    if (finalScore === 0) level = RiskLevel.SAFE;
    else if (finalScore <= 20) level = RiskLevel.LOW;
    else if (finalScore <= 50) level = RiskLevel.MEDIUM;
    else if (finalScore <= 80) level = RiskLevel.HIGH;
    else level = RiskLevel.CRITICAL;

    // Generate Dynamic Summary
    if (level === RiskLevel.SAFE) {
      if (detectedSafeContexts.includes("Banking Alert")) {
          summary = "This message appears to be a legitimate banking alert.";
          recommendations.push("Standard notification. No action required.");
      } else if (detectedSafeContexts.includes("Transactional OTP")) {
          summary = "This appears to be a standard OTP message.";
          recommendations.push("Only use this code if YOU initiated the request.");
      } else {
          summary = "This message appears to be safe.";
          recommendations.push("No immediate threats detected.");
          recommendations.push("Always verify the sender ID (e.g., AD-HDFCBK) for banking texts.");
      }
    } else {
      summary = `Detected ${detectedPatterns.length} risk signals. Threat Level: ${level}`;
      
      // Category Specific Recommendations
      if (detectedCategoryIds.has('kycCompliance')) {
        recommendations.push("Do NOT click any link to update KYC/PAN.");
        recommendations.push("Open your official bank app directly to check status.");
      }
      if (detectedCategoryIds.has('utilityFraud')) {
        recommendations.push("Electricity boards NEVER send disconnection SMS from personal numbers.");
        recommendations.push("Check your bill status on the official website only.");
      }
      if (detectedCategoryIds.has('fakeRewards')) {
        recommendations.push("Points/Rewards never expire with an urgency to 'click link'.");
        recommendations.push("This is a phishing attempt to steal credit card details.");
      }
      if (detectedCategoryIds.has('familyEmergency')) {
        recommendations.push("STOP. Do not panic.");
        recommendations.push("Call your family member on their OLD/KNOWN number immediately.");
        recommendations.push("Ask a personal question only they would know.");
      }
      if (detectedCategoryIds.has('jobScams')) {
        recommendations.push("Real jobs do not ask for money to get money.");
        recommendations.push("Do not pay any 'registration fee' or 'deposit'.");
      }
      if (detectedCategoryIds.has('hinglishUrgency')) {
        recommendations.push("The use of urgent Hindi/English mix is a common tactic to scare you.");
        recommendations.push("Verify the offer on the official app.");
      }
      
      recommendations.push("If you lost money, call 1930 (Cyber Crime Helpline) immediately.");
    }
  }

  return {
    score: finalScore,
    level,
    patterns: detectedPatterns,
    recommendations,
    summary,
    timestamp: Date.now(),
    id: Math.random().toString(36).substr(2, 9)
  };
};
