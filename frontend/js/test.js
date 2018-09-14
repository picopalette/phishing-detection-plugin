function test_model() {
  $.getJSON("https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/classifier.json", function(clfdata) {
    var rf = random_forest(clfdata);
    $.getJSON("https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/testdata.json", function(testdata) {
      var X = testdata['X_test'];
      var y = testdata['y_test'];
      for(var x in X) {
        for(var i in x) {
          x[i] = parseInt(x[i]);
        }
      }
      var pred = rf.predict(X);
      var TP = 0, TN = 0, FP = 0, FN = 0;
      for(var i in pred) {
        if(pred[i][0] == true && y[i] == "1") {
          TP++;
        } else if(pred[i][0] == false && y[i] == "1") {
          FN++;
        } else if(pred[i][0] == false && y[i] == "-1") {
          TN++;
        } else if(pred[i][0] == true && y[i] == "-1") {
          FP++;
        }
      }
      var acc = (TP+TN)/(TP+TN+FP+FN);
      console.log("True Positive: " + TP);
      console.log("False Positive: " + FP);
      console.log("True Negative: " + TN);
      console.log("False Negative: " + FN);
      console.log("Accuracy: " + acc)
      $('#tp').text(TP);
      $('#fp').text(FP);
      $('#tn').text(TN);
      $('#fn').text(FN);
      $('#accuracy').text(acc);
    });
  });
}

test_model();