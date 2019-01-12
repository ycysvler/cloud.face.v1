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

# http server
app = Flask(__name__)

pip_app, pip_service = Pipe()

def singleFeature(params, detector , net):
    face = mongodb.db('').faces.find_one({'_id': ObjectId(params["face_id"])})
    if face != None:
        print 'single feature >', '\033[1;32m response ' + str(params["face_id"]) + ' \033[0m'
        imagepath = writeImage(face["source"], str(face["_id"]) + ".jpg")
        # 计算特征
        code, feature = getFeature(imagepath, detector, net)
        # 删除临时图片
        os.remove(imagepath)
        if code > 0:
            mongodb.db('').faces.update({'_id': face["_id"]}, {'$set': {'status': 1, 'feature': feature}})
            return {"code": 200, "face_id": params["face_id"]}
        else:
            mongodb.db('').faces.update({'_id': face["_id"]}, {'$set': {'status': -2}})
            return {"code": 500, "face_id": params["face_id"]}
    else:
        print 'single feature >', '\033[1;31m id [' + str(params["face_id"]) + '] is missing !\033[0m'
        return {"code": 404, "face_id": params["face_id"]}

def batchFeature(params, detector , net):
    faces = mongodb.db('').faces.find({"group_id": params["group_id"],"status": 0})
    for face in faces:
        print 'batch feature > ', '\033[1;32m ' + str(face["_id"]) + ' \033[0m'
        imagepath = writeImage(face["source"], str(face["_id"]) + ".jpg")
        # 计算特征
        code, feature = getFeature(imagepath, detector , net)
        # 删除临时图片
        os.remove(imagepath)
        if code > 0:
            mongodb.db('').faces.update({'_id': face["_id"]}, {'$set': {'status': 1, 'feature': feature}})
        else:
            mongodb.db('').faces.update({'_id': face["_id"]}, {'$set': {'status': -2}})

    return {"code": 200, "group_id": params["group_id"]}

def buildIndex(params, detector , net):
    faces = mongodb.db('').faces.find({"group_id": params["group_id"], "status": 1})
    index = 0
    features = []
    for face in faces:
        features.append(face["feature"])
        mongodb.db('').faces.update({'_id': face["_id"]}, {'$set': {'group_index':index}})
        index = index + 1
    net.buildRetrievalDatabase(features, "index/" + params["group_id"])

    return {"code": 200, "group_id": params["group_id"]}

def query(params, detector , net):
    return {"code": 200, "group_id": params["group_id"]}

def writeImage(bytes, name):
    # 图片路径
    imagepath = 'temp/' + name
    file = open(imagepath, 'wb')
    file.write(bytes)
    file.close()
    return imagepath

# 给一个图片，获取特征
# 返回值 code : 0 计算失败 1 计算成功
# 返回值 feature : 特征
def getFeature(picPath, detector , net):
    code = 0
    feature = None
    im = cv2.imread(picPath)
    boxes, points = detector.detect(im)
    if(len(boxes) == len(points)):
        im_temp = IFaceZoneDetect.get_align_face(detector, im, boxes[0], points[0])
        feature = net.extractFeature(im_temp)
        code = 1
    return code, feature

# 後臺服務
def startService():
    print 'face service > ', '\033[1;32m ' + 'started !' + ' \033[0m'
    detector = IFaceZoneDetect(model_dir, 0)
    net = FaceRetrieval(model_dir)
    while True:
        params = pip_service.recv()
        print 'face service > work >', '\033[1;32m request  ' + str(params) + ' \033[0m'
        if params["type"] == "singlefeature":
            result = singleFeature(params, detector , net)
        if params["type"] == "batchfeature":
            result = batchFeature(params, detector , net)
        if params["type"] == "buildindex":
            result = buildIndex(params, detector , net)
        if params["type"] == "query":
            result = query(params, detector , net)
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