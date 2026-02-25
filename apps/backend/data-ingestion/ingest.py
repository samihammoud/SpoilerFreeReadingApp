import pdftotext
import os
import re


#take in pdf, generate to text; Within text, seperated based on chapter; return this, send out to get chunked
    
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



# pdf_path = os.path.join(os.path.dirname(__file__), "Kafka.pdf")
# pdf = pdfToString(pdf_path)
# print(pdf)
# chapters = StringToChapters(pdf)
# #key-value
# for chapter, chapter_text in chapters.items():
#     print(chapter, len(chapter_text))

