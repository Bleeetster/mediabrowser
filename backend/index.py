import fastapi
import json
from filesystem import fileSystemControler
from pydantic import BaseModel

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


@app.get("/api/mediainfo")
async def mediainfo(file):
    stats = fs_controler.getFileInfo(file)
    print(stats)
    output = mediaInfo(
        name=stats["Name"],
        size=stats["Size"],
        modified=stats["Modified"],
        path=stats["Path"],
    )
    return output


@app.get("/api/loadMedia")
async def loadMedia():
    media = fs_controler.loadAllMedia()
    mediaObj = allMedia(files=media)
    print(mediaObj)
    return mediaObj
