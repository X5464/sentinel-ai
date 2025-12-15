
import { AnalysisResult, RiskLevel, RiskPattern, ScamCategory } from '../types';

// --- THE DATABASE ---
// Extensive database of scam patterns, cognitive vulnerability factors, and known fraud indicators
export const rawScamPatterns = {
  urgencyKeywords: {
    name: "Urgency & Time Pressure",
    words: [
      "urgent","immediately","asap","2 hours","1 hour","right now",
      "act now","quickly","hurry","don't wait","will be blocked",
      "will be suspended","will be deactivated","will be closed",
      "time running out","final notice","last chance","before midnight","deadline",
      "expires in", "expiry", "lapse", "terminate", "limited time", "today only",
      "very urgent", "critical alert"
    ],
    weight: 0.25,
    elderlyVulnerability: 3.5,
    exploitedCognitiveFuntion: "executive function",
    description: "Creates artificial time pressure to bypass critical thinking."
  },
  authorityReferences: {
    name: "Authority Impersonation",
    words: [
      "sbi","hdfc","icici","axis","police","irs","income tax","rbi",
      "aadhaar","sim card","atm","government","officer","bank","telecom",
      "department","authority","official","sebi","trai","cybercrime",
      "cid","ed","ncb","fir","complaint","fbi","dhs","customs","border protection",
      "fedex","dhl","ups","usps","royal mail","amazon support","microsoft support",
      "apple support","meta support","facebook security", "narcotics", "cbi",
      "global risk management"
    ],
    weight: 0.28,
    elderlyVulnerability: 4.2,
    exploitedCognitiveFuntion: "threat detection",
    regionSpecific: [
      "digital arrest scam (fake CID)",
      "fake income tax notice",
      "fake RBI notification",
      "fake customs officer"
    ],
    description: "Impersonates trusted institutions like banks, police, or tech giants."
  },
  kycCompliance: {
    name: "KYC / Account Block",
    words: [
      "kyc update", "kyc pending", "account blocked", "pan update", "aadhar link",
      "submit documents", "compliance", "bank account hold", "service stop",
      "verification required", "re-kyc", "kyc suspended", "update pan", "link aadhar"
    ],
    weight: 0.32,
    elderlyVulnerability: 4.0,
    exploitedCognitiveFuntion: "fear of loss",
    description: "Claims account will be blocked without immediate KYC update."
  },
  simFraud: {
    name: "SIM Swap / Block",
    words: [
      "sim block", "sim swap", "esim upgrade", "sim deactivation", "4g to 5g", 
      "sim kyc", "block sim", "swap sim", "port sim", "esim activation"
    ],
    weight: 0.35,
    elderlyVulnerability: 3.0,
    exploitedCognitiveFuntion: "fear of disconnection",
    description: "Attempts to take over SIM card or scare user about disconnection."
  },
  utilityScams: {
    name: "Utility / Bill Fraud",
    words: [
      "electricity bill", "power cut", "connection disconnect", "bill unpaid",
      "update payment", "electricity officer", "light cut", "gas connection",
      "bill overdue", "tonight 9:30", "tonight 10pm", "disconnection notice"
    ],
    weight: 0.28,
    elderlyVulnerability: 4.5,
    exploitedCognitiveFuntion: "basic needs security",
    description: "Threatens essential service disconnection (Power/Gas)."
  },
  threatLanguage: {
    name: "Threatening Language",
    words: [
      "will block","will suspend","will freeze","will cancel","will deactivate",
      "will close","account suspended","account frozen","arrested","legal action",
      "court case","criminal","fraud detected","suspicious activity","security issue",
      "compromise","seized","jail","imprisonment","warrant","arrest warrant",
      "police custody","legal notice","attorney","lawsuit", "handcuff"
    ],
    weight: 0.28,
    elderlyVulnerability: 3.8,
    exploitedCognitiveFuntion: "judgment & decision-making",
    dangerityMultiplier: 1.45,
    description: "Uses fear of punishment or legal consequences to force compliance."
  },
  requestForSensitiveData: {
    name: "Sensitive Data Request",
    keywords: [
      "share otp", "provide otp", "tell me otp", "otp needed", "send otp",
      "password","cvv","pin","aadhaar","pan","bank account",
      "credit card","verification code","pin number","secret code",
      "access code","mpin","atm pin","debit card number","expiry date",
      "ssn","social security","passport details","login details",
      "seed phrase","private key","recovery phrase", "anydesk code"
    ],
    weight: 0.30, // Slightly reduced to allow context (safe patterns) to override if legitimate
    elderlyVulnerability: 2.1,
    exploitedCognitiveFuntion: "inhibition & impulse control",
    criticality: "HIGHEST - Direct financial access",
    description: "Demands private information that should never be shared."
  },
  emotionalTriggers: {
    name: "Emotional Manipulation",
    words: [
      "family","grandchild","mother","father","accident","hospital",
      "emergency","urgent help","need money","bail","medical bills",
      "dear","love","trust me","believe me","help me","son","daughter",
      "grandson","grandaughter","crisis","surgery","operation",
      "kidnapped","ransom","hurt","injured","please help", "stranded"
    ],
    weight: 0.22,
    elderlyVulnerability: 4.8,
    exploitedCognitiveFuntion: "emotional regulation & impulse control",
    psychologicalMechanism: "empathy exploitation + trust weaponization",
    regionSpecific: [
      "grandparent scam (grandson in jail)",
      "family medical emergency",
      "romance scams"
    ],
    description: "Exploits love, empathy, and concern for family members."
  },
  investmentPromises: {
    name: "Fake Investment Promise",
    words: [
      "returns","profit","invest","exclusive","limited time","100% guaranteed",
      "high return","double your","million","passive income","opportunity",
      "earn fast","quick money","risk-free","guaranteed profit","forex",
      "stock tips","crypto","penny stocks","bitcoin mining","cloud mining",
      "doubler","multiply money","ponzi","pyramid","scheme", "trading signals",
      "upper circuit", "multibagger", "wealth awaits"
    ],
    weight: 0.20,
    elderlyVulnerability: 3.3,
    exploitedCognitiveFuntion: "financial judgment & risk assessment",
    regionSpecific: [
      "WhatsApp investment groups (fake P&L)",
      "Telegram signal groups",
      "20-50% monthly return scams"
    ],
    description: "Promises unrealistic financial returns with zero risk."
  },
  digitalArrestScams: {
    name: "Digital Arrest Fraud",
    words: [
      "digital arrest","cyber arrest","cid","crime branch","fake fir",
      "cbdt","income tax raid","ed action","ncb drugs","aadhar cancelled","esi deactivated",
      "video call statement","skype interrogation", "virtual hearing", "house arrest"
    ],
    weight: 0.42,
    elderlyVulnerability: 5.2,
    exploitedCognitiveFuntion: "threat detection + authority recognition",
    estimatedAnnualVictimInIndia: "50,000+",
    averageLossPerVictim: "₹2-10 lakhs",
    scamCentreOrigin: ["Cambodia","Myanmar","Thailand"],
    description: "Extremely dangerous 'Digital Arrest' scenario detected."
  },
  advanceFeeFraud: {
    name: "Advance Fee / Nigerian Fraud",
    words: [
      "partnership proposal", "we owe you", "fund transfer", "beneficiary", 
      "next of kin", "transaction", "confidence of your capability", 
      "urgent business", "winning notification", "million dollars", 
      "inheritance", "trustee", "foreign partner", "assistance required",
      "urgent mr", "business proposal"
    ],
    weight: 0.35,
    elderlyVulnerability: 3.5,
    exploitedCognitiveFuntion: "greed & trust",
    description: "Classic advance-fee fraud promising huge wealth for assistance."
  },
  softwareSpam: {
    name: "Software / Product Spam",
    words: [
      "software at incredibly low prices", "legal operating systems", 
      "cheap software", "oem software", "office xp", "norton system works", 
      "adobe photoshop", "bulk email", "marketing list", "86 % lower"
    ],
    weight: 0.20,
    description: "Unsolicited offers for pirated or cheap software."
  },
  financialSpam: {
    name: "Financial Services Spam",
    words: [
      "refinancing", "mortgage request", "pre-approved", "low rates", 
      "consolidate debt", "lower your monthly payments", "bad credit", 
      "approved for loan", "interest rates", "debt elimination",
      "refinance", "mortgage"
    ],
    weight: 0.22,
    description: "Predatory lending or financial service spam."
  },
  fakeAppScams: {
    name: "Fake App / Portal",
    words: [
      "download app","install","app link","udyami app","e-aadhar",
      "income tax portal","bank app","pay tds","update your",
      "apk","install file","testflight","sideload", "support app",
      "quicksupport", "teamviewer", "anydesk", "rustdesk"
    ],
    weight: 0.38,
    elderlyVulnerability: 2.8,
    exploitedCognitiveFuntion: "tech literacy & app recognition",
    regionSpecific: ["Fake UTI app","Fake Zerodha app","Fake income tax e-filing app"],
    description: "Lures user to download malicious software or remote access tools."
  },
  taskBasedFraud: {
    name: "Task / Job Fraud",
    words: [
      "task complete","click link earn","survey reward","referral bonus",
      "invite earn","initial investment","deposit amount","part time job",
      "work from home","daily wage","youtube like","instagram follow task",
      "prepaid task","merchant task", "hiring", "hr manager", "recruitment",
      "wfh", "part-time", "daily income", "salary", "fortune 500 company",
      "be your own boss", "extra income", "help wanted", "hiring now"
    ],
    weight: 0.36,
    elderlyVulnerability: 3.1,
    exploitedCognitiveFuntion: "reward processing + trust",
    regionSpecific: ["Task-based Telegram groups from SE Asia"],
    description: "Offers payment for simple tasks but requires upfront deposits."
  },
  fakeLogistics: {
    name: "Fake Delivery / Logistics",
    words: [
      "delivery attempted","package pending","address incomplete","shipping fee",
      "customs duty","warehouse","shipment on hold","track package","courier",
      "delivery failed","redelivery","postage due", "address update", "indrapust"
    ],
    weight: 0.25,
    elderlyVulnerability: 2.5,
    exploitedCognitiveFuntion: "curiosity & routine",
    description: "Claims a package is waiting to be delivered to steal data or fees."
  },
  cryptoScams: {
    name: "Crypto / Web3 Phishing",
    words: [
      "connect wallet","seed phrase","airdrop","whitelist","presale",
      "minting now","free nft","gas fee","validate wallet","synchronize wallet",
      "rectify wallet","staking rewards","claim tokens", "metamask support",
      "trust wallet support", "12 phrases"
    ],
    weight: 0.40,
    elderlyVulnerability: 1.5,
    exploitedCognitiveFuntion: "greed & fomo",
    description: "Targets cryptocurrency users to drain wallets."
  },
  accountSecurity: {
    name: "Account Security Phishing",
    words: [
      "verify your identity","unusual login","password expired","reset password",
      "account locked","secure your account","confirm details","billing issue",
      "payment declined","update payment","subscription expired","renew now",
      "netflix payment", "amazon account"
    ],
    weight: 0.30,
    elderlyVulnerability: 3.0,
    exploitedCognitiveFuntion: "fear & responsibility",
    description: "Generic phishing attempts to steal login credentials."
  },
  lotteryScams: {
    name: "Lottery / Prize Fraud",
    words: [
      "you won", "congratulations", "lottery winner", "kbc", "kaun banega",
      "lucky draw", "prize money", "claim prize", "processing fee",
      "tax clearance", "winner", "you have been selected", "pre-approved",
      "free portable dvd player"
    ],
    weight: 0.25,
    description: "Claims you won a lottery but requires a fee to release funds."
  },
  techSupportScams: {
    name: "Tech Support Fraud",
    words: [
      "anydesk", "teamviewer", "quicksupport", "alpemix", "rustdesk",
      "microsoft support", "windows expired", "virus detected", "call now",
      "toll free", "remote access", "screen share", "refund form", "connect secure server"
    ],
    weight: 0.15,
    elderlyVulnerability: 2.2,
    description: "Tricks user into installing remote access software."
  },
  adultSpam: {
    name: "Adult / Dating Spam",
    words: [
      "hot lil", "horny", "xxx", "porn", "adult dvd", "dating", "lonely", 
      "meet singles", "webcam dating", "enlargement", "penis", "sexual",
      "wild", "nude", "girls waiting", "open minded", "toy"
    ],
    weight: 0.25,
    description: "Adult content spam or blackmail attempts (Sextortion)."
  },
  pharmaSpam: {
    name: "Pharmaceutical Spam",
    words: [
      "viagra", "cialis", "pills", "medications", "pharmacy", "blood pressure", 
      "cholesterol", "inexpensive meds", "prescriptions", "10 years younger",
      "increase your penis size", "look younger"
    ],
    weight: 0.20,
    description: "Unregulated medical products or fake pharmacy scams."
  },
  theaftLanguageIntensity: {
    name: "High Intensity Language",
    words: ["will","must","immediately","now","!!","!!!"],
    weight: 0.15,
    elderlyVulnerability: 2.9,
    psychologicalEffect: "Increases panic & bypasses critical thinking",
    description: "Uses intense language to induce panic."
  },
  secretAssurance: {
    name: "Secrecy & Isolation",
    words: [
      "don't tell","keep secret","confidential","don't share","between us",
      "don't discuss","don't inform","don't contact","secure","private",
      "tell no one","don't call","don't message","physically isolated",
      "go to a room"
    ],
    weight: 0.22,
    elderlyVulnerability: 3.9,
    exploitedCognitiveFuntion: "social judgment & isolation",
    psychologicalEffect: "Isolates victim from trusted advisors",
    dangerityMultiplier: 1.6,
    description: "Attempts to isolate the victim from family advice."
  },
  paymentDemands: {
    name: "Direct Payment Demand",
    keywords: [
      "upi","transfer","send money","pay","gift card","amazon","paytm",
      "phonepay","bitcoin","crypto","western union","money gram",
      "bank transfer","rupees","amount","fee","deposit","wire","swift",
      "binance","usdt","eth", "qr code"
    ],
    weight: 0.18,
    elderlyVulnerability: 2.3,
    exploitedCognitiveFuntion: "judgment",
    description: "Asks for direct money transfer via untraceable means."
  },
  suspiciousUrls: {
    name: "Suspicious Link",
    indicators: [
      "bit.ly","tinyurl","goo.gl","short.link","http://",
      ".tk",".ml",".ga","click here",".ru",".cn","clk.","link.",
      ".xyz",".top",".gq",".cf",".work",".date",".click", "ngrok",
      "serveo", ".apk"
    ],
    weight: 0.20,
    elderlyVulnerability: 1.8,
    exploitedCognitiveFuntion: "tech literacy",
    description: "Contains unsafe or shortened links to hide destination."
  }
};

// --- SAFE CONTEXT PATTERNS (New Feature) ---
// These patterns indicate legitimate transactional messages, reducing the risk score.
export const safeIndicators = [
  {
    name: "Standard OTP Delivery",
    keywords: [/is your otp/i, /is your one time password/i, /code is \d+/i, /otp is \d+/i, /verification code is/i],
    weight: 0.35, // Strong reduction
  },
  {
    name: "Security Warning",
    keywords: [/do not share/i, /don't share/i, /never asks/i, /fraud/i, /scam/i],
    weight: 0.20, // Moderate reduction (Shows safety awareness)
  },
  {
    name: "Validity Information",
    keywords: [/valid for \d+/i, /expires in/i, /valid for/i],
    weight: 0.15, 
  },
  {
    name: "User Initiated Context",
    keywords: [/requested by you/i, /generated by you/i, /request to block/i, /reference number/i],
    weight: 0.25,
  },
  {
    name: "Professional/Academic Context",
    // These words help distinguish real business emails (like Enron dataset) from scams
    keywords: [
      /deal ticket/i, /nomination/i, /conference/i, /workshop/i, /abstract/i, 
      /meeting agenda/i, /resume/i, /interview schedule/i, /attached please find/i, 
      /newsletter/i, /publication/i, /faculty/i, /university/i, 
      /project agreement/i, /volumes/i, /schedule/i, /presentation/i, 
      /deadline for/i, /call for papers/i, /linux/i, /server/i, /patch/i
    ],
    weight: 0.40, // Strong reduction for business contexts
  }
];

// --- DATA MAPPING LOGIC ---

// Transform the raw object into the ScamCategory array structure used by the analyzer
export const categories: ScamCategory[] = Object.entries(rawScamPatterns).map(([key, value]) => {
  const rawData = value as any;
  
  // Normalize keywords
  const wordList: string[] = rawData.words || rawData.keywords || rawData.indicators || [];
  const regexList = wordList.map(word => new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

  // Construct Detailed Explanation with newlines for formatting
  let parts = [];
  
  if (rawData.exploitedCognitiveFuntion) {
    parts.push(`• Exploits: ${rawData.exploitedCognitiveFuntion}`);
  }
  
  if (rawData.elderlyVulnerability) {
    parts.push(`• Elderly Vulnerability Score: ${rawData.elderlyVulnerability}/5.0`);
  }
  
  if (rawData.psychologicalEffect) {
    parts.push(`• Psychological Effect: ${rawData.psychologicalEffect}`);
  }
  
  if (rawData.psychologicalMechanism) {
    parts.push(`• Mechanism: ${rawData.psychologicalMechanism}`);
  }
  
  if (rawData.regionSpecific) {
    parts.push(`• Common Targets: ${rawData.regionSpecific.join(", ")}`);
  }
  
  if (rawData.estimatedAnnualVictimInIndia) {
    parts.push(`• Annual Impact: ${rawData.estimatedAnnualVictimInIndia} victims`);
  }
  
  if (rawData.criticality) {
    parts.push(`• WARNING: ${rawData.criticality}`);
  }

  // Fallback if no details
  if (parts.length === 0) {
    parts.push("• Pattern indicates highly suspicious activity.");
  }

  return {
    name: rawData.name || key,
    weight: (rawData.weight || 0.1) * 100, 
    keywords: regexList,
    description: rawData.description || "Suspicious pattern detected.",
    explanation: parts.join("\n") // Join with newlines
  };
});

export const analyzeMessage = (text: string): AnalysisResult => {
  let rawScore = 0;
  let detectedPatterns: RiskPattern[] = [];
  let detectedCategoriesCount = 0;

  // 1. Analyze by Risk Categories
  categories.forEach(cat => {
    const matches = cat.keywords.some(regex => regex.test(text));
    if (matches) {
      rawScore += cat.weight;
      detectedCategoriesCount++;
      detectedPatterns.push({
        id: cat.name.toLowerCase().replace(/\s/g, '-'),
        name: cat.name,
        description: cat.description,
        detailedDescription: cat.explanation,
        detected: true,
        severity: cat.weight > 25 ? 'high' : 'medium'
      });
    }
  });

  // 2. Analyze Safe Indicators (Contextual Analysis)
  let safeScore = 0;
  let detectedSafeContexts: string[] = [];
  
  safeIndicators.forEach(indicator => {
    const matches = indicator.keywords.some(regex => regex.test(text));
    if (matches) {
      safeScore += (indicator.weight * 100);
      detectedSafeContexts.push(indicator.name);
    }
  });

  // 3. Advanced Multiplier Logic for Combined Threats
  const detectedIds = new Set(detectedPatterns.map(p => p.id));
  let multiplier = 1.0;
  
  // Authority + Urgency (1.25x)
  if (detectedIds.has('authority-impersonation') && detectedIds.has('urgency-&-time-pressure')) {
     multiplier = Math.max(multiplier, 1.25);
  }
  
  // Emotional + Secrecy (1.30x)
  if (detectedIds.has('emotional-manipulation') && detectedIds.has('secrecy-&-isolation')) {
     multiplier = Math.max(multiplier, 1.30);
  }
  
  // Critical Triple: Authority + Threat + Data (1.40x)
  if (detectedIds.has('authority-impersonation') && detectedIds.has('threatening-language') && detectedIds.has('sensitive-data-request')) {
     multiplier = Math.max(multiplier, 1.40);
  }

  // Investment + Urgency + Authority (1.35x)
  if (detectedIds.has('fake-investment-promise') && detectedIds.has('urgency-&-time-pressure') && detectedIds.has('authority-impersonation')) {
     multiplier = Math.max(multiplier, 1.35);
  }
  
  // Family Emergency + Payment (1.28x)
  if (detectedIds.has('emotional-manipulation') && detectedIds.has('direct-payment-demand')) {
      multiplier = Math.max(multiplier, 1.28);
  }

  // SIM Fraud Special Logic
  if (detectedIds.has('sim-swap-/-block') && detectedIds.has('sensitive-data-request')) {
      // Very high risk if it's "sim block otp needed"
      // But if safe indicators exist (e.g. "OTP for SIM block is 1234"), multiplier should be low.
      if (safeScore < 20) {
        multiplier = Math.max(multiplier, 1.50); // Boost risk if no safe context
      } else {
        multiplier = 0.8; // Reduce multiplier if safe context exists
      }
  }

  // Fallback if no specific combo detected but multiple categories exist
  if (multiplier === 1.0) {
      if (detectedCategoriesCount >= 3) multiplier = 1.5;
      else if (detectedCategoriesCount >= 2) multiplier = 1.25;
  }

  rawScore *= multiplier;

  // 4. Apply Safe Context Reduction
  rawScore = Math.max(0, rawScore - safeScore);

  // 5. Cap score at 100
  const finalScore = Math.min(Math.round(rawScore), 100);

  // 6. Determine 5-Tier Risk Level
  let level = RiskLevel.SAFE;
  
  if (finalScore === 0) {
    level = RiskLevel.SAFE;
  } else if (finalScore <= 25) {
    level = RiskLevel.LOW;      
  } else if (finalScore <= 55) {
    level = RiskLevel.MEDIUM;   
  } else if (finalScore <= 75) {
    level = RiskLevel.HIGH;     
  } else {
    level = RiskLevel.CRITICAL; 
  }

  // 7. Generate Recommendations
  const recommendations: string[] = [];
  
  // Context-Aware Recommendations
  if (detectedIds.has('sensitive-data-request') || detectedIds.has('sim-swap-/-block')) {
    if (safeScore > 30) {
       // It looks like a real OTP
       recommendations.push("This appears to be a transactional OTP message.");
       recommendations.push("⚠️ Only use this code if YOU initiated the request.");
       recommendations.push("If you did not request this, someone may be trying to access your account.");
    } else {
       // It looks like a demand
       recommendations.push("Do not share any OTP or code mentioned in this message.");
       recommendations.push("If you did not initiate a request, this is definitely a scam.");
    }
  }

  switch (level) {
    case RiskLevel.CRITICAL:
      recommendations.push("Do not click any links or download attachments.");
      recommendations.push("Block and report the sender immediately.");
      break;
    case RiskLevel.HIGH:
      recommendations.push("This message shows significant signs of a scam.");
      recommendations.push("Verify with a trusted family member before acting.");
      break;
    case RiskLevel.MEDIUM:
      recommendations.push("Exercise caution. Verify the sender's identity.");
      recommendations.push("Check official websites directly, do not use links here.");
      break;
    case RiskLevel.LOW:
      recommendations.push("Be cautious, this might be spam or a marketing message.");
      break;
    case RiskLevel.SAFE:
    default:
      if (recommendations.length === 0) {
        recommendations.push("Message appears safe, but always stay vigilant.");
      }
      break;
  }

  // 8. Generate Summary
  let summary = "This message appears to be safe.";
  if (level !== RiskLevel.SAFE) {
    summary = `Detected ${detectedPatterns.length} risk signals.`;
    
    if (safeScore > 0) {
       summary += ` However, we found ${detectedSafeContexts.length} indicators of a legitimate transactional message. Verify if you initiated this.`;
    } else {
       summary += " No safe context found (like 'is your otp' or 'do not share'). This makes it highly suspicious.";
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
