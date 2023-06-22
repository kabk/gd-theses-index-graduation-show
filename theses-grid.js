import theses from "./theses-data.js";
let overviewScaleFactor    = 1;
const readScaleFactor      = 0.9;
const thesisWidth          = 1440;
const thesisHeight         = 960;
const gridColumnsAmount    = 5;
const gridRowsAmount       = Math.ceil(theses.theses.length / gridColumnsAmount);
const gridContainerPadding = 4;
const gridContainerWidth   = thesisWidth * gridColumnsAmount;
const gridContainer   = document.getElementById("iframe-grid");

layoutGrid();

window.addEventListener("resize", layoutGrid);
window.addEventListener("keydown", keyBindings);

function layoutGrid () {
    overviewScaleFactor = calculateScaleFactor(window.innerWidth, gridContainerWidth, gridColumnsAmount, gridContainerPadding);
    setCSSVariables(gridContainer, gridColumnsAmount, overviewScaleFactor, gridContainerPadding);

    if (!gridContainer.hasChildNodes()) {
        appendIFrames(theses.theses, readScaleFactor, gridColumnsAmount, gridRowsAmount, gridContainer, gridContainerPadding, overviewScaleFactor, window.innerWidth, window.innerHeight, thesisWidth, thesisHeight);
    } else {
        updateIFramesCoordinates(".thesis", readScaleFactor, gridColumnsAmount, gridRowsAmount, overviewScaleFactor, window.innerWidth, window.innerHeight, thesisWidth, thesisHeight, gridContainerPadding);
    }
}

function setCSSVariables (target, columnsAmount, scaleFactor, padding) {
    target.setAttribute("style", `--grid-columns: ${columnsAmount}; --scale-factor: ${scaleFactor}; --grid-padding: ${padding}px;`);
}

function calculateScaleFactor (viewportWidth, originalWidth, columnsAmount, padding) {
    return 1 / (originalWidth / (viewportWidth - (columnsAmount + 1) * padding));
}

function appendIFrames (iframeElements, readingScale, columnAmount, rowsAmount, bucketElement, containerPadding, containerScale, viewportWidth, viewportHeight, thesisWidth, thesisHeight) {
    let yIndex = 0;

    for(let i = 0; i < iframeElements.length; i++) {
        const xIndex = i % columnAmount;
        if (xIndex === 0 && i > columnAmount - 1) yIndex++;

        const xOffset = calculateXOffset(readingScale, xIndex, columnAmount, containerScale, viewportWidth, thesisWidth, containerPadding);
        const yOffset = calculateYOffset(readingScale, yIndex, rowsAmount, containerScale, viewportHeight, thesisHeight, containerPadding);

        const thesisIFrame = createThesisIFrame(iframeElements[i].url);
        const thesisWrapper = createThesisWrapper(iframeElements[i].author, iframeElements[i].title, iframeElements[i].description, iframeElements[i].url, xOffset, xIndex, yOffset, yIndex);

        thesisWrapper.addEventListener("click", toggleThesis);
        // thesisWrapper.addEventListener("mouseenter", updateCursorContent);
        // thesisWrapper.addEventListener("mouseleave", updateCursorContent);

        thesisWrapper.append(thesisIFrame);
        bucketElement.append(thesisWrapper);
        // gridContainer.addEventListener("")
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

    const centerYOffsetPixel = centerPadding - scaledPaddingSize * 3;
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

function updateIFramesCoordinates (iframeSelector, readingScale, columnAmount, rowsAmount, containerScale, viewportWidth, viewportHeight, thesisWidth, thesisHeight, containerPadding) {
    const iframes = document.querySelectorAll(iframeSelector);
    iframes.forEach(iframe => {
        const xOffset = calculateXOffset(readingScale, iframe.getAttribute("data-x-index"), columnAmount, containerScale, viewportWidth, thesisWidth, containerPadding);
        const yOffset = calculateYOffset(readingScale, iframe.getAttribute("data-y-index"), rowsAmount, containerScale, viewportHeight, thesisHeight, containerPadding);

        iframe.setAttribute("data-x-pos", xOffset);
        iframe.setAttribute("data-y-pos", yOffset);
    });
}

function zoomThesis (event) {
    event.currentTarget.style.transform = `scale(${1 / scaleFactor})`;
}

function toggleThesis (event) {
    const prevTheses = document.querySelectorAll(".active");

    prevTheses.forEach((prevThesis) => {
        prevThesis.classList.remove("active");
    });

    const thesis = event.currentTarget;
    thesis.parentElement.style.cssText += `--left-offset: ${thesis.getAttribute("data-x-pos")}%;`;
    thesis.parentElement.style.cssText += `--top-offset: ${thesis.getAttribute("data-y-pos")}%;`;
    thesis.classList.add("active");
}

function keyBindings (event) {
    if (event.key === "f") {
        document.body.requestFullscreen();
    }

    if (event.key === "b") {
        document.querySelectorAll(".active").forEach((element) => {
            element.classList.remove("active");
        });
    }
}
