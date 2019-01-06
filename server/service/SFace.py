#coding=utf-8
# -*- coding: UTF-8 -*-
import sys
import mongodb
import bson.binary
import config
import time
import os 
import cv2
import datetime 
import argparse 
import json 
import urllib
from bson.objectid import ObjectId
from IFaceRecognize import IFaceRecognize
from IFaceAnalyze import IFaceAnalyze
from multiprocessing import Process, Pipe
sys.path.append("./dll")

reload(sys)
sys.setdefaultencoding('utf-8') 

class FaceService:
    def __init__(self,model_dir,gpu_id,frameskip,numnull): 
        pip_app, pip_service = Pipe()
        self.model_dir = model_dir
        self.pip_app = pip_app
        self.pip_service = pip_service

    def work(self):
        classifier = IFaceRecognize(self.model_dir,0)
        while True:            
    	    params = self.pip_service.recv()
            print 'face service > work >', '\033[1;32m request  '+ str(params) +' \033[0m'

            # save file
            item = mongodb.db('').catalogimages.find_one({'_id': ObjectId(params["id"])}) 
            if item == None:
                print 'face service > work >', '\033[1;31m id ['+ str(params["id"]) +'] is missing !\033[0m' 
                self.pip_service.send({"code":404})
                continue

            imagepath = 'temp/' + item['name'] 
            file = open(imagepath, 'wb')
            file.write(item['source'])
            file.close()
            im = cv2.imread(imagepath)
            feature = classifier.extractFeature(im).tolist() 
            # delete file
            os.remove(imagepath)
            mongodb.db('').catalogimages.update({'_id':ObjectId(params["id"])},{'$set':{'status':2,'feature':feature}}) 

            self.pip_service.send({"code":200})

    def start(self):
        print 'face service > ', '\033[1;32m '+ 'started !' +' \033[0m'
        process = Process(target=self.work) 
        process.start()

    def call(self, id):
        self.pip_app.send({"id":id})
        result = self.pip_app.recv()
        print 'face service > call >', '\033[1;32m response '+ str(result) +' \033[0m'
        return result 
 
if __name__ == '__main__':
    # run test
    model_dir = "/home/zzy/models"
    service = FaceService(model_dir,int(0),int(10),int(10))
    service.start()
    service.call('5be856306c0fe928389f2ac8')
    
 
