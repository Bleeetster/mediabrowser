import asyncio
from contextlib import asynccontextmanager

import fastapi
import fastapi.responses
from filesystem import fileSystemControler
from pydantic import BaseModel
from thumbnailservice import thumbnailGenerator

fs_controler = fileSystemControler("./media")
thumbnailGen = thumbnailGenerator("./media")


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


class allMedia(BaseModel):
    files: object


class mediaInfo(BaseModel):
    name: str
    size: int
    modified: float
    path: str
    type: str


@app.get("/api/mediainfo")
async def mediainfo(file):
    stats = fs_controler.getFileInfo(file)
    print(stats)
    output = mediaInfo(
        name=stats["name"],
        size=stats["size"],
        modified=stats["modified"],
        path=stats["path"],
        type=stats["type"],
    )
    return output


@app.get("/api/loadMedia")
async def loadMedia():
    media = fs_controler.loadAllMedia()
    mediaObj = allMedia(files=media)
    print(mediaObj)
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
