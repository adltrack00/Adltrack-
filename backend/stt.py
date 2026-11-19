"""Voice notes typed out, so ADA can act on them like any other message.

Any OpenAI-compatible transcription endpoint works (OpenAI, Groq, a self-hosted Whisper server...):
  STT_API_KEY   the key (OPENAI_API_KEY is used when this isn't set)
  STT_URL       default https://api.openai.com/v1/audio/transcriptions
  STT_MODEL     default whisper-1 (on Groq e.g. whisper-large-v3)
Without a key nothing is sent anywhere: the voice note is kept for the office to play and ADA asks for it typed.
"""
import json
import logging
import os
import secrets
from typing import Optional

import wa_providers

log = logging.getLogger("whatsapp")
PROMPT = "A WhatsApp voice note to a Nigerian delivery company's assistant, in English or Pidgin. Delivered, collected, naira, cash, transfer, POS."


def key() -> str:
    return os.environ.get("STT_API_KEY") or os.environ.get("OPENAI_API_KEY") or ""


def ready() -> bool:
    return bool(key())


def transcribe(mime: str, data: bytes) -> Optional[str]:
    if not ready() or not data:
        return None
    url = os.environ.get("STT_URL") or "https://api.openai.com/v1/audio/transcriptions"
    ext = {"audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/aac": "aac", "audio/amr": "amr", "audio/wav": "wav"}.get(mime.split(";")[0].strip(), "ogg")
    boundary = "----ada" + secrets.token_hex(8)
    parts = []
    for name, value in (("model", os.environ.get("STT_MODEL") or "whisper-1"), ("prompt", PROMPT), ("response_format", "json")):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode())
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"voice.{ext}\"\r\nContent-Type: {mime.split(';')[0]}\r\n\r\n".encode() + data + b"\r\n")
    body = b"".join(parts) + f"--{boundary}--\r\n".encode()
    status, raw = wa_providers.http("POST", url, body, {"Authorization": f"Bearer {key()}", "Content-Type": f"multipart/form-data; boundary={boundary}"}, timeout=60)
    if not 200 <= status < 300:
        log.info("Voice note couldn't be typed out (%s): %s", status, raw[:200])
        return None
    try:
        text = (json.loads(raw).get("text") or "").strip()
    except ValueError:
        text = raw.decode(errors="replace").strip()
    return text or None
