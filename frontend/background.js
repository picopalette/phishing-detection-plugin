chrome.runtime.onInstalled.addListener(function() {
  
});

chrome.webNavigation.onCompleted.addListener(function(details) {
  chrome.tabs.executeScript(details.tabId, {
      code: ' if (document.body.innerText.indexOf("Cat") !=-1) {' +
            '     alert("Cat not found!");' +
            ' }'
  });
});