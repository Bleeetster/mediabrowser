import asyncio
import pathlib
import shutil
import subprocess
from functools import lru_cache


class thumbnailGenerator:
    def __init__(self, root: str):
        if not self.check_for_ffmpeg():
            raise shutil.Error("THERE_IS_NO_FFMPEG_IN_PATH")
        self.LONG_VIDEO_THRESHOLD = 600
        self.rootDir = pathlib.Path(root)
        self.base_dir = pathlib.Path(__file__).resolve().parent
        self.dest = self.base_dir / "thumbnail"
        self.dest.mkdir(exist_ok=True)

    @lru_cache(maxsize=1)
    def check_for_ffmpeg(self) -> bool:
        return (
            shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None
        )

    def get_duration(self, path: str):
        path = path.removeprefix("/")
        dest = self.dest

        cmd = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(self.rootDir / path),
        ]
        print("cmd dur", cmd)
        try:
            output = subprocess.run(
                cmd, check=True, capture_output=True, text=True, timeout=10
            )
            return float(output.stdout.strip())
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, ValueError):
            return None

    def create_thumbnail(self, path: str) -> str:
        # making directory for cache
        path = path.removeprefix("/")
        normalized_path = self.rootDir / path
        dest = self.dest
        thumbnailPath = dest / f"{pathlib.Path(path).name}_thumbnail.jpg"
        thumbnailPath = thumbnailPath.resolve()

        # making thumbnail
        if thumbnailPath.exists():
            return str(thumbnailPath)

        suffix = normalized_path.suffix.lower()

        if suffix == ".gif":
            thumbnailPath = dest / f"{pathlib.Path(path).name}_thumbnail.gif"

            vf = (
                "fps=10,"
                "scale=320:180:flags=lanczos,"
                "split[s0][s1];"
                "[s0]palettegen=stats_mode=diff[p];"
                "[s1][p]paletteuse=dither=bayer:bayer_scale=5"
            )
            cmd = [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(normalized_path),
                "-vf",
                vf,
                "-loop",
                "0",
                str(thumbnailPath),
            ]
            subprocess.run(cmd, check=True, capture_output=True, timeout=60)
        else:
            duration = self.get_duration(path)
            print("duration", duration)
            if duration is None or duration < self.LONG_VIDEO_THRESHOLD:
                vf = "thumbnail,scale=320:180:force_original_aspect_ratio=increase,crop=320:180"
                ss_args = []
            else:
                ts = 60
                vf = "scale=320:180:force_original_aspect_ratio=increase,crop=320:180"
                ss_args = ["-ss", f"{ts:.3f}"]
            cmd = [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                *ss_args,
                "-i",
                str(normalized_path),
                "-frames:v",
                "1",
                "-vf",
                vf,
                "-q:v",
                "3",
                str(thumbnailPath),
            ]
            print("cmd", cmd)

            a = subprocess.run(cmd, check=True, capture_output=True, timeout=60)
            print("a", a)
            print("thumbnailPath", thumbnailPath)
        return str(thumbnailPath)

    async def clear_cache_loop(self, interval):
        while True:
            await asyncio.sleep(interval)
            await asyncio.to_thread(self.clear_cache)

    def clear_cache(self):
        for thumbnail in self.dest.rglob("*"):
            print(f"{thumbnail} removed")
            thumbnail.unlink()
