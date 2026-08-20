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
                json={"model": settings.DOUBAO_ENDPOINT_ID, "messages": msgs, "max_tokens": 1024},
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


class OpenAICompatibleVisionProvider:
    """Uses any OpenAI-compatible vision API (e.g. doubao-vision, qwen-vl)."""

    def __init__(self, api_url: str, api_key: str, model: str):
        self.api_url = api_url
        self.api_key = api_key
        self.model = model

    async def analyze_image(self, base64_image: str, prompt: str) -> str:
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                ],
            }
        ]
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                self.api_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"model": self.model, "messages": messages, "max_tokens": 1024},
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


def get_vision_provider() -> OpenAICompatibleVisionProvider:
    if settings.QWEN_API_KEY:
        return OpenAICompatibleVisionProvider(
            api_url="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
            api_key=settings.QWEN_API_KEY,
            model="qwen-vl-plus",
        )
    if settings.DOUBAO_API_KEY:
        return OpenAICompatibleVisionProvider(
            api_url="https://ark.cn-beijing.volces.com/api/v3/chat/completions",
            api_key=settings.DOUBAO_API_KEY,
            model=settings.DOUBAO_ENDPOINT_ID,
        )
    return OpenAICompatibleVisionProvider(
        api_url="https://api.deepseek.com/v1/chat/completions",
        api_key=settings.DEEPSEEK_API_KEY,
        model="deepseek-chat",
    )
