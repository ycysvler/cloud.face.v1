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

class VideoService:
    def __init__(self,model_dir,gpu_id,frameskip,numnull): 
        pip_app, pip_service = Pipe()
        self.model_dir = model_dir
        self.pip_app = pip_app
        self.pip_service = pip_service

    def work(self): 
        face_analyzer = IFaceAnalyze(self.model_dir,int(0),int(10),int(10))
        classifier = IFaceRecognize(self.model_dir,0)
        while True:            
    	    params = self.pip_service.recv()
            print 'video service > work >', '\033[1;32m request  '+ str(params) +' \033[0m'

            item = mongodb.db('').videos.find_one({'_id': ObjectId(params["id"])}) 
            videopath = str(config.videopath + "/" + item['name'])
            if item == None:
                print 'video service > work >', '\033[1;31m id ['+ str(params["id"]) +'] is missing !\033[0m' 
                self.pip_service.send({"code":404})
                continue

           

            pic_save_dir = str(os.path.dirname(os.path.realpath(__file__)) + "/video/" + str(item["_id"]) + "/")
            print 'video service > work >', '\033[1;32m pic_save_dir : '+ pic_save_dir +' \033[0m'

            if not os.path.exists(pic_save_dir):
                os.makedirs(pic_save_dir)
                print 'video service > work >', '\033[1;32m mkdir : '+ pic_save_dir +' \033[0m'

            face_analyzer.input(videopath,pic_save_dir,6)
            face_analyzer.process()
            
            # git fps
            fpsfile = str(os.path.dirname(os.path.realpath(__file__)) + "/video/" + str(item["_id"]) + "/fps.txt")
    	    file = open(fpsfile, 'rw+')
            self.fps = float(file.readline())
            file.close()
            # 计算关键帧
	    self.adapter(pic_save_dir, item, item['name'], classifier) 

            print 'video service > work >', '\033[1;32m fps : '+ str(self.fps) +' \033[0m'
            mongodb.db('').videos.update({'_id':ObjectId(params["id"])},{'$set':{'status':2, "fps":self.fps}})

    	    self.pip_service.send({"code":200, "cotent":params["id"]}) 

    def start(self):
        print 'face service > ', '\033[1;32m '+ 'started !' +' \033[0m'
        process = Process(target=self.work) 
        process.start()

    def call(self, id):
        self.pip_app.send({"id":id})
        result = self.pip_app.recv()
        print 'face service > call >', '\033[1;32m response '+ str(result) +' \033[0m'
        return result 
 
    def adapter(self, path, video, filename, classifier): 
        videos = mongodb.db('').videos 
        print 'video > name >', '\033[1;32m '+ filename +' \033[0m'
        if video == None:
            print 'video > name >', '\033[1;31m '+ filename +' \033[0m' , 'is 404 !' 
            return

        videoid = str(video['_id'])

        print 'video > id   >', '\033[1;32m '+ videoid +' \033[0m'
   
        bigpath = os.path.join(path, 'bigpicture')
        facepath = os.path.join(path, 'facepicture')
        # adapter group
        faceDict = self.groupFacePicture(facepath)
  
        bigimages = os.listdir(bigpath) 

        for filename in bigimages:
            bigimage = os.path.join(bigpath, filename)
            print 'big image >', '\033[1;32m'+ filename +' --------------------------------------------------------------- \033[0m'
            (shotname,extension) = os.path.splitext(filename)
            frameno = int(shotname)
          
            videosourceframes = mongodb.db('').videosourceframes
  
            item = {}
            item['videoid'] = videoid
            item['time'] = int( frameno / self.fps)
            item['frameno'] = frameno

         
            print 'big image > video info >', item
        
            item['faces'] = []

            with open(bigimage, 'rb') as image:
                item['source'] = bson.binary.Binary(image.read()) 

            if faceDict.has_key(shotname):
                for facename in faceDict.get(shotname):
                    # 从图像名中整理图像数据
                    faceItem = self.faceItemBuilder(facepath, facename, classifier) 
                    item['faces'].append(faceItem)  
            else:
                print 'big image > face  info >', '\033[1;31mframe '+ filename +' \033[0m' , '\033[1;31mface images is 404 !\033[0m' 

            videosourceframes.insert(item)

    def faceItemBuilder(self,facepath, facename, classifier):
        (shotname,extension) = os.path.splitext(facename)
    
        temp = shotname.split('_')

        if len(temp) == 4:
            frameno = temp[0]
            trackid = temp[1]
            location = {}
            size = temp[3]

            locations = temp[2].split('-')
            if len(locations) == 4:
                location['x1'] = int(locations[0])
                location['y1'] = int(locations[1])
                location['x2'] = int(locations[2])
                location['y2'] = int(locations[3])
        
            item = {}
            with open(os.path.join(facepath, facename)) as face:
                item['trackid'] = trackid
                item['size'] = int(size)
                item['location'] = location

                print 'big image > face  info >', item 

                item['source'] = bson.binary.Binary(face.read()) 

                im = cv2.imread(os.path.join(facepath, facename))
                feature = classifier.extractFeature(im).tolist() 
                item['feature'] = feature

            return item
        else:
            return None

    def groupFacePicture(self, path):  
        faceimages = os.listdir(path)

        dict = {};
        for filename in faceimages:
            frame = filename.split("_")[0]
            if dict.has_key(frame) == False:
                dict[frame] = []
            array = dict.get(frame)
            array.append(filename)   
        return dict;


if __name__ == '__main__':
    # run test
    model_dir = "/home/zzy/models"
    service = VideoService(model_dir,int(0),int(10),int(10))
    service.start()
    service.call('5bef7765ef1c3d37998148c8')
    
 
