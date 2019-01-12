#coding=utf-8
# -*- coding: UTF-8 -*-
import os
import sys
import cv2
import time
import config
import mongodb
import bson.binary

sys.path.append("/root/faceRetrieval")

from bson.objectid import ObjectId
from IFaceDetect import IFaceZoneDetect
from IFaceRetrieval import FaceRetrieval

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

def mongo():
    faces = mongodb.db('').faces.find({'status': 0})
    for face in faces:
        print 'face service > work >', '\033[1;31m id [' + str(face["_id"]) + '] is missing !\033[0m'
        imagepath = './temp/' + str(face['_id']) + '.jpg'
        file = open(imagepath, 'wb')
        file.write(face['source'])
        file.close()
        #im = cv2.imread(imagepath)


if __name__ == '__main__':
    mongo()






