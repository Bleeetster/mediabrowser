export class apiFormater {
  // TODO: media endpoint
  // media info endpoint
  // load all media endpoint
  // optional:
  // thumbnails endpoint

  async loadAllMedia() {
    try {
      const res = await fetch("/api/loadMedia")
      const resBody = await res.json()
      const output = new Array();
      resBody.files.forEach(element => {
        output.push("/" + element)
      });
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
