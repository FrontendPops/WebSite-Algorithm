import { neuralNetwork } from './neuralNetwork.js'
import { Biases } from './neural/biases.js'
import { Weights } from './neural/weights.js'
import { canvas, context, buttonStart, buttonClear, pixelSize, digitSize, predictNumber, contextHiddenCanvas } from './const.js'
import { startDrawing, drawBrush, stopDrawing } from './drawCanvas.js';


document.addEventListener("DOMContentLoaded", function () {
    network = neuralNetwork(Biases, Weights);
})

function initializeVariables() {
    let isDigit = true;

    canvas.addEventListener('mousedown', (event) => startDrawing(event, canvas, context, pixelSize));
    canvas.addEventListener('mousemove', (event) => drawBrush(event, canvas, context, pixelSize));
    canvas.addEventListener('mouseup', stopDrawing);

    let network;
    return { isDigit, network };
}

let { isDigit, network } = initializeVariables();


buttonStart.addEventListener('click', function () {
    getDigit();
});

buttonClear.addEventListener('click', function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    contextHiddenCanvas.clearRect(0, 0, canvas.width, canvas.height);
    predictNumber.textContent = ""; 
    isDigit = true;
})

function getDrawnArea() {
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            if (alpha > 0) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    return { minX, minY, maxX, maxY };
}

function getDigit() {
    if (isDigit) {
        const { minX, minY, maxX, maxY } = getDrawnArea();

        const drawnWidth = maxX - minX + 1;
        const drawnHeight = maxY - minY + 1;
        console.log(drawnWidth, drawnHeight);
        if (drawnWidth <= digitSize && drawnHeight <= digitSize) {
            // Увеличиваем размер нарисованного изображения
            const scaleFactor = 2; // Масштабный коэффициент
            const scaledWidth = drawnWidth * scaleFactor;
            const scaledHeight = drawnHeight * scaleFactor;

            const marginX = Math.floor((canvas.width - scaledWidth) / 2);
            const marginY = Math.floor((canvas.height - scaledHeight) / 2);

            const scaledCanvas = document.createElement("canvas");
            scaledCanvas.width = scaledWidth;
            scaledCanvas.height = scaledHeight;
            const scaledContext = scaledCanvas.getContext("2d");
            scaledContext.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
            // Увеличиваем изображение
            scaledContext.scale(scaleFactor, scaleFactor);
            scaledContext.drawImage(canvas, minX, minY, drawnWidth, drawnHeight, 0, 0, drawnWidth, drawnHeight);

            contextHiddenCanvas.clearRect(0, 0, canvas.width, canvas.height); // Очищаем скрытый холст перед использованием
            contextHiddenCanvas.drawImage(scaledCanvas, marginX, marginY, scaledWidth, scaledHeight);
        } else {
            const drawnWidth = maxX - minX + 1;
            const drawnHeight = maxY - minY + 1;
            const marginX = Math.floor((canvas.width - drawnWidth) / 2);
            const marginY = Math.floor((canvas.height - drawnHeight) / 2);

            const imageData = context.getImageData(minX, minY, drawnWidth, drawnHeight);
            const scaledCanvas = document.createElement("canvas");
            scaledCanvas.width = drawnWidth;
            scaledCanvas.height = drawnHeight;
            const scaledContext = scaledCanvas.getContext("2d");
            scaledContext.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
            scaledContext.putImageData(imageData, 0, 0);

            contextHiddenCanvas.clearRect(0, 0, canvas.width, canvas.height); // Очищаем скрытый холст перед использованием
            contextHiddenCanvas.drawImage(scaledCanvas, marginX, marginY);

        }

        const scaledImageData = contextHiddenCanvas.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = [];

        for (let i = 0; i < scaledImageData.data.length; i += 4) {
            pixels.push(scaledImageData.data[i] / 255);
        }

        const output = network.feedForward(pixels);

        let predict = 0;
        let predictWeight = -1;

        for (let i = 0; i < 10; i++) {
            if (predictWeight < output[i]) {
                predictWeight = output[i];
                predict = i;
            }
        }

        predictNumber.textContent = predict;
    }
}
