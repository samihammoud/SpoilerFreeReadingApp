import "dotenv/config";
import OpenAI from "openai";

//creates SDK client
const client = new OpenAI();

//automatically reads env vars for API Key
export const askChat = async (prompt) => {
  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  return response.choices[0].message.content;
};

//take in list of strings, return list of embeddings
export const createEmbedding = async (inputs) => {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: inputs,
    encoding_format: "float",
  });

  //transforms structuered response into list of embeddings
  return response.data.map((item) => item.embedding);
};

//Automatically hitting an api endpoint
