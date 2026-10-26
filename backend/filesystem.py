from pathlib import Path
import mimetypes


class fileSystemControler:
    def __init__(self, rootDir: str) -> None:
        root_directory: Path = Path(rootDir)
        if not root_directory.exists():
            raise Exception("DIRECTORY_NOT_FOUND")
        self.rootDir: Path = root_directory
        self.sortType = "name"
        self.decending = False

    def loadAllMedia(self, dir, start = 0, end = 100):
        directory = Path(dir)
        if (not directory.exists()):
            raise Exception("DIRECTORY_NOT_FOUND")
        output = []
        files = [f for f in directory.rglob("*") if f.is_file()]
        for index in range(max(0, start), min(end, len(files))):
            file = files[index]
            if file.is_file():
                file_stats = file.stat()
                mimetype = mimetypes.guess_file_type(file)[0]
                if mimetype is None:
                    mimetype = "None"
                output.append(
                    {
                        "name": file.name,
                        "size": file_stats.st_size,
                        "modified": file_stats.st_mtime,
                        "path": str(file.relative_to(self.rootDir)),
                        "relPath": str(self.rootDir / file.relative_to(self.rootDir)),
                        "type": mimetype
                    }
                )
        return sorted(output, reverse=self.decending, key=lambda f: f[self.sortType].lower())

    def loadCurrentMedia(self, dir, start = 0, end = 100):
        directory = Path(dir)
        if (dir == "/"):
            directory = self.rootDir
        if (not directory.exists()):
            raise Exception("DIRECTORY_NOT_FOUND")
        output = []
        files = [*directory.iterdir()]
        print(directory)
        
        for index in range(max(0, int(start)), min(int(end), len(files))):
            file = files[index]
            file_stats = file.stat()
            mimetype = mimetypes.guess_file_type(file)[0]
            if mimetype is None:
                mimetype = "None"
                output.append(
                    {
                        "name": file.name,
                        "size": file_stats.st_size,
                        "modified": file_stats.st_mtime,
                        "path": str(file.relative_to(self.rootDir)),
                        "relPath": str(self.rootDir / file.relative_to(self.rootDir)),
                        "type": mimetype
                    }
                )
        return sorted(output, reverse=self.decending, key=lambda f: f[self.sortType].lower())

    def switchSortingSettings(self, by: str, decending: bool):
        by = by.lower()
        if by == "name" or by == "path":
            self.sortType = "path"
        elif by == "size":
            self.sortType = "size"
        elif by == "time":
            self.sortType = "modified"
        self.decending = decending

    def showSortingSettings(self):
        return {"sortType": self.sortType, "decending": self.decending}

    def getFileInfo(self, filename: str):
        filename = filename.removeprefix("/")
        file_path = self.rootDir / filename
        file_stats = file_path.stat()
        mimetype = mimetypes.guess_file_type(file_path)[0]
        print(mimetype)
        if mimetype is None:
            mimetype = "None"
        stats = {
            "name": file_path.name,
            "size": file_stats.st_size,
            "modified": file_stats.st_mtime,
            "path": str("/" + str(file_path.relative_to(self.rootDir))),
            "relPath": str(self.rootDir / file_path.relative_to(self.rootDir)),
            "type": mimetype,
        }
        return stats
