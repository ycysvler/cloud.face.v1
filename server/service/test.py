#coding=utf-8
# -*- coding: UTF-8 -*-
import sys
import os
import cv2
sys.path.append("/root/faceRetrieval")
from FaceRetrieval import FaceRetrieval

if __name__ == '__main__':
    model_dir = "./models"
    detector = IFaceZoneDetect(model_dir, 0)
    pic_dir = "/root/pic/"
    picname = pic_dir + "102_0_783-160-856-233_5329.jpg"
    im = cv2.imread(pic_dir + picname)
    boxes, points = detector.detect(im)
    print 'face service > boxes >', '\033[1;32m request  ' + str(len(boxes)) + ' \033[0m'
    print 'face service > points >', '\033[1;32m request  ' + str(len(points)) + ' \033[0m'

    if (len(boxes) == len(points)):
        im_temp = IFaceZoneDetect.get_align_face(detector, im, boxes[0], points[0])
        cv2.write("./001.jpg", im_temp)



