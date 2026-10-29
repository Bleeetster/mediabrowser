export class apiFormater {

  async loadAllMedia(media, start = 0, end = 100) {
    try {
      const res = await fetch(`/api/loadMedia?medianame=${media}&start=${start}&end=${end}`)
      return await this.loadMedia(res, start, end)
    } catch (error) {
      console.error(error)
      throw Error("COULD_NOT_FETCH_FROM_BACKEND")
    }
  }
  async loadMediaDir(directory, start = 0, end = 100) {
    try {
      const res = await fetch(`/api/loadMedia/navigate?directory=${encodeURIComponent(directory)}&start=${start}&end=${end}`)
      return await this.loadMedia(res, start, end)
    } catch (error) {
      console.error(error)
      throw Error("COULD_NOT_FETCH_FROM_BACKEND")
    }
  }

  async loadMedia(response, start, end) {
    const resBody = await response.json()
    const files = resBody.files
    const total = resBody.total
    return {
      files: files,
      total: total,
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
