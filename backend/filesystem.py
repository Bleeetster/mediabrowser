from pathlib import Path
import mimetypes


class fileSystemControler:
    def __init__(self, rootDir: str) -> None:
        root_directory: Path = Path(rootDir)
        if not root_directory.exists():
            raise Exception("DIRECTORY_NOT_FOUND")
        self.rootDir: Path = root_directory

    def loadAllMedia(self, dir):
        directory = Path(dir)
        if (not directory.exists()):
            raise Exception("DIRECTORY_NOT_FOUND")
        output = []
        for file in directory.rglob("*"):
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
        return sorted(output, key=lambda f: f["path"].lower())


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
