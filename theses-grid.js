import theses from "./theses-data.js";

const gridContainer = document.getElementById("iframe-grid");
const gridColumnsNum = 5;
const gridColumnsWidth = 1440;
const gridContainerWidth = gridColumnsNum * gridColumnsWidth;
const gridContainerPadding = 4;
let scaleFactor = 1;

layoutGrid();

window.addEventListener("resize", layoutGrid);
window.addEventListener("keydown", fullscreenView);

function layoutGrid () {
    scaleFactor = 1 / (gridContainerWidth / (window.innerWidth - (gridColumnsNum + 1) * gridContainerPadding));

    // gridContainer.style.transform = `scale(${scaleFactor})`;
    gridContainer.setAttribute("style", `--grid-columns: ${gridColumnsNum}; --scale-factor: ${scaleFactor};`);

    if (!gridContainer.hasChildNodes()) {
        appendTheses();
    }
}

function appendTheses () {
    theses.theses.forEach(thesis => {
        const thesisIframe = document.createElement("iframe");
        const thesisWrapper = document.createElement("div");
        thesisIframe.setAttribute("src", thesis.url);
        thesisWrapper.setAttribute("data-author", thesis.author);
        thesisWrapper.setAttribute("data-title", thesis.title);
        thesisWrapper.setAttribute("data-description", thesis.description);
        thesisWrapper.setAttribute("data-url", thesis.url);
        thesisWrapper.classList.add("thesis");
        thesisWrapper.addEventListener("click", toggleThesis);
        thesisWrapper.innerText = "Loading thesis, please wait…";

        thesisWrapper.append(thesisIframe);
        gridContainer.append(thesisWrapper);
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
    thesis.classList.add("active");
}

function fullscreenView (event) {
    if (event.key === "f") {
        document.body.requestFullscreen();
    }
}
