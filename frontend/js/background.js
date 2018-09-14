var results = {};
var legitimatePercents = {};
var isPhish = {};


function fetchLive(callback) {
  $.getJSON("https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/classifier.json", function(data) {
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
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "alert_user"}, function(response) {
          });
        });
      } else {
        isPhish[tabId] = false;
      }
    });
  }

}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  results[sender.tab.id]=request;
  classify(sender.tab.id, request);
  sendResponse({received: "result"});
});