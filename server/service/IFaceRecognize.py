#coding=utf-8
import os
import shutil
import cv2
import numpy as np
import math
import caffe
import pickle
import time
from objTypeClassifier import ObjTypeClassifier


class IFaceRecognize():
    def __init__(self,model_dir,gpu_id):
        model_dir += '/' if not model_dir.endswith('/') else model_dir

        assert(os.path.exists(model_dir+'facerecognize'))
        prototxt = model_dir+"facerecognize/senet50_ft.prototxt"
        weightfile = model_dir+'facerecognize/senet50_ft.caffemodel'

        self.__gpu_id = gpu_id
        self.__classifier = ObjTypeClassifier(prototxt,weightfile,None,gpu_id,[91.4953,103.8827,131.0912])

    def extractFeature(self,im):
        feature  = self.__classifier.extractFeature(im,"classifier")
        im_1 = cv2.flip(im,1)
        feature_1  = self.__classifier.extractFeature(im_1,"classifier")

        result = np.hstack([feature,feature_1])
        return result

    def recognize(self,feature,feature_1):
        sum_0 = np.dot(feature,feature)
        sum_1 = np.dot(feature_1,feature_1)

        result = np.dot(feature,feature_1)/(np.sqrt(sum_0)*np.sqrt(sum_1))

        return result

def run():
    modeldir = r'/home/zzy/models'
    classifier = IFaceRecognize(modeldir,0)
    
    im_1 = r"/home/zzy/pic/facepicture/12_1_187-178-261-252_5476.jpg"
    im_2 = r"/home/zzy/pic/facepicture/24_0_616-137-681-202_4225.jpg"
    im_1 = cv2.imread(im_1)
    im_2 = cv2.imread(im_2)

    feature_1 = classifier.extractFeature(im_1)
    feature_2 = classifier.extractFeature(im_2)
    result = classifier.recognize(feature_1,feature_2)
    print(result)

if __name__ == '__main__':
    run()

