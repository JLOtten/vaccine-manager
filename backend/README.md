## developing

### setup virtual environment

```
python -m venv env
source env/bin/activate
pip install -r requirements.txt
```

just using `pip` for now...

### testing

```
# set PYTHONPATH, assuming running from `backend` dir
PYTHONPATH=$PWD/vaccine_manager pytest
```
