import pdftotext
import os


#take in pdf, generate to text; Within text, chunk based on chapter; return type new re-structured data

def pdfToString (path: str):
    with open (path, "rb") as f:
        pdf = pdftotext.PDF(f)
        return pdf


pdf_path = os.path.join(os.path.dirname(__file__), "Kafka.pdf")

pdf = pdfToString(pdf_path)
for page in pdf:
    print(page)


