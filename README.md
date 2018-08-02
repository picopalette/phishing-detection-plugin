# Phishing Site Detector Plugin
This lite chrome plugin aims to detect phishing websites and warn the user. It is built with a objective of privacy, so that the user browsing data need not collected for classification. The classification is done on the client side with one-time download of classifier model.

**Dataset:** [UCI Repository](https://archive.ics.uci.edu/ml/datasets/phishing+websites)  
**Technique:** Random Forest Classifier

## Requirements
```
Python3.7
sklearn==0.19.2
numpy==1.15.0
arff==2.2.2
```

## Documentation
* [Wiki](https://github.com/picopalette/phishing-detection-plugin/wiki)
* [Preparing the dataset](backend/dataset/README.md)

Links to few phishing sites: [PDF](artifacts/url_list.pdf)

### References
[Intelligent phishing website detection using random forest classifier](https://ieeexplore.ieee.org/abstract/document/8252051/)