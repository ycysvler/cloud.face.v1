#!/usr/bin/python2
import _FaceAnalyze as va
import cPickle as pickle
import cv2
import os

class IFaceAnalyze:
    def __init__(self,model_dir,gpu_id,frameskip,numnull):
        self.__analyzer = va.FaceAnalyze(model_dir,gpu_id,frameskip,numnull)

    def input(self,filepath,pic_save_dir,save_frame_skip):
        if not pic_save_dir.endswith("/"):
            pic_save_dir += "/"

        if not os.path.exists(pic_save_dir+"bigpicture"):
            os.mkdir(pic_save_dir+"bigpicture")

        if not os.path.exists(pic_save_dir+"facepicture"):
            os.mkdir(pic_save_dir+"facepicture")

	cap = cv2.VideoCapture(filepath)
	fps = cap.get(cv2.CAP_PROP_FPS)

	fp = open(pic_save_dir+"fps.txt","w")
	fp.write("%s\n"%fps)
	fp.close()

        self.__analyzer.input(filepath,pic_save_dir,save_frame_skip)

    def process(self):
        self.__analyzer.process()
                

def run_0():
    model_dir = "/home/zzy/models"
    face_analyzer = IFaceAnalyze(model_dir,int(0),int(10),int(10))

    videopath = "/home/zzy/video/test.mp4"
    pic_save_dir = "/home/zzy/pic/"
    face_analyzer.input(videopath,pic_save_dir,6)
    face_analyzer.process()

if __name__=="__main__":
    run_0()
