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
import numpy as np
import urllib
from bson.objectid import ObjectId
from IFaceRecognize import IFaceRecognize
from IFaceAnalyze import IFaceAnalyze
from multiprocessing import Process, Pipe
sys.path.append("./dll")

reload(sys)
sys.setdefaultencoding('utf-8') 

class JobService:
    def __init__(self,model_dir,gpu_id,frameskip,numnull): 
        pip_app, pip_service = Pipe()
        self.model_dir = model_dir
        self.pip_app = pip_app
        self.pip_service = pip_service

    def work(self):
        classifier = IFaceRecognize(self.model_dir,0)
        while True:            
    	    params = self.pip_service.recv()
            jobid = params["id"]
            print 'job service > work >', '\033[1;32m request  '+ str(params) +' \033[0m'

            # save file
            job = mongodb.db('').jobs.find_one({'_id': ObjectId(jobid)}) 
            
            if job == None:
                print 'job service > work >', '\033[1;31m id ['+ str(jobid) +'] is missing !\033[0m' 
                self.pip_service.send({"code":404})
                continue 

            video = mongodb.db('').videos.find_one({'_id': ObjectId(job['videoid'])})

            # find images 
            cids = []
            for cid in job['cids']:
                cids.append(ObjectId(cid)) 

            images = []
            for image in mongodb.db("").catalogimages.find({'_id':{"$in":cids}}):
                images.append(image)
 
            sframes = mongodb.db("").videosourceframes.find({'videoid':job['videoid']})
             
            for frame in sframes:
                print 'frame', frame['_id'], frame['frameno']
                res = []
                for face in frame['faces']: 
                   for image in images:
                       result = classifier.recognize(face['feature'], image['feature'])
                       print 'job service > work >', '\033[1;32m feature like ['+ str(result) +']  !\033[0m'
                       res.append({"frameid":frame["_id"], "score":result, "trackid":face["trackid"], "cid":image["_id"]})

                keyframe = {'jobid':jobid, 'frameno':frame['frameno']}
                keyframe['time'] = int(frame['frameno']/video['fps'])
                keyframe['res'] = res

                mongodb.db('').videokeyframes.insert(keyframe) 
 
            mongodb.db('').jobs.update({'_id':ObjectId(job["_id"])},{'$set':{'status':2}}) 

            self.pip_service.send({"code":200})

    def start(self):
        print 'job service > ', '\033[1;32m '+ 'started !' +' \033[0m'
        process = Process(target=self.work) 
        process.start()

    def call(self, id):
        self.pip_app.send({"id":id})
        result = self.pip_app.recv()
        print 'job service > call >', '\033[1;32m response '+ str(result) +' \033[0m'
        return result 
 
if __name__ == '__main__':
    # run test
    model_dir = "/home/zzy/models"
    service = JobService(model_dir,int(0),int(10),int(10))
    service.start()
    service.call('5befe72de399391138d011a8')
    
 
