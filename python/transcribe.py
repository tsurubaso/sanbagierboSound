import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import os
from faster_whisper import WhisperModel


def speech_to_text_local(input_path: str, output_path: str):

    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"File not found: {input_path}")

    print("Loading Whisper model...")

    model = WhisperModel(
        "small",
        device="cpu",
        compute_type="int8"
    )

    print("Starting transcription...")

    segments, info = model.transcribe(
        input_path,
        beam_size=5,
        language="fr"
    )

    with open(output_path, "w", encoding="utf-8") as f:
        for segment in segments:
            print(segment.text)
            f.write(segment.text.strip() + " ")

    print("Done.")

if __name__ == "__main__":

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    speech_to_text_local(input_file, output_file)