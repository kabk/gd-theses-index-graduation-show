import theses from "./theses-data.js";
let overviewScaleFactor = 1;
let readScaleFactor = 1;
const thesisWidth = 1440;
const thesisHeight = 960;
const gridColumnsAmount = 5;
const gridRowsAmount = Math.ceil(theses.theses.length / gridColumnsAmount);
const gridContainerPadding = window.innerWidth / 100;
const gridContainerWidth = thesisWidth * gridColumnsAmount;
const gridContainer = document.getElementById("iframe-grid");
const closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 256 256"><polygon points="256,32 224,0 128,96 32,0 0,32 96,128 0,224 32,256 128,160 224,256 256,224 160,128 "/></svg>'
let inactiveFocusCountdown = null;

layoutGrid();

window.addEventListener("resize", layoutGrid);
window.addEventListener("keydown", keyBindings);

document.body.addEventListener("mousemove", moveCursor);

function layoutGrid () {
    overviewScaleFactor = calculateOverviewScaleFactor(window.innerWidth, gridContainerWidth, gridColumnsAmount, gridContainerPadding);
    readScaleFactor = calculateReadScaleFactor(window.innerHeight, thesisHeight);
    setCSSVariables(gridContainer, gridColumnsAmount, overviewScaleFactor, readScaleFactor, gridContainerPadding);

    if (!gridContainer.hasChildNodes()) {
        appendIFrames(theses.theses, readScaleFactor, gridColumnsAmount, gridRowsAmount, gridContainer, gridContainerPadding, overviewScaleFactor, window.innerWidth, window.innerHeight, thesisWidth, thesisHeight);
    } else {
        updateIFramesCoordinates(".thesis", readScaleFactor, gridColumnsAmount, gridRowsAmount, overviewScaleFactor, window.innerWidth, window.innerHeight, thesisWidth, thesisHeight, gridContainerPadding);
    }
}

function setCSSVariables (target, columnsAmount, zoomedOutScaleFactor, zoomedInFactor, padding) {
    target.setAttribute("style", `--grid-columns: ${columnsAmount}; --zoom-out-scale: ${zoomedOutScaleFactor}; --zoom-in-scale: ${zoomedInFactor}; --grid-padding: ${padding}px;`);
}

function calculateOverviewScaleFactor (viewportWidth, originalWidth, columnsAmount, padding) {
    return 1 / (originalWidth / (viewportWidth - (columnsAmount + 1) * padding));
}

function calculateReadScaleFactor (viewportHeight, originalHeight) {
    return (viewportHeight / originalHeight) * .8;
}

function appendIFrames (iframeElements, readingScale, columnAmount, rowsAmount, bucketElement, containerPadding, containerScale, viewportWidth, viewportHeight, thesisWidth, thesisHeight) {
    let yIndex = 0;

    for(let i = 0; i < iframeElements.length; i++) {
        const xIndex = i % columnAmount;
        if (xIndex === 0 && i > columnAmount - 1) yIndex++;

        const xOffset = calculateXOffset(readingScale, xIndex, columnAmount, containerScale, viewportWidth, thesisWidth, containerPadding);
        const yOffset = calculateYOffset(readingScale, yIndex, rowsAmount, containerScale, viewportHeight, thesisHeight, containerPadding);

        const thesisIFrame = createThesisIFrame(iframeElements[i].url);
        const thesisCloseButton = createCloseButton();
        const thesisWrapper = createThesisWrapper(iframeElements[i].author, iframeElements[i].title, iframeElements[i].description, iframeElements[i].url, xOffset, xIndex, yOffset, yIndex);

        thesisWrapper.append(thesisIFrame);

        thesisCloseButton.addEventListener("click", unfocusTheses);
        thesisWrapper.append(thesisCloseButton);

        thesisWrapper.addEventListener("click", focusOnThesis);
        thesisWrapper.addEventListener("mouseenter", updateCursor);
        thesisWrapper.addEventListener("mouseleave", updateCursor);

        bucketElement.append(thesisWrapper);
        bucketElement.addEventListener("mouseleave", updateCursor);
    }
}

function calculateXOffset (readingScale, index, columnsAmount, containerScale, viewportX, offsetElementX, containerPadding) {
    const inverseScaleFactor = 1 / containerScale;
    const scaledPaddingSize = (containerPadding * inverseScaleFactor) * readingScale;
    const centerPadding = (innerWidth - (offsetElementX * readingScale)) / 2;

    const centerXOffsetPixel = centerPadding - scaledPaddingSize;
    const centerXOffsetPercentage = (((centerXOffsetPixel / innerWidth) * 100) * containerScale) / readingScale;

    return ((index * (100 / columnsAmount)) - centerXOffsetPercentage) * -1;
}

function calculateYOffset (readingScale, index, rowsAmount, containerScale, viewportY, offsetElementY, containerPadding) {
    const inverseScaleFactor = 1 / containerScale;
    const scaledPaddingSize = (containerPadding * inverseScaleFactor) * readingScale;
    const centerPadding = (innerHeight - (offsetElementY * readingScale)) / 2;

    const centerYOffsetPixel = centerPadding - scaledPaddingSize;
    const centerYOffsetPercentage = (((centerYOffsetPixel / innerHeight) * 100) * containerScale) / readingScale;

    return ((index * (100 / rowsAmount)) - centerYOffsetPercentage) * -1;
}

function createThesisIFrame (url) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", url);
    return iframe;
}

function createThesisWrapper (author, title, description, url, xOffset, xIndex, yOffset, yIndex) {
    const wrapper = document.createElement("div");
    wrapper.innerText = "Loading thesis, please wait…";
    wrapper.classList.add("thesis");
    wrapper.setAttribute("data-author", author);
    wrapper.setAttribute("data-title", title);
    wrapper.setAttribute("data-description", description);
    wrapper.setAttribute("data-url", url);
    wrapper.setAttribute("data-x-pos", xOffset);
    wrapper.setAttribute("data-x-index", xIndex);
    wrapper.setAttribute("data-y-pos", yOffset);
    wrapper.setAttribute("data-y-index", yIndex);
    return wrapper;
}

function createCloseButton () {
    const button = document.createElement("button");
    button.innerHTML = closeIcon;
    button.classList.add("deactivate-thesis");
    return button;
}

function updateIFramesCoordinates (iframeSelector, readingScale, columnAmount, rowsAmount, containerScale, viewportWidth, viewportHeight, thesisWidth, thesisHeight, containerPadding) {
    const iframes = document.querySelectorAll(iframeSelector);
    iframes.forEach(iframe => {
        const xOffset = calculateXOffset(readingScale, iframe.getAttribute("data-x-index"), columnAmount, containerScale, viewportWidth, thesisWidth, containerPadding);
        const yOffset = calculateYOffset(readingScale, iframe.getAttribute("data-y-index"), rowsAmount, containerScale, viewportHeight, thesisHeight, containerPadding);

        iframe.setAttribute("data-x-pos", xOffset);
        iframe.setAttribute("data-y-pos", yOffset);
    });
}

function focusOnThesis (event) {
    if (event.target.classList.contains("deactivate-thesis")) {
        return;
    }

    const prevTheses = document.querySelectorAll(".active");

    prevTheses.forEach((prevThesis) => {
        prevThesis.classList.remove("active");
        prevThesis.removeEventListener("mouseleave", showCursor);
        prevThesis.removeEventListener("mouseenter", hideCursor);
        reloadIFrame(prevThesis);
    });

    const thesis = event.currentTarget;
    thesis.parentElement.style.cssText += `--left-offset: ${thesis.getAttribute("data-x-pos")}%;`;
    thesis.parentElement.style.cssText += `--top-offset: ${thesis.getAttribute("data-y-pos")}%;`;
    thesis.parentElement.classList.add("zoom-in")
    hideCursor();
    thesis.classList.add("active");
    thesis.addEventListener("mouseleave", showCursor);
    thesis.addEventListener("mouseenter", hideCursor);

    if (inactiveFocusCountdown) {
        clearTimeout(inactiveFocusCountdown);
    }
}

function unfocusTheses (event) {
    const reloadThis = document.querySelector(".active");

    inactiveFocusCountdown = setTimeout(() => {
        reloadIFrame(reloadThis);
    }, 60000);

    document.querySelectorAll(".active, .zoom-in").forEach((element) => {
        element.classList.remove("active");
        element.classList.remove("zoom-in");
        element.removeEventListener("mouseleave", showCursor);
        element.removeEventListener("mouseenter", hideCursor);
        showCursor();
    });
}

function reloadIFrame (element) {
    element.querySelector("iframe").src = element.querySelector("iframe").src;
}

function keyBindings (event) {
    if (event.key === "f") {
        document.body.requestFullscreen();
    }

    if (event.key === "c") {
        unfocusTheses();
    }
}

function moveCursor (event) {
    const cursor = document.getElementById("cursor");
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
}

function updateCursor (event) {
    const cursorText = document.querySelector("#cursor span");

    if (event.type === "mouseleave") {
        cursorText.textContent = "";
        return
    }

    const hoveredThesis = event.currentTarget;
    const author = hoveredThesis.getAttribute("data-author");
    const title = hoveredThesis.getAttribute("data-title");
    cursorText.textContent = author;
}

function hideCursor () {
    const cursor = document.getElementById("cursor");
    cursor.style.display = "none";
}

function showCursor () {
    const cursor = document.getElementById("cursor");
    cursor.removeAttribute("style");
}
