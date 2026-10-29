from pathlib import Path
import mimetypes

class fileSystemControler:
    def __init__(self, rootDir: str) -> None:
        root_directory: Path = Path(rootDir)
        if not root_directory.exists():
            raise Exception("DIRECTORY_NOT_FOUND")
        self.rootDir: Path = root_directory
        self.sortType = "path"
        self.decending = False

    def loadAllMedia(self, media, rightoffset = 0, leftoffset = 100):
        directory = self.rootDir
        if (not directory.exists()):
            raise Exception("DIRECTORY_NOT_FOUND")
        media_list = []
        for file in directory.rglob("*"):
            if file.is_file():
                file_stats = file.stat()
                mimetype = mimetypes.guess_file_type(file)[0]
                if mimetype is None:
                    mimetype = "None"
                path = str(file.relative_to(self.rootDir))
                media_list.append(
                    {
                        "name": file.name,
                        "size": file_stats.st_size,
                        "modified": file_stats.st_mtime,
                        "path": path,
                        "relPath": str(self.rootDir / file.relative_to(self.rootDir)),
                        "type": mimetype
                    }
                )
        output = sorted(media_list, reverse=self.decending, key=lambda f: f[self.sortType].lower())
        total = len(media_list)
        leftoffset_ = 0
        rightoffset_ = 0
        for index in range(total):
            file = output[index];
            print(file["path"], media)
            if file["path"] == media:
                rightoffset_ = index - abs(int(rightoffset));
                leftoffset_ = index + int(leftoffset)
                break
        countFrom = max(rightoffset_, 0);
        countTo = min(leftoffset_, len(media_list))
        return total, output[countFrom:countTo]

    def loadCurrentMedia(self, dir, start = 0, end = 100):
        if dir == "/":
            directory = self.rootDir
        else:
            directory = self.rootDir / dir
        print(self.rootDir, dir, start, end, directory)
        if (not directory.exists()):
            raise Exception("DIRECTORY_NOT_FOUND")
        output = []
        for file in directory.iterdir():
            print(file)
            file_stats = file.stat()
            mimetype = mimetypes.guess_file_type(file)[0]

            if mimetype is None:
                mimetype = "None"
            path = str(file.relative_to(self.rootDir))
            if file.is_dir():
                path += "/"
            output.append(
                {
                    "name": file.name,
                    "size": file_stats.st_size,
                    "modified": file_stats.st_mtime,
                    "path": path,
                    "relPath": str(self.rootDir / file.relative_to(self.rootDir)),
                    "type": mimetype
                }
            )
        countFrom = max(int(start), 0);
        countTo = min(int(end), len(output))
        total = len(output)
        return total, sorted(output, reverse=self.decending, key=lambda f: f[self.sortType].lower())[countFrom:countTo]

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
