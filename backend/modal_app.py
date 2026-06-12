import modal
import os
import sys

# Define target directories and pathing dynamically
dotenv_path = "backend/.env" if os.path.exists("backend/.env") else ".env"

# Inject secrets from .env or environment dictionary
secrets_list = []
if os.path.exists(dotenv_path):
    secrets_list.append(modal.Secret.from_dotenv(path=dotenv_path))
else:
    secrets_list.append(modal.Secret.from_dict({
        "OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY", ""),
        "OPENAI_MODEL": os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    }))

# Define the remote container image with required python dependencies
image = (
    modal.Image.debian_slim()
    .pip_install(
        "fastapi",
        "uvicorn",
        "httpx",
        "openai",
        "python-dotenv",
        "pydantic"
    )
    # Add local files to /app inside container, baking them in but ignoring local environments and secrets
    .add_local_dir(
        "backend" if os.path.exists("backend") else ".",
        remote_path="/app",
        copy=True,
        ignore=["venv", ".venv", "__pycache__", "*.pyc", ".git", ".env"]
    )
)

app = modal.App(name="mutation-therapy-backend", image=image)

@app.function(image=image, secrets=secrets_list)
@modal.asgi_app()
def fastapi_app():
    # Make sure local files/modules are in search path
    sys.path.append("/app")
    os.chdir("/app")
    
    # Import and return FastAPI instance
    from main import app as web_app
    return web_app
