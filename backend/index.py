import fastapi

from filesystem import fileSystemControler

app = fastapi.FastAPI()

app.frontend("/", directory="explorer")
app.frontend("/player/", directory="player")

fs_controler = fileSystemControler("./media")


@app.get("/api/mediainfo")
async def mediainfo(file):
    return fs_controler.getFileInfo(file)


@app.get("/api/loadMedia")
async def loadMedia():
    return fs_controler.loadAllMedia()
