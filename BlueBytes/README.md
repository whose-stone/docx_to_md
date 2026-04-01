# BlueBytes Markdown Studio

BlueBytes Markdown Studio is now a browser-based DOCX to Markdown app designed for Vercel: a polished static frontend in `public/` and a FastAPI backend in `app.py`.

## Project Shape

- `app.py` - FastAPI API for uploads and conversion
- `docx_to_md.py` - shared DOCX to Markdown conversion engine
- `public/` - browser UI assets
- `requirements.txt` - Python dependencies
- `vercel.json` - Vercel framework config

## Local Development

From the `BlueBytes` folder:

```powershell
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Run batch conversion locally from the CLI:

```powershell
..\.venv\Scripts\python.exe docx_to_md.py .
```

For browser-based local testing, use Vercel local dev:

```powershell
vercel dev
```

## Deployment

Deploy the `BlueBytes` folder to Vercel. The frontend is served from `public/`, and Vercel runs the FastAPI app from `app.py`.

## Browser Workflow

1. Open the site.
2. Drag in one or more `.docx` files.
3. Click `Convert to Markdown`.
4. Download the generated ZIP of Markdown files.

## Notes

- The API accepts up to 20 DOCX files per request
- The API returns a ZIP download containing converted `.md` files plus a `manifest.json`
- Markdown files include frontmatter with the original source filename and extracted tags
