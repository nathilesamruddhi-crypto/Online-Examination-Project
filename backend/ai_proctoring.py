import cv2


import cv2

def monitor_student():
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not cap.isOpened():
        print("❌ Camera not opened")
        return

    while True:
        ret, frame = cap.read()

        # ✅ VERY IMPORTANT CHECK
        if not ret or frame is None:
            print("⚠️ Frame not received")
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        cv2.imshow("AI Monitoring", gray)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()