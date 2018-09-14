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
      console.log(X);
      console.log(y);
      var pred = rf.predict(X);
      console.log(pred);
      var TP = 0, TN = 0, FP = 0, FN = 0;
      for(var i in pred) {
        if(pred[i] == 1 && y[i] == 1) {
          TP++;
        } else if(pred[i] == -1 && y[i] == 1) {
          FN++;
        } else if(pred[i] == -1 && y[i] == -1) {
          TN++;
        } else if(pred[i] == 1 && y[i] == -1) {
          FP++;
        }
      }
      console.log(TP);
      console.log(FP);
      console.log(TN);
      console.log(FN);
    });
  });
}