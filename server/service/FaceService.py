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

def singleFeature(params):
    return {"code":200, "face_id":params["face_id"]}

def batchFeature(params):
    return {"code": 200, "group_id": params["group_id"]}

def buildIndex(params):
    return {"code": 200, "group_id": params["group_id"]}

def query(params):
    return {"code": 200, "group_id": params["group_id"]}

# 後臺服務
def startService():
    print 'face service > ', '\033[1;32m ' + 'started !' + ' \033[0m'
    while True:
        params = pip_service.recv()
        print 'face service > work >', '\033[1;32m request  ' + str(params) + ' \033[0m'
        if params["type"] == "singlefeature":
            result = singleFeature(params)
        if params["type"] == "batchfeature":
            result = singleFeature(params)
        if params["type"] == "buildindex":
            result = buildIndex(params)
        if params["type"] == "query":
            result = query(params)
        pip_service.send(result)

# 单图像计算特征
@app.route('/singlefeature')
def resetSingleFeature():
    face_id = request.args.get("face_id")
    pip_app.send({"type": "singlefeature", "face_id": face_id})
    result = pip_app.recv()
    return Response(json.dumps(result), mimetype='application/json')

# 多图像计算特征
@app.route('/batchfeature')
def restBatchFeature():
    group_id = request.args.get("group_id")
    pip_app.send({"type": "batchfeature", "group_id": group_id})
    result = pip_app.recv()
    return Response(json.dumps(result), mimetype='application/json')

# 人像库构建索引
@app.route('/buildindex')
def restBuildIndex():
    group_id = request.args.get("group_id")
    pip_app.send({"type": "buildindex", "group_id": group_id})
    result = pip_app.recv()
    return Response(json.dumps(result),mimetype='application/json')

# 人像库搜索人像
@app.route('/query')
def restQuery():
    group_id = request.values.get("group_id")
    image_path = request.values.get("image_path")
    pip_app.send({"type":"query", "group_id": group_id, "image_path":image_path})
    result = pip_app.recv()
    return Response(json.dumps(result),mimetype='application/json')

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