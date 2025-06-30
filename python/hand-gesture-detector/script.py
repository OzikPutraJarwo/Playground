import cv2
import mediapipe as mp
import numpy as np
import subprocess
import threading
import time
import sys
import select

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

enable_shutdown = True


def detect_hand_gesture(hand_landmarks):
    tips_ids = [4, 8, 12, 16, 20]  # susunan dari jempol ke kelingking

    fingers = []

    if hand_landmarks.landmark[tips_ids[0]].x < hand_landmarks.landmark[tips_ids[0] - 1].x:
        fingers.append(1)
    else:
        fingers.append(0)

    for tip in tips_ids[1:]:
        if hand_landmarks.landmark[tip].y < hand_landmarks.landmark[tip - 2].y:
            fingers.append(1)
        else:
            fingers.append(0)

    if fingers == [0, 0, 1, 0, 0]:
        return "fak u"
    elif fingers == [1, 1, 1, 1, 1]:
        return "ampun bg"
    elif fingers == [1, 0, 0, 0, 0]:
        return "top"
    elif fingers == [0, 1, 0, 0, 0]:
        return "namba wan"
    elif fingers == [0, 0, 0, 0, 0]:
        return "bogem"
    elif fingers == [0, 0, 0, 0, 1]:
        return "janji ngab"
    else:
        return "gatau apaan ini"


def shutdown_with_countdown():

    start_time = time.time()
    canceled = False

    while time.time() - start_time < 3:
        if sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
            input_line = sys.stdin.readline()
            canceled = True
            print("dibatalkan")
            break
        time.sleep(0.1)

    if not canceled:
        subprocess.Popen(["sudo", "/sbin/shutdown", "now"])


cap = cv2.VideoCapture(0)

shutdown_triggered = False

import tty
import termios

fd = sys.stdin.fileno()
old_settings = termios.tcgetattr(fd)
tty.setcbreak(sys.stdin.fileno())

try:
    with mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7) as hands:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                continue

            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            result = hands.process(rgb_frame)

            if result.multi_hand_landmarks:
                for hand_landmarks in result.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(
                        frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                    gesture = detect_hand_gesture(hand_landmarks)

                    cv2.putText(frame, gesture, (10, 50),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                    if gesture == "fak u" and not shutdown_triggered:
                        shutdown_triggered = True

                        if enable_shutdown:
                            print("🖕 Gesture terdeteksi! Persiapan shutdown...")
                            # Jalankan countdown shutdown di thread terpisah
                            threading.Thread(
                                target=shutdown_with_countdown).start()
                        else:
                            print("🖕 fak u detected (shutdown nonaktif)")

                    elif gesture != "fak u":
                        shutdown_triggered = False

            cv2.imshow('cek gestur jari', frame)

            if cv2.waitKey(5) & 0xFF == 27:
                break
finally:
    termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    cap.release()
    cv2.destroyAllWindows()
