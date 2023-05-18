const loaderContainer = document.querySelector('.loader-container');
window.addEventListener('load', () => {
    setTimeout(() => {
        loaderContainer.parentElement.removeChild(loaderContainer);
    }, 2500);
});
let input = document.getElementById('inputImageSelector');
let img = document.getElementById('mainPic');
let defaultSource = img.src;
let canvas = document.getElementById('canvasImage');
let ctx = canvas.getContext('2d');
let undoArr, redoArr;

function changeImage() {
    let imageFileName = document.getElementById('inputImageSelector').value;
    document.getElementById('inputImageSelector').value = imageFileName;
    let out = "images/" + imageFileName + ".jpg";
    document.getElementById('mainPic').src = out;
    input.value = "";
}

const copyArray = () => ctx.getImageData(0, 0, 700, 400);
const undo = () => ctx.putImageData(undoArr, 0, 0);
const redo = () => ctx.putImageData(redoArr, 0, 0);
const resetAll = () => img.src = defaultSource;

let kernel = [];

img.onload = function () {
    ctx.drawImage(img, 0, 0, 700, 400);
    let imgData = ctx.getImageData(0, 0, 700, 400);

    function pretvorba(imgData) {
        const arr2D = new Array(401);
        let t = 0;
        for (let i = 0; i < 401; i++) {
            arr2D[i] = new Array(700);
            for (let j = 0; j < 700; j++) {
                arr2D[i][j] = Array.from({
                    length: 4
                }, () => imgData.data[t++]);
            }
        }
        return arr2D;
    }

    function sumAllPixelValues(i, j, kopija, channel, kernel) {
        let sum = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if ((i + x) < 401 && (j + y) < 700)
                    sum += parseInt(kopija[i + x][j + y][channel], 10) * kernel[x + 1][y + 1];
            }
        }
        return sum;
    };

    function boxFilter() {
        kernel.push([1, 1, 1]);
        kernel.push([1, 1, 1]);
        kernel.push([1, 1, 1]);
        ctx.putImageData(imgData, 0, 0);
        undoArr = copyArray();
        let kopija = mojArr;
        let t = 0;

        for (let i = 1; i < 401; i++) {
            for (let j = 1; j < 700; j++) {
                for (let channel = 0; channel < 3; channel++) {
                    let average = sumAllPixelValues(i, j, kopija, channel, kernel) / 9;
                    imgData.data[t] = (average > 255) ? 255 : average;
                    if (channel != 2) t++;
                }
                t += 2;
            }
            t += 4;
        }
        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
        kernel = [];
    }

    function laplaceovOperator() {
        kernel = [
            [0, 1, 0],
            [1, -4, 1],
            [0, 1, 0]
        ];
        ctx.putImageData(imgData, 0, 0);
        undoArr = copyArray();
        let kopija = mojArr;
        let t = 0;

        for (let i = 1; i < 401; i++) {
            for (let j = 1; j < 700; j++) {
                for (let channel = 0; channel < 3; channel++) {
                    let average = sumAllPixelValues(i, j, kopija, channel, kernel) / 9;
                    imgData.data[t] = Math.max(0, Math.min(255, average));
                    if (channel !== 2) t++;
                }
                t += 2;
            }
            t += 4;
        }

        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
        kernel = [];
    }

    function xTopSobel() {
        kernel = [
            [-1, 0, 1],
            [-2, -0, 2],
            [-1, 0, 1]
        ];
        ctx.putImageData(imgData, 0, 0);
        undoArr = copyArray();
        let kopija = mojArr;
        let t = 0;

        for (let i = 1; i < 400; i++) {
            for (let j = 1; j < 700; j++) {
                for (let channel = 0; channel < 3; channel++) {
                    let average = sumAllPixelValues(i, j, kopija, channel, kernel);
                    if (average > 255) imgData.data[t] = 255;
                    else if (average < 0) imgData.data[t] = 0;
                    else imgData.data[t] = average;
                    if (channel !== 2) t++;
                }
                t += 2;
            }
            t += 4;
        }

        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
        kernel = [];
    }

    function yTopSobel() {
        kernel = [
            [1, 2, 1],
            [0, 0, 0],
            [-1, -2, -1]
        ];
        ctx.putImageData(imgData, 0, 0);
        undoArr = copyArray();
        let kopija = mojArr;
        let t = 0;

        for (let i = 1; i < 401; i++) {
            for (let j = 1; j < 700; j++) {
                for (let channel = 0; channel < 3; channel++) {
                    let average = sumAllPixelValues(i, j, kopija, channel, kernel);
                    if (average > 255) imgData.data[t] = 255;
                    else if (average < 0) imgData.data[t] = 0;
                    else imgData.data[t] = average;
                    if (channel !== 2) t++;
                }
                t += 2;
            }
            t += 4;
        }

        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
        kernel = [];
    }
    
    function medianin(arrElementov) {
        const sorted = arrElementov.sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);

        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle] / 2);
        }
        return sorted[middle];
    }

    function medianinFilter() {
        kernel = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ];
        ctx.putImageData(imgData, 0, 0);
        undoArr = copyArray();
        let kopija = mojArr;
        let t = 0;
        let filterValues = [];
        for (let i = 1; i < 400; i++) {
            for (let j = 1; j < 700; j++) {
                for (let channel = 0; channel < 3; channel++) {
                    try {
                        filterValues = [
                            parseInt(kopija[i - 1][j + 1][channel], 10),
                            parseInt(kopija[i][j + 1][channel], 10),
                            parseInt(kopija[i + 1][j + 1][channel], 10),
                            parseInt(kopija[i - 1][j][channel], 10),
                            parseInt(kopija[i][j][channel], 10),
                            parseInt(kopija[i + 1][j][channel], 10),
                            parseInt(kopija[i - 1][j - 1][channel], 10),
                            parseInt(kopija[i][j - 1][channel], 10),
                            parseInt(kopija[i + 1][j - 1][channel], 10)
                        ];
                        imgData.data[t] = medianin(filterValues);
                    } catch {
                        console.log("Error (medianinFilter())", i, j, channel);
                    }
                    if (channel !== 2) t++;
                }
                t += 2;
            }
            t += 4;
        }
        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
        kernel = [];
    }

    function sharpening() {
        kernel = [
            [0, 1, 0],
            [1, -4, 1],
            [0, 1, 0]
        ];
        ctx.putImageData(imgData, 0, 0);
        undoArr = copyArray();
        let kopija = mojArr;
        let t = 0;

        for (let i = 1; i < 401; i++) {
            for (let j = 1; j < 700; j++) {
                for (let channel = 0; channel < 3; channel++) {
                    let average = sumAllPixelValues(i, j, kopija, channel, kernel);
                    if (average > 255) imgData.data[t] = 255;
                    else if (average < 0) imgData.data[t] = 0;
                    else imgData.data[t] = average;
                    if (channel !== 2) t++;
                }
                t += 2;
            }
            t += 4;
        }

        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
        kernel = [];
    }


    function unsharpMasking() {
        kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ];
        ctx.putImageData(imgData, 0, 0);
        undoArr = copyArray();
        let kopija = mojArr;
        let t = 0;

        for (let i = 1; i < 401; i++) {
            for (let j = 1; j < 700; j++) {
                for (let channel = 0; channel < 3; channel++) {
                    let average = sumAllPixelValues(i, j, kopija, channel, kernel);
                    if (average > 255) imgData.data[t] = 255;
                    else if (average < 0) imgData.data[t] = 0;
                    else imgData.data[t] = average;
                    if (channel !== 2) t++;
                }
                t += 2;
            }
            t += 4;
        }

        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
        kernel = [];
    }

    let mojArr = pretvorba(imgData);
    let box = document.getElementById("boxF");
    let lap = document.getElementById("lap");
    let xTop = document.getElementById("xTop");
    let yTop = document.getElementById("yTop");
    let med = document.getElementById("med");
    let sharp = document.getElementById("sharp");
    let unsharp = document.getElementById("unsharp");
    let undoLet = document.getElementById("undoLet");
    let redoLet = document.getElementById("redoLet");
    box.addEventListener("click", boxFilter);
    lap.addEventListener("click", laplaceovOperator);
    xTop.addEventListener("click", xTopSobel);
    yTop.addEventListener("click", yTopSobel);
    med.addEventListener("click", medianinFilter);
    sharp.addEventListener("click", sharpening);
    unsharp.addEventListener("click", unsharpMasking);
    undoLet.addEventListener("click", undo);
    redoLet.addEventListener("click", redo);
};
window.addEventListener('DOMContentLoaded', (event) => {

    const grayscale = function (ev) {
        undoArr = copyArray();
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let arr = imgData.data;
        for (let i = 0; i < arr.length; i += 4) {
            let ttl = arr[i] + arr[i + 1] + arr[i + 2];
            let avg = parseInt(ttl / 3);
            arr[i] = avg;
            arr[i + 1] = avg;
            arr[i + 2] = avg;
        }
        imgData.data = arr;
        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
    }

    const enhanceRGBchannel = function (ev) {
        undoArr = copyArray();
        let ecolor = document.getElementById("ergbV").value.toUpperCase();
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let arr = imgData.data;
        for (let i = 0; i < arr.length; i = i + 4) {
            switch (ecolor) {
                case 'R':
                    arr[i + 1] = 0, arr[i + 2] = 0;
                    break;
                case 'G':
                    arr[i] = 0, arr[i + 2] = 0;
                    break;
                case 'B':
                    arr[i] = 0, arr[i + 1] = 0;
                    break;
            }
        }
        imgData.data = arr;
        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
    }

    const threshold = function (ev) {
        undoArr = copyArray();
        let val = document.getElementById("example").value;
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let arr = imgData.data;
        let thresh = val;
        for (let i = 0; i < arr.length; i += 4) {
            arr[i] = (arr[i] > thresh) ? arr[i] = 255 : arr[i] = 0;
            arr[i + 1] = (arr[i + 1] > thresh) ? arr[i + 1] = 255 : arr[i + 1] = 0;
            arr[i + 2] = (arr[i + 2] > thresh) ? arr[i + 2] = 255 : arr[i + 2] = 0;
        }
        imgData.data = arr;
        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
    }

    const removeRGBchannel = function (ev) {
        undoArr = copyArray();
        let rcolor = document.getElementById("rrgbV").value.toUpperCase();
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let arr = imgData.data;
        for (let i = 0; i < arr.length; i += 4) {
            switch (rcolor) {
                case 'R':
                    arr[i] = 0;
                    break;
                case 'G':
                    arr[i + 1] = 0;
                    break;
                case 'B':
                    arr[i + 2] = 0;
                    break;
            }
        }
        imgData.data = arr;
        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
    }

    const brightness = function (ev) {
        undoArr = copyArray();
        let bright = parseInt(document.getElementById("bright").value);
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let arr = imgData.data;
        for (let i = 0; i < arr.length; i += 4) {
            arr[i + 3] = bright;
        }
        imgData.data = arr;
        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
    }

    const invert = function (ev) {
        undoArr = copyArray();
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let arr = imgData.data;
        for (let i = 0; i < arr.length; i += 4) {
            arr[i] = 255 - arr[i];
            arr[i + 1] = 255 - arr[i + 1];
            arr[i + 2] = 255 - arr[i + 2];
        }
        imgData.data = arr;
        ctx.putImageData(imgData, 0, 0);
        redoArr = copyArray();
    }

    const initArr = () => Array.from({
        length: 10
    }, () => 0);
    let redA = initArr();
    let greenA = initArr();
    let blueA = initArr();

    function histogram() {
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let arr = imgData.data;

        for (let i = 0; i < arr.length; i += 4) {
            const index = Math.floor(arr[i] / 26);
            redA[index]++;
            greenA[index]++;
            blueA[index]++;
        }

        for (let i = 0; i < 10; i++) {
            redA[i] = redA[i] / (arr.length / 4) * 100;
            greenA[i] = greenA[i] / (arr.length / 4) * 100;
            blueA[i] = blueA[i] / (arr.length / 4) * 100;
        }

        myChart.canvas
        data = {
            labels: labels,
            datasets: [{
                    label: 'rdeča',
                    backgroundColor: 'rgba(255, 0, 0,0.1)',
                    borderColor: 'rgb(255, 0, 0)',
                    data: redA,
                    fill: true,
                },
                {
                    label: 'zelena',
                    backgroundColor: 'rgba(0, 255, 0,0.2)',
                    borderColor: 'rgb(0, 255, 0)',
                    data: greenA,
                    fill: true,
                },
                {
                    label: 'modra',
                    backgroundColor: 'rgba(0, 0, 255,0.3)',
                    borderColor: 'rgb(0, 0, 255)',
                    data: blueA,
                    fill: true,
                }
            ]
        };
        myChart.update();
    }
    let labels = [
        '26',
        '52',
        '78',
        '104',
        '130',
        '156',
        '182',
        '208',
        '234',
        '255'
    ];
    let data = {
        labels: labels,
        datasets: [{
                label: 'rdeča',
                backgroundColor: 'rgba(255, 0, 0,0.5)',
                borderColor: 'rgb(255, 0, 0)',
                data: redA,
                fill: true,
            },
            {
                label: 'zelena',
                backgroundColor: 'rgba(0, 255, 0,0.5)',
                borderColor: 'rgb(0, 255, 0)',
                data: greenA,
                fill: true,
            },
            {
                label: 'modra',
                backgroundColor: 'rgba(0, 0, 255,0.5)',
                borderColor: 'rgb(0, 0, 255)',
                data: blueA,
                fill: true,
            }
        ]
    };

    let config = {
        type: 'line',
        data: data,
        options: {
            elements: {
                line: {
                    tension: 0.5
                }
            }

        }
    };
    let histoRefresh = document.getElementById("refr");
    let myChart = new Chart(
        document.getElementById('histogram'),
        config
    );

    histoRefresh.addEventListener("click", () => {
        histogram();
    })

    let gs = document.getElementById('gs');
    let th = document.getElementById('th');
    let rrgb = document.getElementById('rrgb');
    let ergb = document.getElementById('ergb');
    let br = document.getElementById('br');
    let res = document.getElementById('res');
    let inv = document.getElementById('inv');

    gs.addEventListener('click', grayscale);
    th.addEventListener('click', threshold);
    rrgb.addEventListener('click', removeRGBchannel);
    ergb.addEventListener('click', enhanceRGBchannel);
    br.addEventListener('click', brightness);
    res.addEventListener('click', resetAll);
    inv.addEventListener('click', invert);
});