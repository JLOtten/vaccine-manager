## developing

### setup virtual environment

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies and create virtual environment
uv sync

# Activate the virtual environment
source .venv/bin/activate
```

### testing

```bash
# Run tests with uv
uv run pytest

# Or run with PYTHONPATH set
PYTHONPATH=$PWD/vaccine_manager uv run pytest
```
