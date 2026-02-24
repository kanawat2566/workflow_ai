import asyncio
import json
import redis.asyncio as redis


class ValkeyClient:
    def __init__(self, url: str):
        self._url = url
        self._redis = None

    async def connect(self):
        if self._redis is None:
            self._redis = redis.from_url(self._url)

    async def close(self):
        if self._redis:
            await self._redis.close()
            self._redis = None

    async def subscribe_generator(self, channel: str):
        """Async generator that yields parsed messages from the given channel."""
        await self.connect()
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(channel)
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message is None:
                    await asyncio.sleep(0.1)
                    continue
                data = message.get("data")
                if isinstance(data, (bytes, bytearray)):
                    try:
                        s = data.decode()
                    except Exception:
                        s = repr(data)
                else:
                    s = data
                # try parse json
                try:
                    obj = json.loads(s)
                    yield obj
                except Exception:
                    yield s
        finally:
            try:
                await pubsub.unsubscribe(channel)
            except Exception:
                pass
            try:
                await pubsub.close()
            except Exception:
                pass
