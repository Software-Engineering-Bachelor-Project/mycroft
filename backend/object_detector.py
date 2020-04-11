import cv2
import numpy as np
import os

from typing import List, Tuple


# This file represents the backend Object Detector.

def detect_objects(data: dict) -> (int, dict):
    # TODO: Implement
    return 200, {}


class ObjectDetector:
    """
    Modified the following example:
    https://pysource.com/2019/06/27/yolo-object-detection-using-opencv-with-python/
    """

    def __init__(self, yolov: str = 'yolov3-tiny', debug: bool = False):  # debug
        """
        Loads YOLO.

        :param yolov: YOLO version (weights and cfg must be in utils).
        :param debug: Display all processed frames for user.
        """
        self.net = cv2.dnn.readNet("backend{0}utils{0}{1}.weights".format(os.path.sep, yolov),
                                   "backend{0}utils{0}{1}.cfg".format(os.path.sep, yolov))
        self.classes = []
        with open("backend{0}utils{0}coco.names".format(os.path.sep), "r") as f:
            self.classes = [line.strip() for line in f.readlines()]
        self.layer_names = self.net.getLayerNames()
        self.output_layers = [self.layer_names[i[0] - 1] for i in self.net.getUnconnectedOutLayers()]

        self.debug = debug  # debug
        if debug:
            self.colors = np.random.uniform(0, 255, size=(len(self.classes), 3))  # debug

    def detect(self, clip: str, rate: int = 1, start: int = 0, end: int = None, thresh: float = 0.5) -> \
            List[Tuple[str, int]]:
        """
        Detects objects in a clip.

        :param clip: Absolute path to clip.
        :param rate: Rate for frames to be analyzed in seconds.
        :param start: Which second in clip to start object detection.
        :param end: Which second in clip to end object detection.
        :param thresh: YOLO confidence threshold.
        :return: List of tuples with object class and time in seconds when it was detected.
        """
        res = []

        # Check if clip exists
        if not os.path.isfile(path=clip):
            raise FileNotFoundError

        # Setup video
        video = cv2.VideoCapture(clip)
        frame_rate = int(video.get(cv2.CAP_PROP_FPS))
        frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

        # Convert rate, start and end to frames
        rate = rate * frame_rate
        start = int(start * frame_rate)
        if end is None:
            end = frames
        else:
            end = end * frame_rate

        # Analyze clip frame by frame
        for i in range(end):
            success, frame = video.read()
            assert success  # Something is wrong if this fails.

            # Skip clips according to start and rate.
            if i >= start and i % rate == start % rate:
                # Prepare frame
                frame = cv2.resize(frame, None, fx=0.4, fy=0.4)
                height, width, channels = frame.shape

                # Detect objects
                blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
                self.net.setInput(blob)
                outs = self.net.forward(self.output_layers)

                # Process result of object detection.
                class_ids = []
                confidences = []
                boxes = []
                for out in outs:
                    for detection in out:
                        scores = detection[5:]
                        class_id = np.argmax(scores)
                        confidence = scores[class_id]
                        if confidence > thresh:
                            # Detected object
                            center_x = int(detection[0] * width)
                            center_y = int(detection[1] * height)
                            w = int(detection[2] * width)
                            h = int(detection[3] * height)

                            # Rectangle coordinates
                            x = int(center_x - w / 2)
                            y = int(center_y - h / 2)
                            boxes.append([x, y, w, h])
                            confidences.append(float(confidence))
                            class_ids.append(class_id)

                # Non maximum suppression
                indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

                # Label result
                for j in range(len(boxes)):
                    if j in indexes:
                        # Add detected object to res
                        label = str(self.classes[class_ids[j]])
                        res.append((label, int(i / frame_rate)))

                        if self.debug:
                            x, y, w, h = boxes[j]
                            color = self.colors[j]
                            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                            cv2.putText(frame, label, (x, y + 30), cv2.FONT_HERSHEY_PLAIN, 3, color, 3)

                if self.debug:
                    # Display frame with detection
                    cv2.imshow("Image", frame)
                    cv2.waitKey(0)
                    cv2.destroyAllWindows()

        return res
