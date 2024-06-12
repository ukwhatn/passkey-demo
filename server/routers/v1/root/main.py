import base64
import secrets

from fastapi import APIRouter
from fastapi import Request, Response

# define router
router = APIRouter()


# define route
@router.get("/")
async def read_root(request: Request, response: Response):
    print("test")
    return {"message": "Hello World"}


# ------
# ここからPasskey(WebAuthn)実装
# ------

def generate_random_bytes(length: int) -> bytes:
    return secrets.token_bytes(length)


@router.get("/getChallenge")
async def get_challenge(request: Request, response: Response):
    challenge = generate_random_bytes(32)
    challenge_b64 = base64.urlsafe_b64encode(challenge).decode("utf-8")
    return {"challenge": challenge_b64}
