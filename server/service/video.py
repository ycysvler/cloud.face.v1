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
from SFace import FaceService
from multiprocessing import Process, Pipe
sys.path.append("./dll")

reload(sys)
sys.setdefaultencoding('utf-8') 

# http 
from flask import Flask,request ,Response

# process pipe 
pip_video_web, pip_video_service = Pipe()
pip_job_web, pip_job_service = Pipe()
pip_image_web, pip_image_service = Pipe()

model_dir = "/home/zzy/models"

faceService = FaceService(model_dir,int(0),int(10),int(10))
faceService.start()

# 处理一个视频目录的图片
def work(path, video, filename, classifier): 
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
    faceDict = groupFacePicture(facepath)
  
    bigimages = os.listdir(bigpath) 

    for filename in bigimages:
        bigimage = os.path.join(bigpath, filename)
        print 'big image >', '\033[1;32m'+ filename +' --------------------------------------------------------------- \033[0m'
        (shotname,extension) = os.path.splitext(filename)
        frameno = int(shotname)
          
        videosourceframes = mongodb.db('').videosourceframes
  
        item = {}
        item['videoid'] = videoid
        item['time'] = frameno / 24
        item['frameno'] = frameno
         
        print 'big image > video info >', item
        
        item['faces'] = []

        with open(bigimage, 'rb') as image:
            item['source'] = bson.binary.Binary(image.read()) 

        if faceDict.has_key(shotname):
            for facename in faceDict.get(shotname):
                # 从图像名中整理图像数据
                faceItem = faceItemBuilder(facepath, facename, classifier)
                
                item['faces'].append(faceItem) 
               
        else:
            print 'big image > face  info >', '\033[1;31mframe '+ filename +' \033[0m' , '\033[1;31mface images is 404 !\033[0m' 

        videosourceframes.insert(item)

# 从图像名中整理图像数据
def faceItemBuilder(facepath, facename, classifier):
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

# 将图片目录的文件名称按帧号分组
def groupFacePicture(path):  
    faceimages = os.listdir(path)

    dict = {};
    for filename in faceimages:
        frame = filename.split("_")[0]
        if dict.has_key(frame) == False:
            dict[frame] = []
        array = dict.get(frame)
        array.append(filename)   
    return dict;


# service process
def videoService():
    pip = pip_video_service
    modeldir = r'/home/zzy/models' 
    face_analyzer = IFaceAnalyze(modeldir,int(0),int(10),int(10))
    classifier = IFaceRecognize(modeldir,0)
    while True:
    	params = pip.recv()
        print 'videoService params ' , params 
        # save file
        item = mongodb.db('').videos.find_one({'_id': ObjectId(params["id"])}) 
        print item
        videopath = str(config.videopath + "/" + item['name'])
        pic_save_dir = str(os.path.dirname(os.path.realpath(__file__)) + "/video/" + str(item["_id"]) + "/")
        
        if not os.path.exists(pic_save_dir):
            os.makedirs(pic_save_dir)
          
        #"/home/zzy/video/test.mp4"
        face_analyzer.input(videopath,pic_save_dir,6)
        face_analyzer.process()
 
        work(pic_save_dir, item, item['name'], classifier) 
    	print 'videoService params ' , params 
    	pip.send({"code":200, "cotent":"video " + params["id"]})

def jobService():
    pip = pip_job_service
    while True:
    	params = pip.recv()
    	#print 'jobService params ' , params 
        print 'job > id     >', '\033[1;32m '+ params["id"] +' \033[0m'
        item = mongodb.db('').jobs.find_one({'_id':ObjectId(params['id'])})
        print 'job > info   >', '\033[1;32m '+ str(item) +' \033[0m'
    	pip.send({"code":200, "cotent":"job " + params["id"]})

def imageService():
    pip = pip_image_service
    modeldir = r'/home/zzy/models'
    classifier = IFaceRecognize(modeldir,0)
    while True:
    	params = pip.recv()
        # save file
        item = mongodb.db('').catalogimages.find_one({'_id': ObjectId(params["id"])}) 
        imagepath = 'temp/' + item['name'] 
        file = open(imagepath, 'wb')
        file.write(item['source'])
        file.close()
        im = cv2.imread(imagepath)
        feature = classifier.extractFeature(im).tolist() 
        # delete file
        os.remove(imagepath)
        mongodb.db('').catalogimages.update({'_id':ObjectId(params["id"])},{'$set':{'status':2,'feature':feature}}) 
    	pip.send({"code":200, "cotent":"ok"})

# 下面是Http处理部分
app = Flask(__name__)


# new video
@app.route('/video/frame')
def videoFrame():
    pip = pip_video_web;
    id = request.args.get("id");
    print "/video/new", id
    # web process call service process
    pip.send({"id":id});
    result = pip.recv()
    return Response(json.dumps(result),mimetype='application/json')

# new catalog image
@app.route('/catalog/image')
def catalogImage():
    id = request.args.get("id")
    result = faceService.call(id)
    return Response(json.dumps(result),mimetype='application/json')  
'''
    pip = pip_image_web;
    id = request.args.get("id")
    print "/catalog/image", id
    pip.send({"id":id})
    result = pip.recv()
    return Response(json.dumps(result),mimetype='application/json')  
'''
# new query job
@app.route('/job')
def newJob():
    pip = pip_job_web;
    id = request.args.get("id")
    print "/job", id
    pip.send({"id":id})
    result = pip.recv()
    return Response(json.dumps(result),mimetype='application/json')  
  

# http server progress, port = 4003
def webService():
    app.run(debug=False, host='0.0.0.0', port=4003)

def run(): 
    im_1 = r"/home/zzy/pic/facepicture/12_1_187-178-261-252_5476.jpg"
    im_2 = r"/home/zzy/pic/facepicture/24_0_616-137-681-202_4225.jpg"
    im_1 = cv2.imread(im_1)
    im_2 = cv2.imread(im_2)

    feature_1 = classifier.extractFeature(im_1)
    feature_2 = classifier.extractFeature(im_2)
    result = classifier.recognize(feature_1,feature_2)
    print(result)



if __name__ == '__main__':
# 启动计算集成等待努力工作
    #run()
    webProcess = Process(target=webService) 
    webProcess.start()

    videoProcess = Process(target=videoService) 
    videoProcess.start()

    jobProcess = Process(target=jobService) 
    jobProcess.start()
 
    #imageProcess = Process(target=imageService) 
    #imageProcess.start()
    
 
