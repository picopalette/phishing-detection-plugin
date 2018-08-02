
# coding: utf-8

# In[1]:


import arff
import numpy as np
from sklearn.model_selection import train_test_split, KFold


# In[2]:


dataset = arff.load(open('dataset.arff', 'r'))
data = np.array(dataset['data'])


# In[3]:


print('The dataset has {0} datapoints with {1} features'.format(data.shape[0], data.shape[1]-1))
print('Features: {0}'.format([feature[0] for feature in dataset['attributes']]))


# In[6]:


X, y = data[:, :-1], data[:, -1]
y.reshape(y.shape[0])
print('Before spliting')
print('X:{0}, y:{1}'.format(X.shape, y.shape))
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
print('After spliting')
print('X_train:{0}, y_train:{1}, X_test:{2}, y_test:{3}'.format(X_train.shape, y_train.shape, X_test.shape, y_test.shape))


# In[14]:


np.save('X_train.npy', X_train)
np.save('X_test.npy', X_test)
np.save('y_train.npy', y_train)
np.save('y_test.npy', y_test)
print('Saved!')

