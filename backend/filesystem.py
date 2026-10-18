
from pathlib import Path



class fileSystemControler:
    def __init__(self, rootDir : str) -> None:
        root_directory: Path = Path(rootDir)
        if not root_directory.exists():
            raise Exception("DIRECTORY_NOT_FOUND")
        self.rootDir: Path  = root_directory
        pass
    def loadAllMedia(self):
        return [
            str(file.relative_to(self.rootDir))
            for file in self.rootDir.rglob("*")
            if file.is_file()
        ]
    def getFileInfo(self, filename: str):
        file_path = self.rootDir / filename
        file_stats = file_path.stat()
        stats = {
            "Name": file_path.name,
            "Size": file_stats.st_size,
            "Modified": file_stats.st_mtime,
            "Path": str("/"+str(file_path.relative_to(self.rootDir)))
        }
        return stats
