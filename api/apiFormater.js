export class apiFormater {
  // TODO: media endpoint
  // media info endpoint
  // load all media endpoint
  // optional:
  // thumbnails endpoint

  async loadAllMedia(start = 0, end = 100) {
    try {
      const res = await fetch(`/api/loadMedia?start=${start}&end=${end}`)
      const resBody = await res.json()
      const output = new Array(...resBody.files);
      return output
    } catch (error) {
      console.error(error)
      throw Error("COULD_NOT_FETCH_FROM_BACKEND")
    }
  }
  async loadMediaDir(directory, start = 0, end = 100) {
    try {
      const res = await fetch(`/api/loadMedia/navigate?directory=${encodeURIComponent(directory)}&start=${start}&end=${end}`)
      const resBody = await res.json()
      const output = new Array(...resBody.files)
      return output
    } catch (error) {
      console.error(error)
      throw Error("COULD_NOT_FETCH_FROM_BACKEND")
    }
  }
  async getMediaInfo(path) {
    const url = '/api/mediainfo?file=' + encodeURIComponent(path)
    try {
      const res = await fetch(url)
      const stats = await res.json()
      const fileStats = {
        name: stats.name,
        size: stats.size,
        modified: stats.modified,
        path: stats.path,
        type: stats.type
      }
      return fileStats
    } catch (error) {
      console.error(error)
      throw Error("COULD_NOT_FETCH_FROM_BACKEND")
    }
  }
}
