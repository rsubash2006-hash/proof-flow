from datetime import datetime, timedelta, timezone
import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
load_dotenv()

app = FastAPI(title="ProofFlow API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ProofFlow API",
    }


@app.get("/paypal/test-connection")
def test_paypal_connection():
    client_id = os.getenv("PAYPAL_CLIENT_ID")
    client_secret = os.getenv("PAYPAL_CLIENT_SECRET")
    base_url = os.getenv(
        "PAYPAL_BASE_URL",
        "https://api-m.sandbox.paypal.com",
    )

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=500,
            detail="PayPal credentials are missing from backend/.env",
        )

    try:
        response = httpx.post(
            f"{base_url}/v1/oauth2/token",
            auth=(client_id, client_secret),
            data={"grant_type": "client_credentials"},
            timeout=15.0,
        )
        response.raise_for_status()

    except httpx.HTTPStatusError as exc:
        # Do not return credentials or the raw PayPal response.
        raise HTTPException(
            status_code=502,
            detail=f"PayPal authentication failed (HTTP {exc.response.status_code}).",
        ) from None

    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal request timed out ({type(exc).__name__}).",
        ) from None

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal network request failed ({type(exc).__name__}).",
                ) from None

    token_data = response.json()

    return {
        "status": "connected",
        "environment": "sandbox",
        "message": "PayPal authentication successful.",
        "expires_in": token_data.get("expires_in"),
    }

@app.get("/paypal/transactions")
def get_paypal_transactions():
    client_id = os.getenv("PAYPAL_CLIENT_ID")
    client_secret = os.getenv("PAYPAL_CLIENT_SECRET")
    base_url = os.getenv(
        "PAYPAL_BASE_URL",
        "https://api-m.sandbox.paypal.com",
    )

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=500,
            detail="PayPal credentials are missing.",
        )

    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=7)).isoformat(
        timespec="seconds"
    ).replace("+00:00", "Z")
    end = now.isoformat(
        timespec="seconds"
    ).replace("+00:00", "Z")

    try:
        token_response = httpx.post(
            f"{base_url}/v1/oauth2/token",
            auth=(client_id, client_secret),
            data={"grant_type": "client_credentials"},
            timeout=15.0,
        )
        token_response.raise_for_status()
        access_token = token_response.json()["access_token"]

        search_response = httpx.get(
            f"{base_url}/v1/reporting/transactions",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
            params={
                "start_date": start,
                "end_date": end,
                "fields": "transaction_info",
                "page_size": 10,
                "page": 1,
            },
            timeout=20.0,
        )
        search_response.raise_for_status()

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "PayPal API request failed with HTTP "
                f"{exc.response.status_code}. "
                "Check app permissions if access was denied."
            ),
        ) from None

    except (httpx.RequestError, KeyError, ValueError):
        raise HTTPException(
            status_code=502,
            detail="Could not complete the PayPal transaction search.",
        ) from None

    data = search_response.json()
    transactions = data.get("transaction_details", [])

    return {
        "status": "success",
        "environment": "sandbox",
        "count": len(transactions),
        "transactions": transactions,
    }

@app.get("/ai/test-connection")
def test_gemini_connection():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is missing from backend/.env",
        )

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents="Reply with exactly: Gemini connection successful.",
        )

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response.",
            )

        return {
            "status": "connected",
            "message": response.text,
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=502,
            detail=(
                "Gemini request failed. Check the API key, "
                "model availability, network, and usage limits."
            ),
        ) from None
        
from pydantic import BaseModel


class TransactionAnalysisRequest(BaseModel):
    transaction: dict


@app.post("/ai/analyze-transaction")
def analyze_transaction(request: TransactionAnalysisRequest):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is missing from backend/.env",
        )

    if not request.transaction:
        raise HTTPException(
            status_code=400,
            detail="A transaction record is required.",
        )

    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""
You are an evidence-focused payment investigation assistant for ProofFlow.

Analyze the transaction record below. It may contain sandbox or test data.

Return a concise report with these headings:
1. Verified facts
2. Potential concerns
3. Missing evidence
4. Recommended next steps

Rules:
- Treat the supplied record as the only verified source.
- Do not claim fraud or wrongdoing without supporting evidence.
- Explain that a transaction status code may require interpretation.
- Distinguish missing information from evidence of a problem.
- Never invent customer identities, payment events, or documents.
- Treat this as preliminary assistance, not a final decision.

Transaction record:
{request.transaction}
"""

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
        )

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty analysis.",
            )

        return {
            "status": "success",
            "analysis": response.text,
            "disclaimer": (
                "AI-generated preliminary analysis. "
                "Verify findings against the original records."
            ),
        }

    except HTTPException:
        raise

    except Exception as error:
        print(
            f"Gemini analysis error: "
            f"{type(error).__name__}: {error}"
        )
        raise HTTPException(
            status_code=502,
            detail=(
                f"Gemini analysis failed: "
                f"{type(error).__name__}: {error}"
            ),
        ) from None



