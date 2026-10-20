import { apiFormater } from "/api/apiFormater.js";

const filesDiv = document.getElementsByClassName("files")[0];
const breadcrumbsNav = document.getElementsByClassName("breadcrumbs")[0]
const api = new apiFormater()

function renderBreadcrumbs() {
  breadcrumbsNav.replaceChildren()
  const currentDir = getCurrentDirectory();
  let currentDirParts = currentDir.split("/")
  if (currentDir === '/') currentDirParts.pop()
  currentDirParts.forEach((part, partIndex) => {
    const crumbElement = document.createElement('span');
    crumbElement.className = "breadCrumbs__item"
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
  return sessionStorage.getItem("CurrentDirectory") || "/"
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

async function makeEntriesFromCurrentDir() {
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
    const fileinfo = await api.getMediaInfo(file)
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
      console.log(fileinfo)
      let size = fileinfo.size
      const ending = ["B", "kB", "MB", "GB"]
      let type = 0
      while (size > 1024 & type < 5) {
        size /= 1024
        type += 1
      }
      size = String(size).slice(0, 6).padEnd(6)
      size = `${size} ${ending[type]}`
      console.log(size)
      const f = {
        name: partsOfName[1],
        path: currentDir + partsOfName[1],
        type: "media",
        meta: {
          size: size, // add size from backend
          thumbnail: "/api/thumbnail?file=" + encodeURIComponent(fileinfo.path) // add thumbnail from backend
        }
      }
      fileMap.set(f.name, f)
    }
  }
  return new Array(...dirMap.values(), ...fileMap.values())
}

async function renderEntries() {
  filesDiv.replaceChildren();
  const entries = await makeEntriesFromCurrentDir();
  for (let entry of entries) {
    const entryElement = document.createElement("a");
    entryElement.className = "file"
    const entryIconElement = document.createElement("div")
    entryIconElement.className = "file__icon"
    const thumbnail = document.createElement('img');
    thumbnail.src = entry.meta.thumbnail
    entryIconElement.appendChild(thumbnail)
    entryElement.appendChild(entryIconElement)

    const entryNameElement = document.createElement("div")
    entryNameElement.className = "file__name"
    entryNameElement.textContent = entry.name
    entryElement.appendChild(entryNameElement)

    const entryMetaElement = document.createElement("div")
    entryMetaElement.className = "file__meta"
    if (entry.meta.size) {
      // const sizes = ["", "KB", "MB", "GB"]
      // const sizeText = entry.meta.size / 1024
      entryMetaElement.textContent = "Size: " + entry.meta.size
    }
    else {
      entryMetaElement.textContent = entry.meta.amountOfFiles + " files"
    }
    entryElement.appendChild(entryMetaElement)

    filesDiv.appendChild(entryElement)
    if (entry.type === "directory") entryElement.addEventListener("click", () => { goTo(entry.path) })
    else (
      entryElement.href = "player?watch=" + encodeURIComponent(entry.path)
    )
  }
}

function goTo(directory) {
  sessionStorage.setItem("CurrentDirectory", directory);
  refresh()
}

async function refresh() {
  await renderEntries();
  renderBreadcrumbs();
}


document.addEventListener('DOMContentLoaded', async () => {
  await loadAllMedia()
  refresh()
})
