import fastapi
from filesystem import fileSystemControler
from pydantic import BaseModel
import fastapi.responses

app = fastapi.FastAPI()

app.frontend("/", directory="explorer")
app.frontend("/player/", directory="player")
app.frontend("/api/", directory="api")

fs_controler = fileSystemControler("./media")


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
