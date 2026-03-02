import pdftotext
import re
import json
import argparse
from typing import Any

#take in pdf, generate to text; Within text, seperated based on chapter; within chapter, chunk and return 
    
def pdfToString (path: str):
    with open (path, "rb") as f:
        pdf = pdftotext.PDF(f)
        return "\n\n".join(pdf)

#return dictionary of chapter to text; chapter is key, text is value
def StringToChapters(pdf_text) -> dict[str, str]:
    text = str(pdf_text)

    #comparison of regexes for chapter headers:
    chapter_header_re = re.compile(r"(?im)^(chapter\s+(?:\d+|[ivxlcdm]+)\b[^\n]*)$")
    matches = list(chapter_header_re.finditer(text))

    if not matches:
        return {"Full Document": text}

    chapters = {}
    for i, match in enumerate(matches):
        chapter_name = match.group(1).strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        #key-value assignment
        chapters[chapter_name] = text[start:end].strip()

    return chapters

#combine all functions
def pdfToChunks(path: str, chunk_size: int = 1000) -> list[dict[str, Any]]:
    pdf_text = pdfToString(path)
    chapters = StringToChapters(pdf_text)
    items: list[dict[str, Any]] = []

    for chapter, text in chapters.items():
        chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
        for index, chunk in enumerate(chunks):
            if not isinstance(chunk, str) or not chunk.strip():
                continue
            items.append(
                {
                    "chapter": chapter,
                    "chunkIndex": index,
                    "text": chunk,
                }
            )

    return items


def pdf_to_chunks(path: str, chunk_size: int = 1000) -> list[dict[str, Any]]:
    """Snake_case alias used by package imports."""
    return pdfToChunks(path, chunk_size=chunk_size)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file-path", required=True)
    parser.add_argument("--chunk-size", type=int, default=1000)
    args = parser.parse_args()

    final_dict = pdfToChunks(args.file_path, chunk_size=args.chunk_size)
    print(json.dumps(final_dict, ensure_ascii=False))


if __name__ == "__main__":
    main()
