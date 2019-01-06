#coding=utf-8
# -*- coding: UTF-8 -*-
import sys
import mongodb
import bson.binary
import config
import time
import os 
import datetime 
import argparse 
reload(sys)
sys.setdefaultencoding('utf-8') 

def run():
    print ' '
    print '\033[1;33mbegin for each the root : ' + config.root + '\033[0m'
    print ' '
    for filename in os.listdir(config.root): 
	# get fullpath
        pathname = os.path.join(config.root, filename)
	# is dir
        if os.path.isdir(pathname): 
            work(config.root, filename) 

# 处理一个视频目录的图片
def work(root, filename): 
    videos = mongodb.db('').videos
    video = videos.find_one({"name":filename})
    print 'video > name >', '\033[1;32m '+ filename +' \033[0m'
    if video == None:
        print 'video > name >', '\033[1;31m '+ filename +' \033[0m' , 'is 404 !' 
        return

    videoid = str(video['_id'])

    print 'video > id   >', '\033[1;32m '+ videoid +' \033[0m'
  
    path = os.path.join(root, filename) 

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
                faceItem = faceItemBuilder(facepath, facename)
                
                item['faces'].append(faceItem) 
               
        else:
            print 'big image > face  info >', '\033[1;31mframe '+ filename +' \033[0m' , '\033[1;31mface images is 404 !\033[0m' 

        videosourceframes.insert(item)

# 从图像名中整理图像数据
def faceItemBuilder(facepath, facename):
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



if __name__ == '__main__':
    run()
 
