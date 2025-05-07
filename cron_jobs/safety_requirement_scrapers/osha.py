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

def main():
    def count_tokens(text, model="text-embedding-3-large"):
        """Count tokens using the appropriate tokenizer for the embedding model."""
        # Use cl100k_base encoding for the newer embedding models
        encoding_name = "cl100k_base"
        encoder = tiktoken.get_encoding(encoding_name)
        return len(encoder.encode(text))

    def chunk_document(document, max_tokens=6000):
        """Split a document into chunks of approximately max_tokens."""
        encoder = tiktoken.get_encoding("cl100k_base")
        tokens = encoder.encode(document)
        
        chunks = []
        current_chunk = []
        current_count = 0
        
        for token in tokens:
            current_chunk.append(token)
            current_count += 1
            
            if current_count >= max_tokens:
                chunks.append(encoder.decode(current_chunk))
                current_chunk = []
                current_count = 0
        
        if current_chunk:
            chunks.append(encoder.decode(current_chunk))
        
        return chunks

    def insert_batch(collection, source_objects, max_tokens=6000):
        """Insert documents into Weaviate, handling chunking for oversized documents."""
        processed_objects = []
        
        # Process and chunk documents if needed
        for obj in source_objects:
            token_count = count_tokens(obj["content"])
            
            if token_count < max_tokens:
                # Document fits within token limit - use as is
                processed_objects.append(obj)
            else:
                # Document exceeds token limit - chunk it
                print(f"Chunking document {obj['standard_number']} with {token_count} tokens")
                content_chunks = chunk_document(obj["content"], max_tokens)
                
                for i, chunk in enumerate(content_chunks):
                    # Create a new document object for each chunk
                    chunked_obj = obj.copy()
                    chunked_obj["content"] = chunk
                    # Modify title instead of standard_number as requested
                    chunked_obj["title"] = f"{obj['title']} NOTE: CHUNK chunk_{i+1}"
                    processed_objects.append(chunked_obj)
                
                print(f"Split into {len(content_chunks)} chunks")
        
        # Now use your existing batch insertion logic
        print(f"Inserting {len(processed_objects)} documents in batch")
        
        print(f"Processed objects: {processed_objects}")
        with collection.batch.fixed_size(batch_size=200) as batch:
            for src_obj in processed_objects:
                batch.add_object(
                    properties={
                        "part_number": src_obj["part_number"],
                        "subpart": src_obj["subpart"],
                        "standard_number": src_obj["standard_number"],
                        "title": src_obj["title"],
                        "gpo_source": src_obj["gpo_source"],
                        "content": src_obj["content"],
                    },
                    # vector=vector  # Optionally provide a pre-obtained vector
                )
        
        if batch.number_errors > 1:
            print("Batch import stopped due to excessive errors.")
            raise Exception("Batch import stopped due to excessive errors.")
        
        return processed_objects


    #load environment variables
    env_path = (Path(__file__)
            .resolve()
            .parents[2]
            / ".env")
    load_dotenv(dotenv_path=env_path, override=False)
    
    openai_api_key = os.getenv("OPENAI_API_KEY")
    jina_api_key = os.getenv("JINA_API_KEY")
    weaviate_api_key = os.getenv("WEAVIATE_API_KEY")
    weaviate_cluster_url = os.getenv("WEAVIATE_CLUSTER_URL")

    #initialize agents
    class OshaUrlsOutput(BaseModel):
        osha_urls: list[str] = Field(description="A list of links to the osha standards documents")

    class OshaDictOutput(BaseModel):
        osha_dict: dict = Field(description="A dictionary of the osha standards documents")

    model = OpenAIModel('o3-mini', provider=OpenAIProvider(api_key=openai_api_key))
    url_agent = Agent(model,
                      system_prompt='You are a helpful assistant that will return links in a python list from a marked down version of a webpage from osha.org that the user has given you. Only respond back with a python list of links and nothing else.',
                      output_type=OshaUrlsOutput,
                      retries=5
                      )
    osha_dict_agent = Agent(model,
                      system_prompt='You are a helpful assistant that will return text in the python dictionary format from a marked down version of a webpage from osha.org that the user has given you. The user will tell you what the keys should be and you will put the value of the dictionary as per what the key relates to on the marked down webpage. Only respond back with a python dictionary and nothing else.',
                      output_type=OshaDictOutput,
                      retries=5
                      )


    #initilize weaviate client
    weaviate_client = weaviate.connect_to_weaviate_cloud(
        cluster_url=weaviate_cluster_url,
        auth_credentials=Auth.api_key(weaviate_api_key),
        headers={'X-OpenAI-Api-key': openai_api_key},
    )
    try:

        #initialize weaviate collection
        collection_name = "osha_standards"
        if weaviate_client.collections.exists(collection_name):
            print("Collection (index) already exists. Deleting and making a new one...")
            weaviate_client.collections.delete(collection_name)

        print("Creating a new collection (index) with some metadata as properties...")
        osha_weaviate_collection = weaviate_client.collections.create(
                                                    collection_name,
                                                    vectorizer_config=[
                                                        Configure.NamedVectors.text2vec_openai(
                                                            name="oshaDocumentEmbedding",
                                                            source_properties=[
                                                                "part_number", "subpart", "standard_number",
                                                                "title", "gpo_source", "content"
                                                            ],
                                                        )
                                                    ],
                                                    properties=[
                                                        Property(
                                                            name="part_number",
                                                            data_type=DataType.TEXT,
                                                            vectorize_property_name=False,
                                                        ),
                                                        Property(
                                                            name="part_number_title",
                                                            data_type=DataType.TEXT,
                                                            vectorize_property_name=False,
                                                        ),
                                                        Property(
                                                            name="subpart",
                                                            data_type=DataType.TEXT,
                                                            vectorize_property_name=False,
                                                        ),
                                                        Property(
                                                            name="subpart_title",
                                                            data_type=DataType.TEXT,
                                                            vectorize_property_name=False,
                                                        ),
                                                        Property(
                                                            name="standard_number",
                                                            data_type=DataType.TEXT,
                                                            vectorize_property_name=False,
                                                        ),
                                                        Property(
                                                            name="title",
                                                            data_type=DataType.TEXT,
                                                            vectorize_property_name=False,
                                                        ),
                                                        Property(
                                                            name="gpo_source",
                                                            data_type=DataType.TEXT,
                                                            vectorize_property_name=False,
                                                        ),
                                                        Property(
                                                            name="content",
                                                            data_type=DataType.TEXT,
                                                            vectorize_property_name=True,
                                                            tokenization=wvc.config.Tokenization.LOWERCASE,
                                                        ),
                                                    ]
                                                )

        jina_url = "https://r.jina.ai/"
        osha_url = "https://www.osha.gov/laws-regs/regulations/standardnumber/1926"
        headers = {
        "Authorization": "Bearer " + jina_api_key
        }

        url_response = requests.get(jina_url + osha_url, headers=headers)

        osha_urls = url_agent.run_sync(f"What are all the links in this webpage that containt documents to Standards 1926, do not return links to a Subpart or the Table of Contents {url_response.text}")

        source_objects = []
        for i, url in enumerate(osha_urls.output.osha_urls):
            print(f"This is the url: {url}")
            if i % 20 == 0 or i == len(osha_urls.output.osha_urls) - 1:
                insert_batch(osha_weaviate_collection, source_objects)
                source_objects = []
            time.sleep(random.randint(2, 8))    
            osha_documents_response = requests.get(jina_url + url, headers=headers)
            osha_dict = osha_dict_agent.run_sync(f"Return to me the part number, subpart, standard number, title, gpo source, and the content of this document {osha_documents_response.text}. The part_number, subpart, standard_number, title, gpo_source, and content should be the keys of the dictionary and the values should be your answer to what each key relates to on the webpage. Content will be the content of the page that is located after the gpo source. Do not respond back with any links as a value in the dictionary.")
            print(f"This is the dictionary: {osha_dict.output.osha_dict}")
            source_objects.append(osha_dict.output.osha_dict)
    finally:     
        weaviate_client.close()


if __name__ == '__main__':
    main()