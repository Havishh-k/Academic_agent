"""
Bulk PDF uploader for Semester 3 subjects.
Uses httpx + Supabase REST API directly (no supabase-py needed).
"""
import os, sys, json

try:
    import PyPDF2
except ImportError:
    os.system(f"{sys.executable} -m pip install PyPDF2 --quiet")
    import PyPDF2

try:
    import httpx
except ImportError:
    os.system(f"{sys.executable} -m pip install httpx --quiet")
    import httpx

SUPABASE_URL = "https://rkwgldthrkqcnhqrlvog.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrd2dsZHRocmtxY25ocXJsdm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjAxOTYsImV4cCI6MjA4NjM5NjE5Nn0.HCOhrA6cZvTvZCz5-CN16M5uEi769O4U3hIeUYx6Ip0"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

REST_URL = f"{SUPABASE_URL}/rest/v1/knowledge_base"

SUBJECTS = {
    "a8ef566e-6f3a-4577-b887-d1ebf96b3d23": (
        r"C:\Users\Havish\Downloads\data mining-20260213T070251Z-1-001\data mining",
        "Data Mining"
    ),
    "a167c90e-e0e2-491e-bfd0-b37bdfdd8e3f": (
        r"C:\Users\Havish\Downloads\data warehousing-20260213T070252Z-1-001\data warehousing",
        "Data Warehousing"
    ),
    "bf9e7414-8f59-4ae2-8ed8-2e11690d7500": (
        r"C:\Users\Havish\Downloads\design and analysis of algorithms-20260213T070255Z-1-001\design and analysis of algorithms",
        "DAA"
    ),
    "7e2d8c68-dab0-4e47-b74e-a8503abb45ec": (
        r"C:\Users\Havish\Downloads\financial litracy-20260213T070258Z-1-001\financial litracy",
        "Financial Literacy"
    ),
    "a592694f-b75a-42f7-9697-50137f104fba": (
        r"C:\Users\Havish\Downloads\linear algebra-20260213T070302Z-1-001\linear algebra",
        "Linear Algebra"
    ),
}

CHUNK_SIZE = 1500


def extract_pdf_text(filepath: str) -> str:
    text_parts = []
    try:
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(" ".join(t.split()))
    except Exception as e:
        print(f"  ⚠️ Error reading {filepath}: {e}")
    return "\n\n".join(text_parts)


def chunk_text(text: str, size: int = CHUNK_SIZE) -> list:
    words = text.split()
    chunks, current, current_len = [], [], 0
    for w in words:
        wl = len(w) + 1
        if current_len + wl > size and current:
            chunks.append(" ".join(current))
            current, current_len = [], 0
        current.append(w)
        current_len += wl
    if current:
        chunks.append(" ".join(current))
    return chunks


def upload_subject(client: httpx.Client, subject_id: str, folder: str, name: str):
    print(f"\n{'='*60}")
    print(f"📚 {name}")

    pdfs = sorted(f for f in os.listdir(folder) if f.lower().endswith(".pdf"))
    total = 0

    for pdf_name in pdfs:
        filepath = os.path.join(folder, pdf_name)
        print(f"   📄 {pdf_name}", end=" ... ")

        text = extract_pdf_text(filepath)
        if not text.strip():
            print("⚠️ no text")
            continue

        chunks = chunk_text(text)
        rows = [
            {
                "course_id": subject_id,
                "title": f"{pdf_name} - Part {i+1}",
                "content": c,
                "source_document": pdf_name,
                "chunk_index": i,
            }
            for i, c in enumerate(chunks)
        ]

        # Batch insert 30 at a time
        inserted = 0
        for b in range(0, len(rows), 30):
            batch = rows[b:b+30]
            resp = client.post(REST_URL, content=json.dumps(batch))
            if resp.status_code in (200, 201):
                inserted += len(batch)
            else:
                print(f"\n      ❌ Error: {resp.status_code} {resp.text[:200]}")

        print(f"✅ {inserted} chunks")
        total += inserted

    print(f"   📊 Total: {total} chunks from {len(pdfs)} PDFs")
    return total


if __name__ == "__main__":
    print("🚀 Bulk PDF Upload — Semester 3 Subjects\n")
    grand = 0
    with httpx.Client(headers=HEADERS, timeout=30) as client:
        for sid, (folder, name) in SUBJECTS.items():
            grand += upload_subject(client, sid, folder, name)
    print(f"\n{'='*60}")
    print(f"✅ Done! Total {grand} chunks uploaded across 5 subjects.")
