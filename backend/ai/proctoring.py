import cv2

def monitor_student():

    cap = cv2.VideoCapture(0)

    face = cv2.CascadeClassifier(
        cv2.data.haarcascades +
        "haarcascade_frontalface_default.xml"
    )

    while True:

        ret, frame = cap.read()

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            print("⚠️ No face detected")

        if len(faces) > 1:
            print("⚠️ Multiple faces detected")

        cv2.imshow("Exam Monitoring", frame)

        if cv2.waitKey(1) == 27:
            break

    cap.release()
    cv2.destroyAllWindows()