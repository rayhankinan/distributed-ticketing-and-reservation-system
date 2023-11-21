from redis_client import *

if __name__ == "__main__":
  redis_client = RedisClient("localhost", 6379)
  redis_client.start('test_channel')