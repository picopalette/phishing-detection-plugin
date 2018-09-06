var background = chrome.extension.getBackgroundPage();
var result = background.result;
var colors = {
    "-1":"#58bc8a",
    "0":"#ffeb3c",
    "1":"#ff8b66"
};
var featureList = document.getElementById("features");

for(var key in result){
    var newFeature = document.createElement("li");
    //console.log(key);
    newFeature.textContent = key;
    //newFeature.className = "rounded";
    newFeature.style.backgroundColor=colors[result[key]];
    featureList.appendChild(newFeature);
}