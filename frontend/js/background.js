var results = {};
var legitimatePercents = {};
var isPhish = {};
var blacklistedDomains = new Set();

function fetchLive(callback) {
  fetch('https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/classifier.json', { 
  method: 'GET'
  })
  .then(function(response) { 
    if (!response.ok) { throw response }
    return response.json(); 
  })
  .then(function(data) {
    chrome.storage.local.set({cache: data, cacheTime: Date.now()}, function() {
      callback(data);
    });
  });
}

function fetchCLF(callback) {
  chrome.storage.local.get(['cache', 'cacheTime'], function(items) {
      if (items.cache && items.cacheTime) {
          return callback(items.cache);
      }
      fetchLive(callback);
  });
}

// Load blacklisted domains from the scraped data
function loadBlacklistedDomains(callback) {
  // Try to fetch from GitHub repository or local storage
  fetch('https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/blacklisted_domains.json', {
    method: 'GET'
  })
  .then(function(response) {
    if (!response.ok) { throw response }
    return response.json();
  })
  .then(function(data) {
    // Assuming the JSON structure has malicious_domains array
    if (data.malicious_domains) {
      blacklistedDomains = new Set(data.malicious_domains);
      chrome.storage.local.set({blacklist: data.malicious_domains, blacklistTime: Date.now()});
      if (callback) callback(blacklistedDomains);
    }
  })
  .catch(function(error) {
    // Fallback to local storage
    chrome.storage.local.get(['blacklist', 'blacklistTime'], function(items) {
      if (items.blacklist) {
        blacklistedDomains = new Set(items.blacklist);
        if (callback) callback(blacklistedDomains);
      }
    });
  });
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    return null;
  }
}

// Check if a domain is blacklisted
function isDomainBlacklisted(domain) {
  if (!domain) return false;
  
  // Check exact match
  if (blacklistedDomains.has(domain)) {
    return true;
  }
  
  // Check without www prefix
  const withoutWww = domain.replace(/^www\./, '');
  if (blacklistedDomains.has(withoutWww)) {
    return true;
  }
  
  // Check if any subdomain matches
  const parts = domain.split('.');
  for (let i = 1; i < parts.length; i++) {
    const subdomain = parts.slice(i).join('.');
    if (blacklistedDomains.has(subdomain)) {
      return true;
    }
  }
  
  return false;
}

// Block navigation to blacklisted sites
function blockBlacklistedSite(tabId, url) {
  const warningUrl = chrome.runtime.getURL('warning.html') + '?blocked=' + encodeURIComponent(url);
  chrome.tabs.update(tabId, { url: warningUrl });
}

function classify(tabId, result) {
  var legitimateCount = 0;
  var suspiciousCount = 0;
  var phishingCount = 0;

  for(var key in result) {
    if(result[key] == "1") phishingCount++;
    else if(result[key] == "0") suspiciousCount++;
    else legitimateCount++;
  }
  legitimatePercents[tabId] = legitimateCount / (phishingCount+suspiciousCount+legitimateCount) * 100;

  if(result.length != 0) {
    var X = [];
    X[0] = [];
    for(var key in result) {
        X[0].push(parseInt(result[key]));
    }
    console.log(result);
    console.log(X);
    fetchCLF(function(clf) {
      var rf = random_forest(clf);
      y = rf.predict(X);
      console.log(y[0]);
      if(y[0][0]) {
        isPhish[tabId] = true;
      } else {
        isPhish[tabId] = false;
      }
      chrome.storage.local.set({'results': results, 'legitimatePercents': legitimatePercents, 'isPhish': isPhish});

      if (isPhish[tabId]) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "alert_user"}, function(response) {
          });
        });
      }
    });
  }

}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  results[sender.tab.id]=request;
  classify(sender.tab.id, request);
  sendResponse({received: "result"});
});

// Listen for tab updates to check for blacklisted domains
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Only check when the URL is being loaded
  if (changeInfo.status === 'loading' && changeInfo.url) {
    const domain = extractDomain(changeInfo.url);
    if (domain && isDomainBlacklisted(domain)) {
      console.log('Blocking blacklisted domain:', domain);
      blockBlacklistedSite(tabId, changeInfo.url);
    }
  }
});

// Listen for navigation events (webNavigation API)
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  // Only check main frame navigation (not iframes)
  if (details.frameId === 0) {
    const domain = extractDomain(details.url);
    if (domain && isDomainBlacklisted(domain)) {
      console.log('Blocking blacklisted domain during navigation:', domain);
      blockBlacklistedSite(details.tabId, details.url);
    }
  }
});

// Initialize blacklist when extension starts
loadBlacklistedDomains(function(domains) {
  console.log('Loaded', domains.size, 'blacklisted domains');
});