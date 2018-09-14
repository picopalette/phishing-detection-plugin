
# coding: utf-8

# In[1]:


from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score
import numpy as np
import json
import dump


# In[2]:


X_train = np.load('../dataset/X_train.npy')
y_train = np.load('../dataset/y_train.npy')
print('X_train:{0}, y_train:{1}'.format(X_train.shape, y_train.shape))


# In[3]:


clf = RandomForestClassifier()
print('Cross Validation Score: {0}'.format(np.mean(cross_val_score(clf, X_train, y_train, cv=10))))


# In[4]:


clf.fit(X_train, y_train)


# In[5]:


X_test = np.load('../dataset/X_test.npy')
y_test = np.load('../dataset/y_test.npy')


# In[6]:


pred = clf.predict(X_test)
print('Accuracy: {}'.format(accuracy_score(y_test, pred)))


# In[7]:


#print(forest_to_json(clf))
json.dump(dump.forest_to_json(clf), open('../../static/classifier.json', 'w'))

