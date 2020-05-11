import sys
import os
import random
import math
from datetime import *

import cv2

def syntax():
    return "Syntax: [rootDir] [latitude] [longitude] [radius] [minStartTime] [maxEndTime]"

if len(sys.argv) != 7:
    print(syntax())
    exit(1)

# Verify and verify arguments
rootDir = None
coords = None
radius = None
startTime = None
endTime = None

# Root Directory
if not os.path.isdir(sys.argv[1]):
    sys.stderr.write(syntax() + "\n")
    sys.stderr.write("Invalid directory: " + sys.argv[1] + "\n")
    exit(1)

rootDir = sys.argv[1]

# Coordinates
try:
    coords = [float(sys.argv[2]), float(sys.argv[3])]
except:
    sys.stderr.write(syntax() + "\n")
    sys.stderr.write("Invalid coordinates: " + sys.argv[2] + " " + sys.argv[3] + "\n")
    exit(1)

# Radius
try:
    radius = float(sys.argv[4])
except:
    sys.stderr.write(syntax() + "\n")
    sys.stderr.write("Invalid radius: " + sys.argv[4] + "\n")
    exit(1)

# Time interval
try:
    startTime = datetime.strptime(sys.argv[5], "%Y-%m-%d %H:%M:%S")
    endTime = datetime.strptime(sys.argv[6], "%Y-%m-%d %H:%M:%S")
except:
    sys.stderr.write(syntax() + "\n")
    sys.stderr.write("Invalid time interval: " + sys.argv[5] + " " + sys.argv[6] + "\n")
    sys.stderr.write("Arguments must match \"YYYY-MM-DD HH:MM:SS\"\n")
    exit(1)

# Run script
VIDEO_FORMATS = ["mkv", "flv", "vob", "ogv", "ogg",
                 "264", "263", "mjpeg", "avc", "m2ts",
                 "mts", "avi", "mov", "qt", "wmv", "mp4",
                 "m4p", "m4v", "mpg", "mp2", "mpeg",
                 "mpe", "mpv", "m2v", "m4v", "3gp", "3g2",
                 "flv", "f4v", "f4p", "f4a", "f4b", "webm"]

def validFormat(path):
    for f in VIDEO_FORMATS:
        if path.endswith("." + f):
            return True
    return False

def getRandomPosition():
    r = random.uniform(0, radius)
    v = random.uniform(0, math.pi * 2)
    lat = math.sin(v) * r / 111395.0
    lng = math.cos(v) * r / 57475.0
    return [coords[0] + lat, coords[1] + lng]

def getRandomStartTime():
    start = int(startTime.timestamp())
    end = int(endTime.timestamp())
    return datetime.fromtimestamp(random.randint(start, end))

def generateMetadata(directory):
    pos = getRandomPosition()
    date = getRandomStartTime()
    for item in os.listdir(directory):
        path = os.path.join(directory, item)
        if os.path.isdir(path):
            # Enter directory
            generateMetadata(path)
        elif validFormat(path):
            # Generate metadata
            camera = os.path.basename(directory)
            mpath = os.path.abspath(path) + ".txt"
            # Write metadata
            f = open(mpath, "w")
            f.write("({:.6f}, {:.6f})\n".format(pos[0], pos[1]))
            f.write("({})\n".format(str(date)))
            f.write("({})\n".format(camera))
            f.close()

            # Obtain clip data
            cap = cv2.VideoCapture(os.path.abspath(path))
            duration = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)

            # Increment date
            date = datetime.fromtimestamp(date.timestamp() + math.ceil(duration))

generateMetadata(rootDir)
