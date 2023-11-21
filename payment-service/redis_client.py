import redis

class RedisClient:
  def __init__(self, host: str, port: int):
    self.redis_client = redis.Redis(host=host, port=port)
  

  def start(self, channel: str):
    pubsub = self.redis_client.pubsub()
    pubsub.subscribe(channel)

    print(f">> Subscribed to Redis channel {channel}.")

    for message in pubsub.listen():
      if message['type'] == 'message':
        decoded_message = self._decode_bytes_to_string(message['data'])
        print(f"Received message: {decoded_message}")

  def _decode_bytes_to_string(self, bytes: bytes):
    return bytes.decode('utf-8')