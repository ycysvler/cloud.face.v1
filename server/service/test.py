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

sys.path.append("/root/faceRetrieval")

from bson.objectid import ObjectId
from IFaceDetect import IFaceZoneDetect
from IFaceRetrieval import FaceRetrieval
from multiprocessing import Process, Pipe
from flask import Flask,request ,Response

model_dir = "/root/faceRetrieval/models"
detector = IFaceZoneDetect(model_dir, 0)
net = FaceRetrieval(model_dir)

def test1():
    model_dir = "/root/faceRetrieval/models"
    detector = IFaceZoneDetect(model_dir, 0)
    net = FaceRetrieval(model_dir)

    pic_dir = "/root/pic/"
    picname = "102_0_783-160-856-233_5329.jpg"
    im = cv2.imread(pic_dir + picname)
    boxes, points = detector.detect(im)
    print 'face service > boxes >', '\033[1;32m request  ' + str(len(boxes)) + ' \033[0m'
    print 'face service > points >', '\033[1;32m request  ' + str(len(points)) + ' \033[0m'

    if (len(boxes) == len(points)):
        im_temp = IFaceZoneDetect.get_align_face(detector, im, boxes[0], points[0])
        cv2.imwrite("/root/002.jpg", im_temp)
        res = net.extractFeature(im_temp)
        print res

# 给一个图片，获取特征
# 返回值 code : 0 计算失败 1 计算成功
# 返回值 feature : 特征
def getFeature(picPath):
    code = 0
    feature = None
    im = cv2.imread(picPath)
    boxes, points = detector.detect(im)
    if(len(boxes) == len(points)):
        im_temp = IFaceZoneDetect.get_align_face(detector, im, boxes[0], points[0])
        feature = net.extractFeature(im_temp)
        code = 1
    return code, feature

# 批量计算特征
# status = 0 的计算
def batchFeature():
    faces = mongodb.db('').faces.find({'status': 0})
    for face in faces:
        print 'batch feature > ', '\033[1;32m ' + str(face["_id"]) + ' \033[0m'
        # 图片路径
        imagepath = 'temp/' + str(face['_id']) + '.jpg'
        file = open(imagepath, 'wb')
        file.write(face['source'])
        file.close()
        # 计算特征
        code,feature = getFeature(imagepath)
        # 删除临时图片
        os.remove(imagepath)
        if code > 0:
            mongodb.db('').faces.update({'_id': face["_id"]},{'$set': {'status': 1, 'feature': feature}})

if __name__ == '__main__':
    batchFeature()






