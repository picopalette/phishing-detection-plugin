## Preprocess Dataset

This a public phishing site dataset taken from [UCI repository](https://archive.ics.uci.edu/ml/datasets/phishing+websites).

Download the dataset and save as `dataset.arff`. The `preprocess.py` loads the arff file and converts it to numpy array. Then dataset metadata is printed and then dataset is splited into training and testing set with **30%** for testing.  
Change working directory to `/backend/dataset` and Run the preprocessor with  
> `python3 preprocess.py`

Training and testing data *.npy files are created in the working directory.