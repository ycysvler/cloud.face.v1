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
from SFace import FaceService
from SVideo import VideoService
from SJob import JobService
from multiprocessing import Process, Pipe
sys.path.append("./dll")

reload(sys)
sys.setdefaultencoding('utf-8') 

# http 
from flask import Flask,request ,Response
 
model_dir = "/home/zzy/models"

faceService = FaceService(model_dir,int(0),int(10),int(10))
faceService.start()

videoService = VideoService(model_dir,int(0),int(10),int(10))
videoService.start()

jobService = JobService(model_dir,int(0),int(10),int(10))
jobService.start()
 
# 下面是Http处理部分
app = Flask(__name__) 

# new video
@app.route('/video')
def videoFrame(): 
    id = request.args.get("id")
    result = videoService.call(id)
    return Response(json.dumps(result),mimetype='application/json')
   
# new catalog image
@app.route('/image')
def catalogImage():
    id = request.args.get("id")
    result = faceService.call(id)
    return Response(json.dumps(result),mimetype='application/json')  

# new query job
@app.route('/job')
def newJob():
    id = request.args.get("id")
    result = jobService.call(id)
    return Response(json.dumps(result),mimetype='application/json')  

# http server progress, port = 4003
def webService():
    app.run(debug=False, host='0.0.0.0', port=4003)
 
if __name__ == '__main__':
# 启动计算集成等待努力工作 
    webProcess = Process(target=webService) 
    webProcess.start()
   
 
