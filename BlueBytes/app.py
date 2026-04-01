import json
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZIP_DEFLATED, ZipFile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse

from docx_to_md import convert_docx_file

app = FastAPI(title="BlueBytes Markdown Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILES = 20
MAX_TOTAL_BYTES = 25 * 1024 * 1024


@app.get("/api/health")
async def health_check():
    return {"ok": True}


@app.get("/")
async def home():
    return RedirectResponse(url="/index.html", status_code=307)


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return RedirectResponse(url="/favicon.svg")


def _safe_output_name(name, used_names):
    stem = Path(name).stem or "converted"
    candidate = f"{stem}.md"
    index = 2
    while candidate.lower() in used_names:
        candidate = f"{stem}-{index}.md"
        index += 1
    used_names.add(candidate.lower())
    return candidate


@app.post("/api/convert")
async def convert_files(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="Upload at least one DOCX file.")
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Upload up to {MAX_FILES} files per conversion.")

    uploads = []
    total_bytes = 0
    for upload in files:
        filename = Path(upload.filename or "document.docx").name
        if Path(filename).suffix.lower() != ".docx":
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename}")
        content = await upload.read()
        total_bytes += len(content)
        if total_bytes > MAX_TOTAL_BYTES:
            raise HTTPException(status_code=400, detail="Upload payload is too large for a single conversion run.")
        uploads.append((filename, content))

    zip_buffer = BytesIO()
    manifest = []
    used_names = set()

    try:
        with TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            with ZipFile(zip_buffer, "w", compression=ZIP_DEFLATED) as archive:
                for original_name, content in uploads:
                    temp_path = temp_root / original_name
                    temp_path.write_bytes(content)
                    converted = convert_docx_file(temp_path, source_name=original_name)
                    output_name = _safe_output_name(original_name, used_names)
                    archive.writestr(output_name, converted["markdown"])
                    manifest.append(
                        {
                            "source": original_name,
                            "output": output_name,
                            "tags": converted["tags"],
                        }
                    )
                archive.writestr("manifest.json", json.dumps({"files": manifest}, indent=2))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {exc}") from exc

    zip_buffer.seek(0)
    headers = {
        "Content-Disposition": 'attachment; filename="bluebytes-markdown.zip"',
        "X-Converted-Count": str(len(manifest)),
    }
    return StreamingResponse(zip_buffer, media_type="application/zip", headers=headers)
