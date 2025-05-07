import requests
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic import BaseModel, Field
from pathlib import Path
from dotenv import load_dotenv
import os
import weaviate
from weaviate.classes.config import Property, DataType, Configure
from weaviate.classes.config import Tokenization
from weaviate.classes.init import Auth
import weaviate.classes as wvc
from weaviate.classes.query import Filter
from weaviate.classes.config import Configure
import json
import time
import random
import tiktoken
from weaviate.agents.query import QueryAgent

def main():
    #load environment variables
    env_path = (Path(__file__)
            .resolve()
            .parents[2]
            / ".env")
    load_dotenv(dotenv_path=env_path, override=False)
    
    openai_api_key = os.getenv("OPENAI_API_KEY")
    weaviate_api_key = os.getenv("WEAVIATE_API_KEY")
    weaviate_cluster_url = os.getenv("WEAVIATE_CLUSTER_URL")

    #initilize weaviate client
    weaviate_client = weaviate.connect_to_weaviate_cloud(
        cluster_url=weaviate_cluster_url,
        auth_credentials=Auth.api_key(weaviate_api_key),
        headers={'X-OpenAI-Api-key': openai_api_key},
    )

    print(f"client is ready: {weaviate_client.is_ready()}")

    # collection = weaviate_client.collections.get("osha_standards")
    # response = collection.query.near_text(
    #     query="return to me everything for subpart 1926 subpart CC",
    #     limit=30
    # )

    # for obj in response.objects:
    #     print(json.dumps(obj.properties, indent=2))

    #     weaviate_client.close()  # Free up resources

    qa = QueryAgent(
        client=weaviate_client, collections=["osha_standards"]
    )

    response = qa.run("what should workers of subcontractors we hired be wearing on a construction site?")

    response.display()

    weaviate_client.close()

if __name__ == '__main__':
    main()