import pdftotext
import os
import re
import json
import argparse

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


#now that have dictionary of chapter : text, chunk each chapter into 1000 character chunks; return dictionary of chapter : list of chunked text
#Example in finalDict.json
def ChapterToChunks(chapters: dict[str, str], chunk_size: int = 1000) -> dict[str, list[str]]:
    chapter_chunks = {}
    for chapter, text in chapters.items():
        chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
        chapter_chunks[chapter] = chunks
    return chapter_chunks

#combine all functions
def pdfToChunks(path: str, chunk_size: int = 1000) -> dict[str, list[str]]:
    pdf_text = pdfToString(path)
    chapters = StringToChapters(pdf_text)
    chapter_chunks = ChapterToChunks(chapters, chunk_size)
    return chapter_chunks

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file-path", required=True)
    parser.add_argument("--chunk-size", type=int, default=1000)
    args = parser.parse_args()

    final_dict = pdfToChunks(args.file_path, chunk_size=args.chunk_size)
    print(json.dumps(final_dict, ensure_ascii=False))


if __name__ == "__main__":
    main()
