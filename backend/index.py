import asyncio
from contextlib import asynccontextmanager
import pathlib

import fastapi
import fastapi.responses
from filesystem import fileSystemControler
from pydantic import BaseModel
from thumbnailservice import thumbnailGenerator
import tomllib


# loading config
config_path = pathlib.Path(__file__).parent.parent / "config.toml"
config = tomllib.loads(config_path.read_text(encoding="utf-8"))


fs_controler = fileSystemControler(config["path"]["media"])
thumbnailGen = thumbnailGenerator(config["path"]["media"])


# logic for periodic thumbnail deletion
@asynccontextmanager
async def lifespan(app_: fastapi.FastAPI):
    task = asyncio.create_task(thumbnailGen.clear_cache_loop(3600))  # every hour
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = fastapi.FastAPI(lifespan=lifespan)

app.frontend("/", directory="explorer")
app.frontend("/player/", directory="player")
app.frontend("/api/", directory="api")

print(fs_controler.loadAllMedia(fs_controler.rootDir))


class allMedia(BaseModel):
    files: object
    total: int


class mediaInfo(BaseModel):
    name: str
    size: int
    modified: float
    path: str
    type: str


@app.post("/api/mediainfo")
async def mediainfo(files):
    return files
    outputs = {}
    for file in files:
        stats = fs_controler.getFileInfo(file)
        print(stats)
        output = mediaInfo(
            name=stats["name"],
            size=stats["size"],
            modified=stats["modified"],
            path=stats["path"],
            type=stats["type"],
        )
        outputs[file] = output
    return outputs


@app.get("/api/loadMedia")
async def loadMedia(medianame: str = str(fs_controler.rootDir), start = 0, end = 100):
    media = fs_controler.loadAllMedia(medianame, start, end)
    mediaObj = allMedia(
        files=media[1],
        total=media[0]
    )
    print(mediaObj)
    return mediaObj

@app.get('/api/loadMedia/navigate')
async def loadMediaNavigate(directory: str, start = 0, end = 100):
    resp = fs_controler.loadCurrentMedia(directory, start, end)
    mediaObj = allMedia(
        files=resp[1],
        total=resp[0]
    )
    return mediaObj

@app.get("/api/media")
async def media(file):
    fileinfo = fs_controler.getFileInfo(file)
    payload = fastapi.responses.FileResponse(path=fileinfo["relPath"])
    return payload


@app.get("/api/thumbnail")
async def thumbnail(file):
    thumb = thumbnailGen.create_thumbnail(file)
    print("thumb", thumb)
    output = fastapi.responses.FileResponse(thumb)
    return output
