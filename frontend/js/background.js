chrome.runtime.onInstalled.addListener(function() {
  
});

var result = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  result=request;
  sendResponse({received: "result"});
});

chrome.webNavigation.onCompleted.addListener(function(details) {
  
});