import cv2


class VideoWriter:
    def __init__(self, output_path, fps, width, height):
        """
        Initialize video writer with automatic codec fallback.
        Ensures video is correctly encoded across environments.
        """
        # Ensure valid FPS
        if not fps or fps <= 0 or fps > 120:
            fps = 30.0

        codecs = ["mp4v", "avc1", "XVID", "MJPG"]
        self.writer = None
        self.output_path = output_path

        for codec in codecs:
            fourcc = cv2.VideoWriter_fourcc(*codec)
            writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            if writer.isOpened():
                self.writer = writer
                break

        if self.writer is None or not self.writer.isOpened():
            # Ultimate fallback to default fourcc -1 or mp4v
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            self.writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    def write_frame(self, frame):
        """
        Write processed frame to video file
        """
        if self.writer and self.writer.isOpened():
            self.writer.write(frame)

    def release(self):
        """
        Release writer and finalize video file
        """
        if self.writer:
            self.writer.release()