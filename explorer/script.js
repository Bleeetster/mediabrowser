import { apiFormater } from "/api/apiFormater.js";

const filesDiv = document.getElementsByClassName("files")[0];
const breadcrumbsNav = document.getElementsByClassName("breadcrumbs")[0]
const api = new apiFormater()

function renderBreadcrumbs() {
  breadcrumbsNav.replaceChildren()
  const currentDir = getCurrentDirectory();
  let currentDirParts = currentDir.split("/")
  if (currentDir === '/') currentDirParts.pop()
  else
    currentDirParts.unshift('')
  currentDirParts.forEach((part, partIndex) => {
    const crumbElement = document.createElement('span');
    crumbElement.className = "breadcrumbs__item"
    crumbElement.textContent = part
    if (part === "") crumbElement.textContent = "Home"
    const separator = document.createElement("span")
    separator.textContent = "/"
    separator.className = "breadcrumbs__sep"
    breadcrumbsNav.appendChild(crumbElement)

    crumbElement.addEventListener('click', () => {
      let directory = currentDirParts.slice(0, currentDirParts.indexOf(part) + 1)
      console.log(directory.join('/') || '/')
      goTo(directory.join('/') || '/')
    })

    if (partIndex === currentDirParts.length - 1) {
      crumbElement.className += " breadcrumbs__item--current"
      const amountOfFiles = filesDiv.getElementsByClassName("file").length
      const toolbar = document.getElementsByClassName("toolbar__title")[0];
      const toolbarCount = toolbar.getElementsByClassName("toolbar__count")[0];
      toolbar.textContent = crumbElement.textContent
      toolbarCount.textContent = amountOfFiles + " files"
      toolbar.append(toolbarCount)
    } else {
      breadcrumbsNav.appendChild(separator)
    }
  })
}

async function loadAllMedia() {
  const mediaDirectory = await api.loadAllMedia()
  const MDjson = JSON.stringify(mediaDirectory)
  sessionStorage.setItem("mediaDirectory", MDjson)
}

function getCurrentDirectory() {
  return sessionStorage.getItem("currentDirectory") || "/"
}

const mockEntry2 = {
  name: "/mockfile",
  meta: {
    amountOfFiles: 14
  }
}

const mockEntry1 = {
  name: "/mockfile/mockfile2.mp4",
  meta: {
    size: 12023000,
    thumbnail: "photo"
  }
}

function makeEntriesFromCurrentDir() {
  const mediaDirectoryRaw = sessionStorage.getItem("mediaDirectory")
  const mediaDirectory = JSON.parse(mediaDirectoryRaw)
  console.log(mediaDirectory)
  // const mediaDirectory = new Array("/media/file.mp4", "/file.mp4", "/media/another/wowSoMuchMedia/supersecretphoto.jpeg", "/file2.mp4", "/photo.jpeg")
  const currentDirectory = getCurrentDirectory()
  const filesFromCurrentDirectory = mediaDirectory.filter(file => file.startsWith(currentDirectory))
  const dirMap = new Map()
  const fileMap = new Map()
  let relativeFile
  let currentDir = currentDirectory
  for (const file of filesFromCurrentDirectory) {
    if (currentDirectory != "/") {
      relativeFile = file.slice(currentDirectory.length)
      currentDir = currentDirectory + "/"
    }
    else
      relativeFile = file
    const partsOfName = relativeFile.split("/")
    if (relativeFile.includes("/", 1)) { // removing first /
      const dir = {
        name: partsOfName[1],
        path: currentDir + partsOfName[1],
        type: "directory",
        meta: {
          amountOfFiles: filesFromCurrentDirectory.filter(f => f.includes(file)).length,
          thumbnail: "./favicon.ico"
        }
      }
      dirMap.set(dir.name, dir)
    }
    else {
      const f = {
        name: partsOfName[1],
        path: currentDir + partsOfName[1],
        type: "media",
        meta: {
          size: 0, // add size from backend
          thumbnail: "/api/thumbnail?file="
        }
      }
      fileMap.set(f.name, f)
    }
  }
  return new Array(...dirMap.values(), ...fileMap.values())
}

async function renderEntries() {
  const mediaDirectory = JSON.parse(sessionStorage.getItem("mediaDirectory"))
  let currentDirectory = getCurrentDirectory()
  if (currentDirectory === "/")
    currentDirectory = ""
  let entry
  filesDiv.replaceChildren();
  const dirSet = new Set()
  for (const media of mediaDirectory) {
    if (!media.path.includes(currentDirectory)) continue
    let file = media.path.slice(currentDirectory.length)
    if (file[0] === "/")
      file = file.slice(1)
    if (file.includes("/")) {
      // it is a directory
      const dirname = file.slice(0, file.indexOf("/"))
      if (dirSet.has(dirname)) continue
      dirSet.add(dirname)
      let path
      if (currentDirectory)
        path = currentDirectory + "/" + dirname
      else
        path = dirname
      const containerSet = new Set()
      mediaDirectory.forEach((elem) => {
        if (!elem.path.startsWith(path)) return;
        let elemName = elem.path.slice(path.length)
        if (elemName[0] === "/") elemName = elemName.slice(1)
        if (elemName.includes("/"))
          containerSet.add(elemName.slice(0, elemName.indexOf("/")))
        else
          containerSet.add(elemName)

      })
      entry = {
        name: dirname,
        type: "directory",
        path: path,
        amountOfFiles: containerSet.size,
        thumbnail: "./favicon.ico"
      }
    }
    else {
      // it is a media file
      entry = {
        name: media.name,
        type: "media",
        path: media.path,
        size: media.size,
        thumbnail: "/api/thumbnail?file=" + encodeURIComponent(media.path)
      }
    }
    const entryElement = document.createElement("a")
    entryElement.className = "file"
    const path = entry.path
    if (entry.type === "directory") entryElement.addEventListener('click', () => { goTo(path) })
    else entryElement.href = "/player?watch=" + encodeURIComponent(path)

    const entryThumbnail = document.createElement('img')
    entryThumbnail.src = entry.thumbnail
    entryThumbnail.loading = "lazy"
    entryThumbnail.className = entry.type === "directory" ? "file__icon--folder" : "file__icon"

    const entryName = document.createElement("div")
    entryName.className = "file__name"
    entryName.textContent = entry.name

    const entryMeta = document.createElement("div")
    entryMeta.className = "file__meta"
    if (entry.type === "media") {
      let size = entry.size
      let types = ["B", "kB", "MB", "GB"]
      let type = 0
      while (size > 1024 & type < types.length - 1) {
        size /= 1024
        type += 1
      }
      entryMeta.textContent = "Size: " + String(size).slice(0, 6).padEnd(6) + " " + types[type]
    }
    else {
      entryMeta.textContent = entry.amountOfFiles + " elements"
    }

    entryElement.append(entryThumbnail, entryName, entryMeta)
    filesDiv.append(entryElement)
  }
}
function goTo(directory) {
  sessionStorage.setItem("currentDirectory", directory);
  refresh()
}

function refresh() {
  renderEntries();
  renderBreadcrumbs();
}


document.addEventListener('DOMContentLoaded', async () => {
  await loadAllMedia()
  refresh()
})
