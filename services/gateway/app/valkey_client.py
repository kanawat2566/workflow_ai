import asyncio
import json
import logging
from collections.abc import AsyncGenerator

import redis.asyncio as redis

logger = logging.getLogger(__name__)


class ValkeyClient:
    def __init__(self, url: str) -> None:
        self._url = url
        self._redis: redis.Redis | None = None

    async def connect(self) -> None:
        if self._redis is None:
            client = redis.from_url(self._url)
            await client.ping()
            self._redis = client

    async def close(self) -> None:
        if self._redis:
            await self._redis.close()
            self._redis = None

    async def subscribe_generator(self, channel: str) -> AsyncGenerator:
        """Async generator that yields parsed messages from the given channel."""
        await self.connect()
        if self._redis is None:
            raise RuntimeError("Valkey connection unavailable")
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(channel)
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message is None:
                    await asyncio.sleep(0.1)
                    continue
                data = message.get("data")
                if isinstance(data, bytes | bytearray):
                    try:
                        s = data.decode()
                    except UnicodeDecodeError:
                        logger.warning("Failed to decode bytes from channel %s", channel)
                        s = repr(data)
                else:
                    s = data
                try:
                    yield json.loads(s)
                except (ValueError, TypeError):
                    yield s
        finally:
            try:
                await pubsub.unsubscribe(channel)
            except Exception:
                logger.warning("Failed to unsubscribe from channel %s", channel)
            try:
                await pubsub.close()
            except Exception:
                logger.warning("Failed to close pubsub for channel %s", channel)
