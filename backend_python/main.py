from fastapi import Query
from fastapi.responses import HTMLResponse
import os
import uuid
import logging
import fitz  # PyMuPDF
import json
from agents import set_default_openai_key
from agents import Agent, Runner
from agents import function_tool, WebSearchTool  # built-in tool

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Response

try:
    from supabase import create_client
except Exception:
    create_client = None

openai_key = os.getenv("OPENAI_API_KEY")
if not openai_key:
    raise RuntimeError("Missing OPENAI_API_KEY environment variable")
set_default_openai_key(openai_key)

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s | %(levelname)-8s | " "%(module)s:%(funcName)s:%(lineno)d - %(message)s")
logger = logging.getLogger("uvicorn")

app = FastAPI(title="resumATE backend-python", version="0.1.0")


def get_supabase_client():
    """Create and return a Supabase client using environment variables.

    If SUPABASE_URL or SUPABASE_KEY are not set, returns None.
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key or create_client is None:
        return None
    return create_client(url, key)


def get_supabase_bucket_name():
    """Get the Supabase storage bucket name from environment or default."""
    return os.getenv("SUPABASE_BUCKET", "pdf-uploads")


@app.on_event("startup")
async def startup_event():
    logger.info("I expect this to log")
    app.state.supabase = get_supabase_client()


@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Hello from backend-python (FastAPI)!"}


@app.get("/health", tags=["health"])
async def health():
    """Basic health check that also validates Supabase config presence."""
    supabase = getattr(app.state, "supabase", None)
    return {"status": "ok", "supabase_configured": supabase is not None}


# PDF upload endpoint
@app.post("/upload-pdf", tags=["pdf"])
async def upload_pdf(file: UploadFile = File(...), user_id: str = Form(...)):
    """Accept a PDF file upload, upload it to Supabase, and link to user_uploaded_pdfs."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    supabase = getattr(app.state, "supabase", None)
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured.")
    bucket_name = get_supabase_bucket_name()
    contents = await file.read()
    orig_name = file.filename
    name, ext = os.path.splitext(orig_name)
    unique_name = f"{name}_upload_{uuid.uuid4().hex}{ext}"
    file_path = unique_name
    try:
        response = supabase.storage.from_(bucket_name).upload(file_path, contents, {"content-type": "application/pdf"})
        if hasattr(response, "error") and response.error:
            raise Exception(str(response.error))
        # Insert record into user_uploaded_pdfs
        db_response = supabase.table("user_uploaded_pdfs").insert({"user_id": user_id, "pdf_filename": file_path}).execute()
        if hasattr(db_response, "error") and db_response.error:
            raise Exception(f"DB error: {db_response.error}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload PDF: {e}")
    return {"message": "PDF uploaded and linked to user", "file_name": file_path}


# UI endpoint for testing PDF upload
@app.get("/upload-ui", response_class=HTMLResponse, tags=["ui"])
async def upload_ui():
    html_content = """
    <html>
        <head>
            <title>Test PDF Upload</title>
        </head>
        <body>
            <h2>Upload PDF to Supabase</h2>
            <form action='/upload-pdf' enctype='multipart/form-data' method='post'>
                <label>User ID:</label><br>
                <input name='user_id' type='text' required /><br><br>
                <input name='file' type='file' accept='application/pdf' required /><br><br>
                <button type='submit'>Upload PDF</button>
            </form>
            <p>Enter a valid user_id from your users table.</p>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)


# Endpoint to download generated PDFs
@app.get("/download-generated-pdf", tags=["pdf"])
async def download_generated_pdf(filename: str = Query(...)):
    """Download a generated PDF from Supabase Storage by filename (query param)."""
    supabase = getattr(app.state, "supabase", None)
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured.")
    bucket_name = get_supabase_bucket_name()
    logger.info(f"\n\nbucket: {bucket_name}\n\n")
    try:
        # Download file from Supabase Storage
        response = supabase.storage.from_(bucket_name).download(filename)
        if hasattr(response, "error") and response.error:
            raise Exception(str(response.error))
        # response should be bytes
        return Response(content=response, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"PDF not found or error: {e}")


# UI endpoint for testing generated PDF download
@app.get("/download-ui", response_class=HTMLResponse, tags=["ui"])
async def download_ui():
    html_content = """
    <html>
        <head>
            <title>Test Download Generated PDF</title>
        </head>
        <body>
            <h2>Download Generated PDF from Supabase</h2>
            <form action='/download-generated-pdf/' method='get'>
                <label>PDF Filename:</label><br>
                <input name='filename' type='text' required /><br><br>
                <button type='submit'>Download PDF</button>
            </form>
            <p>Enter the filename as stored in Supabase (from generated_pdfs table).</p>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)


def extract_text_from_pdf(file):
    pdf = fitz.open(stream=file, filetype="pdf")
    text = ""
    for page in pdf:
        text += page.get_text()
    return text.strip()


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)
    logger.info(f"\n\nExtracted resume text: {text}\n\n")
    prompt = f"""
    You are a resume parser. Given this resume text, extract key structured information
    in valid JSON with the following keys:
    name, contact (email, phone, location), summary, skills, experience (company, role, start_date, end_date, description),
    and education (institution, degree, year).
    \nResume text:\n{text}
    """

    # Use the agents API to call OpenAI (updated usage)
    agent = Agent(
        name="resume-parser",
        # instructions=prompt,
        model="gpt-4.1",  # or your preferred model
        tools=[WebSearchTool()],
        # response_format={"type": "json_object"},
        # stream=False
    )

    result = Runner.run(agent, prompt)
    logger.info(f"\n\nResume parsing result: {result}\n\n")

    # result['output'] should contain the parsed JSON string
    try:
        parsed_resume = json.loads(result['output'])
        logger.info(f"\n\nResume parsing result: {parsed_resume}\n\n")
    except Exception:
        # fallback: try to return raw output
        parsed_resume = {"raw": result['output']}
    return parsed_resume


# UI endpoint for testing resume parsing
@app.get("/parse-resume-ui", response_class=HTMLResponse, tags=["ui"])
async def parse_resume_ui():
    html_content = """
    <html>
        <head>
            <title>Test Resume Parser</title>
        </head>
        <body>
            <h2>Test Resume Parsing</h2>
            <form action='/parse-resume' enctype='multipart/form-data' method='post'>
                <label>Upload Resume PDF:</label><br>
                <input name='file' type='file' accept='application/pdf' required /><br><br>
                <button type='submit'>Parse Resume</button>
            </form>
            <p>This will POST the PDF to <code>/parse-resume</code> and return the parsed JSON.</p>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
