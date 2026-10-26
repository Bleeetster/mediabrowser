import { apiFormater } from "/api/apiFormater.js";

const LOAD = 100
const CURRENT_DIR_KEY = "currentDirectoryData"
const filesDiv = document.getElementsByClassName("files")[0];
const breadcrumbsNav = document.getElementsByClassName("breadcrumbs")[0]
const menuBtn = document.querySelector('.menu-btn')
const overlay = document.getElementsByClassName("sidebar-overlay")[0]
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

async function loadAllMedia(start, end) {
  const currentDirectory = getCurrentDirectory()
  const mediaDirectory = await api.loadMediaDir(currentDirectory, start, end)
  const MDjson = JSON.stringify(mediaDirectory)
  localStorage.setItem(CURRENT_DIR_KEY, MDjson)
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


async function renderEntries() {
  const mediaDirectory = JSON.parse(localStorage.getItem(CURRENT_DIR_KEY))
  let currentDirectory = getCurrentDirectory()
  if (currentDirectory === "/")
    currentDirectory = ""
  let entry
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
    const entryContainer = document.createElement("li")
    const entryElement = document.createElement("a")
    entryElement.className = "file"
    entryContainer.appendChild(entryElement)
    const path = entry.path
    if (entry.type === "directory") entryElement.addEventListener('click', () => { goTo(path) })
    else entryElement.href = "/player?watch=" + encodeURIComponent(path)

    const entryThumbnailDiv = document.createElement('div')
    entryThumbnailDiv.className = entry.type === "directory" ? "file__icon--folder" : "file__icon"
    const entryThumbnail = document.createElement('img')
    entryThumbnail.src = entry.thumbnail
    entryThumbnail.loading = "lazy"
    entryThumbnailDiv.append(entryThumbnail)

    const entryName = document.createElement("div")
    entryName.className = "file__name"
    entryName.textContent = entry.name
    entryName.title = entry.name

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

    entryElement.append(entryThumbnailDiv, entryName, entryMeta)
    filesDiv.append(entryContainer)
  }
}
function goTo(directory) {
  sessionStorage.setItem("currentDirectory", directory);
  refresh()
}

function getOffset() {
  return sessionStorage.getItem("offset") || 0
}
function setOffset(value) {
  sessionStorage.setItem("offset", value)
}

function refresh() {
  const offset = getOffset()
  filesDiv.querySelectorAll('img').forEach((elem) => {
    elem.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    elem.removeAttribute('src')
  })
  filesDiv.replaceChildren();
  loadAllMedia(offset, LOAD).then(renderEntries)
    .then(() => {
      const curMedia = sessionStorage.getItem("currentMedia")
      const curMediaCard = [...document.querySelectorAll('.file__name').values()].find(elem => elem.textContent === curMedia) || 0
      curMediaCard.scrollIntoView({ block: "center" })
    })
  renderBreadcrumbs();
}


document.addEventListener('DOMContentLoaded', async () => {
  menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('is-drawer-open')
  })
  overlay.addEventListener('click', () => {
    document.body.classList.remove('is-drawer-open');
  });
  await loadAllMedia()
  refresh()
})
