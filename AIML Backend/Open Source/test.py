import os
from groq import Groq

# Use the API key directly here
client = Groq(api_key="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")

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],
    model="llama3-8b-8192",
)

print(chat_completion.choices[0].message.content)
