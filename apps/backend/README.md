# Backend

Backend code for Chapter & Verse.

## Current contents

- `api/`: API service placeholder.
- `data_ingestion/`: ingestion scripts and supporting files.

## Notes

- Python cache directories are ignored via root `.gitignore`.
- Keep backend dependencies documented here as the service is built out.

## Local Llama enrichment

You can enrich ingestion with chapter summaries, key events, and newly introduced characters
using a local Ollama model.

### API ingestion pipeline

Set environment variables before starting the API:

```bash
export LOCAL_LLM_ENRICHMENT_ENABLED=true
export LOCAL_LLM_ENRICHMENT_MODEL=llama3.1:8b-instruct-q4_K_M
export LOCAL_LLM_ENRICHMENT_TIMEOUT_SECONDS=90
```

When enabled, each chunk metadata will include:
- `chapterSummary`
- `keyEventsJson`
- `introducedCharactersJson`

### CLI ingestion script

From `apps/backend`:

```bash
python -m data_ingestion.ingest \
  --file-path data_ingestion/Kafka.pdf \
  --chunk-size 1000 \
  --enrich-local-llama \
  --local-llama-model llama3.1:8b-instruct-q4_K_M
```
