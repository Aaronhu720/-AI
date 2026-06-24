from abc import ABC, abstractmethod

import httpx

from app.core.config import settings


class AIProvider(ABC):
    @abstractmethod
    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        pass


class DeepSeekProvider(AIProvider):
    API_URL = "https://api.deepseek.com/v1/chat/completions"

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        msgs = []
        if system_prompt:
            msgs.append({"role": "system", "content": system_prompt})
        msgs.extend(messages)

        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                self.API_URL,
                headers={"Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}"},
                json={"model": "deepseek-chat", "messages": msgs, "max_tokens": 1024},
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"]


class DoubaoProvider(AIProvider):
    API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        msgs = []
        if system_prompt:
            msgs.append({"role": "system", "content": system_prompt})
        msgs.extend(messages)

        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                self.API_URL,
                headers={"Authorization": f"Bearer {settings.DOUBAO_API_KEY}"},
                json={"model": "doubao-1-5-pro-32k-250115", "messages": msgs, "max_tokens": 1024},
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"]


class QwenProvider(AIProvider):
    API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

    async def chat(self, messages: list[dict], system_prompt: str = "") -> str:
        msgs = []
        if system_prompt:
            msgs.append({"role": "system", "content": system_prompt})
        msgs.extend(messages)

        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                self.API_URL,
                headers={"Authorization": f"Bearer {settings.QWEN_API_KEY}"},
                json={"model": "qwen-plus", "messages": msgs, "max_tokens": 1024},
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"]


def get_ai_provider() -> AIProvider:
    providers = {
        "deepseek": DeepSeekProvider,
        "doubao": DoubaoProvider,
        "qwen": QwenProvider,
    }
    provider_class = providers.get(settings.AI_PROVIDER, DeepSeekProvider)
    return provider_class()
