function test_model() {
  const url = "https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/backend/classifier/classifier.json";
  $.getJSON(url, function(data) {
    console.log(data);
  });
}