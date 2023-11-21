from redis_client import *
import os

if __name__ == "__main__":
  redis_client = RedisClient(os.environ.get('REDIS_HOST'), os.environ.get('REDIS_PORT'))
  redis_client.start(os.environ.get('REDIS_CHANNEL'))
