from pynput.mouse import Controller, Button
from pynput import keyboard
import threading
import time

mouse = Controller()
clicking = False
click_thread = None

def click_loop():
    global clicking
    while clicking:
        mouse.click(Button.left)
        time.sleep(0.05)

def toggle_clicking():
    global clicking, click_thread
    clicking = not clicking
    print("Autoclicker:", "ON" if clicking else "OFF")

    if clicking:
        click_thread = threading.Thread(target=click_loop, daemon=True)
        click_thread.start()
    else:
        # Pastikan thread berhenti dengan benar
        time.sleep(0.15)
        click_thread = None

def on_press(key):
    try:
        if key == keyboard.Key.f12:
            toggle_clicking()
    except Exception as e:
        print("Error:", e)

def on_release(key):
    if key == keyboard.Key.esc:
        print("Keluar...")
        return False  # Stop listener

print("Tekan F12 untuk toggle autoclicker. Tekan ESC untuk keluar.")
with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()
