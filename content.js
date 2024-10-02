// Enhanced Cognitive Honeypot Detection Heuristics
const HEURISTICS = {
  URGENCY_WORDS: ['limited time', 'act now', 'don\'t miss out', 'hurry', 'last chance', 'ending soon', 'only today', 'flash sale'],
  REWARD_WORDS: ['free', 'bonus', 'instant', 'guaranteed', 'exclusive', 'special offer', 'discount', 'save big'],
  SUSPICIOUS_PHRASES: ['no risk', 'secret method', 'loophole', 'hack', 'trick', 'insider info', 'hidden technique', 'unknown to most'],
  EMOTION_TRIGGERS: ['fear', 'greed', 'excitement', 'curiosity', 'fomo', 'regret', 'shame', 'envy'],
  DECEPTION_INDICATORS: ['only for you', 'selected users', 'secret society', 'hidden knowledge', 'confidential offer', 'not available to public'],
  PRESSURE_TACTICS: ['limited slots', 'closing soon', 'one-time offer', 'never again', 'act before it\'s too late', 'don\'t miss this chance'],
  TRUST_SIGNALS: ['verified', 'certified', 'endorsed by', 'as seen on', 'trusted by', 'official partner'],
};

const HEURISTIC_WEIGHTS = {
  urgencyScore: 2.5,
  rewardScore: 2,
  suspiciousPhraseScore: 3,
  emotionTriggerScore: 2.5,
  deceptionScore: 3.5,
  pressureTacticsScore: 3,
  trustSignalsScore: 2,
  domComplexityScore: 1.5,
  hiddenContentScore: 3.5,
  timerPresenceScore: 3,
  excessiveFormFieldsScore: 2,
  layoutManipulationScore: 2.5,
  darkPatternScore: 3.5,
  securityIndicatorScore: 2.5,
  clickbaitScore: 2,
  privacyInvasionScore: 3
};

let lastResult = null;
let currentSensitivity = 65; // Default sensitivity

function calculateTextScores(text) {
  const lowerText = text.toLowerCase();
  return {
    urgencyScore: HEURISTICS.URGENCY_WORDS.filter(word => lowerText.includes(word)).length,
    rewardScore: HEURISTICS.REWARD_WORDS.filter(word => lowerText.includes(word)).length,
    suspiciousPhraseScore: HEURISTICS.SUSPICIOUS_PHRASES.filter(phrase => lowerText.includes(phrase)).length,
    emotionTriggerScore: HEURISTICS.EMOTION_TRIGGERS.filter(trigger => lowerText.includes(trigger)).length,
    deceptionScore: HEURISTICS.DECEPTION_INDICATORS.filter(indicator => lowerText.includes(indicator)).length,
    pressureTacticsScore: HEURISTICS.PRESSURE_TACTICS.filter(tactic => lowerText.includes(tactic)).length,
    trustSignalsScore: HEURISTICS.TRUST_SIGNALS.filter(signal => lowerText.includes(signal)).length
  };
}

function analyzeDOMComplexity() {
  const depthThreshold = 15;
  const nodeCountThreshold = 2000;
  
  let maxDepth = 0;
  let nodeCount = 0;
  let suspiciousStructures = 0;

  function traverseDOM(node, depth) {
    if (depth > maxDepth) maxDepth = depth;
    nodeCount++;
    if (depth > 7 && node.childNodes.length > 15) {
      suspiciousStructures++;
    }
    for (let child of node.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        traverseDOM(child, depth + 1);
      }
    }
  }

  traverseDOM(document.body, 0);

  const depthScore = maxDepth > depthThreshold ? 1 : 0;
  const nodeScore = nodeCount > nodeCountThreshold ? 1 : 0;
  const structureScore = suspiciousStructures > 7 ? 1 : 0;

  return depthScore + nodeScore + structureScore;
}

function detectHiddenContent() {
  const elements = document.querySelectorAll('*');
  let hiddenCount = 0;
  let suspiciousVisibilityChanges = 0;
  let hiddenTextContent = 0;

  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
      hiddenCount++;
      if (el.textContent.trim().length > 0) {
        hiddenTextContent++;
      }
    }
    if (style.display === 'none') {
      const hoverStyle = window.getComputedStyle(el, ':hover');
      if (hoverStyle.display !== 'none') {
        suspiciousVisibilityChanges++;
      }
    }
  });

  return (hiddenCount > 20 ? 1 : 0) + (suspiciousVisibilityChanges > 7 ? 1 : 0) + (hiddenTextContent > 5 ? 1 : 0);
}

function detectTimePressureElements() {
  const timerRegex = /(\d+\s*:\s*){2,3}\d+/;
  const timerPresence = document.body.innerText.match(timerRegex) ? 1 : 0;
  
  const scarcityRegex = /only\s+\d+\s+left|last\s+\d+\s+available|selling fast|almost gone/i;
  const scarcityPresence = document.body.innerText.match(scarcityRegex) ? 1 : 0;
  
  const countdownElements = document.querySelectorAll('[data-countdown], [class*="countdown"], [id*="countdown"]');
  const countdownPresence = countdownElements.length > 0 ? 1 : 0;

  return timerPresence + scarcityPresence + countdownPresence;
}

function analyzeFormComplexity() {
  const forms = document.querySelectorAll('form');
  let excessiveFormCount = 0;
  let suspiciousInputCount = 0;
  let personalInfoFields = 0;

  forms.forEach(form => {
    const fieldCount = form.querySelectorAll('input, select, textarea').length;
    if (fieldCount > 15) {
      excessiveFormCount++;
    }
    const suspiciousInputs = form.querySelectorAll('input[type="hidden"], input[name*="token"], input[name*="tracking"]');
    suspiciousInputCount += suspiciousInputs.length;
    const personalInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]');
    personalInfoFields += personalInputs.length;
  });

  return (excessiveFormCount > 0 ? 1 : 0) + (suspiciousInputCount > 5 ? 1 : 0) + (personalInfoFields > 7 ? 1 : 0);
}

function detectLayoutManipulation() {
  let score = 0;
  
  const stickyElements = document.querySelectorAll('*');
  stickyElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'sticky' || style.position === 'fixed') {
      score++;
    }
  });
  
  const bodyStyle = window.getComputedStyle(document.body);
  if (bodyStyle.overflow === 'hidden' || bodyStyle.position === 'fixed') {
    score++;
  }

  const popups = document.querySelectorAll('[class*="popup"], [class*="modal"], [id*="popup"], [id*="modal"]');
  if (popups.length > 0) {
    score++;
  }
  
  return Math.min(score, 3);
}

function detectDarkPatterns() {
  let score = 0;
  
  const urgencyRegex = /only\s+\d+\s+viewing now|high demand|popular choice/i;
  if (document.body.innerText.match(urgencyRegex)) score++;
  
  const subscriptionForms = document.querySelectorAll('form:not([action*="unsubscribe"])');
  subscriptionForms.forEach(form => {
    if (form.innerHTML.toLowerCase().includes('credit card') || form.innerHTML.toLowerCase().includes('payment')) {
      score++;
    }
  });
  
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const label = checkbox.closest('label') || document.querySelector(`label[for="${checkbox.id}"]`);
    if (label && (label.innerText.length > 100 || label.innerText.toLowerCase().includes('opt out') || label.innerText.toLowerCase().includes('unsubscribe'))) {
      score++;
    }
  });

  const confirmShaming = /no thanks|i don't want|not interested/i;
  if (document.body.innerText.match(confirmShaming)) score++;
  
  return Math.min(score, 4);
}

function analyzeSecurityIndicators() {
  let score = 0;
  
  if (window.location.protocol !== 'https:') score++;
  
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    if (!script.src.startsWith(window.location.origin) && !script.src.startsWith('https://')) {
      score++;
    }
  });
  
  const iframes = document.querySelectorAll('iframe');
  if (iframes.length > 3) score++;

  const externalLinks = document.querySelectorAll('a[href^="http"]:not([href^="' + window.location.origin + '"])');
  if (externalLinks.length > 20) score++;
  
  return Math.min(score, 4);
}

function detectClickbait() {
  const clickbaitPhrases = [
    'you won\'t believe',
    'shocking',
    'mind-blowing',
    'unbelievable',
    'incredible',
    'amazing',
    'jaw-dropping',
    'secret',
    'trick',
    'hack'
  ];

  let score = 0;
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    const headingText = heading.innerText.toLowerCase();
    if (clickbaitPhrases.some(phrase => headingText.includes(phrase))) {
      score++;
    }
  });

  return Math.min(score, 3);
}

function analyzePrivacyInvasion() {
  let score = 0;

  // Check for excessive cookie usage
  const cookieConsent = document.body.innerText.toLowerCase().includes('cookie') && document.body.innerText.toLowerCase().includes('consent');
  if (cookieConsent) score++;

  // Check for requests for unnecessary personal information
  const personalInfoFields = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]');
  if (personalInfoFields.length > 5) score++;

  // Check for social media integration
  const socialMediaButtons = document.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]');
  if (socialMediaButtons.length > 3) score++;

  // Check for location requests
  if (document.body.innerText.toLowerCase().includes('location') && document.body.innerText.toLowerCase().includes('allow')) score++;

  return Math.min(score, 4);
}

function detectCognitiveHoneypot() {
  const pageText = document.body.innerText;
  const textScores = calculateTextScores(pageText);

  const scores = {
    ...textScores,
    domComplexityScore: analyzeDOMComplexity(),
    hiddenContentScore: detectHiddenContent(),
    timerPresenceScore: detectTimePressureElements(),
    excessiveFormFieldsScore: analyzeFormComplexity(),
    layoutManipulationScore: detectLayoutManipulation(),
    darkPatternScore: detectDarkPatterns(),
    securityIndicatorScore: analyzeSecurityIndicators(),
    clickbaitScore: detectClickbait(),
    privacyInvasionScore: analyzePrivacyInvasion()
  };

  const totalScore = Object.entries(scores).reduce((sum, [key, value]) => {
    return sum + (value * (HEURISTIC_WEIGHTS[key] || 1));
  }, 0);

  const maxPossibleScore = Object.values(HEURISTIC_WEIGHTS).reduce((a, b) => a + b, 0) * 4;
  const normalizedScore = (totalScore / maxPossibleScore) * 100;

  return {
    isHoneypot: normalizedScore > currentSensitivity,
    score: normalizedScore.toFixed(2),
    details: scores
  };
}

function detectCognitiveHoneypot() {
  const pageText = document.body.innerText;
  const textScores = calculateTextScores(pageText);

  const scores = {
    ...textScores,
    domComplexityScore: analyzeDOMComplexity(),
    hiddenContentScore: detectHiddenContent(),
    timerPresenceScore: detectTimePressureElements(),
    excessiveFormFieldsScore: analyzeFormComplexity(),
    layoutManipulationScore: detectLayoutManipulation(),
    darkPatternScore: detectDarkPatterns(),
    securityIndicatorScore: analyzeSecurityIndicators(),
    clickbaitScore: detectClickbait(),
    privacyInvasionScore: analyzePrivacyInvasion()
  };

  const totalScore = Object.entries(scores).reduce((sum, [key, value]) => {
    return sum + (value * (HEURISTIC_WEIGHTS[key] || 1));
  }, 0);

  const maxPossibleScore = Object.values(HEURISTIC_WEIGHTS).reduce((a, b) => a + b, 0) * 4;
  const normalizedScore = (totalScore / maxPossibleScore) * 100;

  return {
    isHoneypot: normalizedScore > currentSensitivity,
    score: normalizedScore.toFixed(2),
    details: scores
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

function updateBadgeAndNotify(result) {
    if (result.isHoneypot) {
        chrome.runtime.sendMessage({
            action: "updateBadge",
            data: { text: result.score.toString(), color: "#FF0000" }
        });
    } else {
        chrome.runtime.sendMessage({
            action: "updateBadge",
            data: { text: "", color: "#00FF00" }
        });
    }
}

function performDetection() {
    const result = detectCognitiveHoneypot();
    lastResult = result;
    updateBadgeAndNotify(result);
    return result;
}

// Perform initial detection
lastResult = performDetection();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getResults") {
        sendResponse(performDetection());
    }
    return true;  // Indicates that the response is sent asynchronously
});

// Listen for sensitivity changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.sensitivity) {
        currentSensitivity = Number(changes.sensitivity.newValue);
        performDetection();
    }
});

// Throttled check on user interaction
const throttledCheck = throttle(performDetection, 5000);
document.addEventListener('click', throttledCheck);
document.addEventListener('scroll', throttledCheck);

// Load initial sensitivity setting
chrome.storage.sync.get('sensitivity', function(data) {
    if (data.sensitivity) {
        currentSensitivity = Number(data.sensitivity);
        performDetection();
    }
});

// Throttle function definition
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}
