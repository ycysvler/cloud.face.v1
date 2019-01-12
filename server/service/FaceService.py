#coding=utf-8
# -*- coding: UTF-8 -*-
import os
import sys
import cv2
import time
import json
import config
import urllib
import mongodb
import argparse
import datetime
import bson.binary

# 扩展加载路径
sys.path.append("./dll")
sys.path.append("/root/faceRetrieval")

reload(sys)
sys.setdefaultencoding('utf-8')

from bson.objectid import ObjectId
from IFaceDetect import IFaceZoneDetect
from IFaceRetrieval import FaceRetrieval
from multiprocessing import Process, Pipe
from flask import Flask,request ,Response

model_dir = "/root/faceRetrieval/models"
detector = IFaceZoneDetect(model_dir, 0)
net = FaceRetrieval(model_dir)

# http server
app = Flask(__name__)

pip_app, pip_service = Pipe()

def startService():
    print 'face service > ', '\033[1;32m ' + 'started !' + ' \033[0m'


# 单图像计算特征
@app.route('/singlefeature')
def singleFeature():
    id = request.args.get("face_id")
    return Response(json.dumps({"id":id, "haha":"haha"}),mimetype='application/json')

# 多图像计算特征
@app.route('/batchfeature')
def batchFeature():
    id = request.args.get("group_id")
    return Response(json.dumps({"id":id, "haha":"haha"}),mimetype='application/json')

# 人像库构建索引
@app.route('/buildindex')
def buildIndex():
    id = request.args.get("group_id")
    return Response(json.dumps({"id":id, "haha":"haha"}),mimetype='application/json')

# 人像库搜索人像
@app.route('/query')
def query():
    id = request.values.get("group_id")
    image_path = request.values.get("image_path")
    return Response(json.dumps({"id":id,"image_path":image_path, "haha":"haha"}),mimetype='application/json')

# http server progress, port = 4003
def webService():
    app.run(debug=False, host='0.0.0.0', port=4003)

# main
if __name__ == '__main__':
# 启动计算集成等待努力工作
    webProcess = Process(target=webService)
    webProcess.start()

    servicerocess = Process(target=startService)
    servicerocess.start()