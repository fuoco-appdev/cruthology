from config_wizard import ConfigWizard
from dataclasses import dataclass
from config_field import config_field

@dataclass(frozen=True)
class PromptsConfigWizard(ConfigWizard):
    chat_template: str = config_field(
        "chat_template",
        default=(
            "You are a helpful, respectful and honest assistant."
            "Always answer as helpfully as possible, while being safe."
            "Please ensure that your responses are positive in nature."
        ),
        help_text="Prompt template for chat.",
    )
    rag_template: str = config_field(
        "rag_template",
        default=(
            "<s>[INST] <<SYS>>"
            "Use the following context to answer the user's question. If you don't know the answer,"
            "just say that you don't know, don't try to make up an answer."
            "<</SYS>>"
            "<s>[INST] Context: {context_str} Question: {query_str} Only return the helpful"
            " answer below and nothing else. Helpful answer:[/INST]"
        ),
        help_text="Prompt template for rag.",
    )
    multi_turn_rag_template: str = config_field(
        "multi_turn_rag_template",
        default=(
            "You are a document chatbot. Help the user as they ask questions about documents."
            " User message just asked: {input}\n\n"
            " For this, we have retrieved the following potentially-useful info: "
            " Conversation History Retrieved:\n{history}\n\n"
            " Document Retrieved:\n{context}\n\n"
            " Answer only from retrieved data. Make your response conversational."
        ),
        help_text="Prompt template for rag.",
    )