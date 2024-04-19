import { colors, numberPI, buttonClick } from './constant.js'
import { findShortestPath } from './komivoyazhorAnt.js'

const drawPoint = (context, x, y, size) => {
    context.fillStyle = colors.pinkColor;
    context.beginPath();
    context.arc(x, y, size, 0, numberPI * 2); // Создаем круглую точку
    context.fill(); // Заливаем точку
    context.closePath();
};

const resultDrawLine = (context, resultCoordinates) => {
    context.strokeStyle = colors.redColor;

    for (let i = 0; i < resultCoordinates.length - 1; i++) {
        context.beginPath();
        context.moveTo(resultCoordinates[i].x, resultCoordinates[i].y);
        context.lineTo(resultCoordinates[i + 1].x, resultCoordinates[i + 1].y);
        context.stroke(); // Выводим линию на canvas
        context.closePath();
    }

    context.beginPath();
    context.moveTo(resultCoordinates[0].x, resultCoordinates[0].y);
    context.lineTo(resultCoordinates[resultCoordinates.length - 1].x, resultCoordinates[resultCoordinates.length - 1].y);
    context.stroke();
    context.closePath();

    context.strokeStyle = colors.blackColor;
}

const resultLine = (context, resultCoordinates) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (let i = 0; i < resultCoordinates.length; i++) {
        drawPoint(context, resultCoordinates[i].x, resultCoordinates[i].y, 8);
    }
}

const find = (context, coordinates, startCoordinatesPoints) => {
    const resultDistance = findShortestPath(coordinates);

    //cleanLine(context, coordinates)
    startCoordinatesPoints = coordinates.slice();
    resultLine(context, resultDistance);
    resultDrawLine(context, resultDistance);
}

const drawLine = (context, coordinatesPoints) => {
    for (let i = 0; i < coordinatesPoints.length; i++) {
        for (let j = i + 1; j < coordinatesPoints.length; j++) {
            context.beginPath();
            context.moveTo(coordinatesPoints[i].x, coordinatesPoints[i].y);
            context.lineTo(coordinatesPoints[j].x, coordinatesPoints[j].y);
            context.stroke(); // Выводим линию на canvas
            context.closePath();
        }
    }
};

const paintDot = () => {
    let coordinatesPoints = [];
    let startCoordinatesPoints = [];
    const canvas = document.getElementById('paint');
    const context = canvas.getContext('2d');

    const draw = (event) => {
        const x = event.clientX - canvas.offsetLeft;
        const y = event.clientY - canvas.offsetTop;

        coordinatesPoints.push({ x, y });

        drawPoint(context, x, y, 8);

        if (coordinatesPoints.length > 1) {
            drawLine(context, coordinatesPoints);
        }
    }

    buttonClick.searchWay = false;

    const searchWayEvent = () => {
        if (!buttonClick.searchWay && coordinatesPoints.length > 0) {
            find(context, coordinatesPoints, startCoordinatesPoints);
            buttonClick.searchWay = true;
        }
    }

    const clearCanvas = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        coordinatesPoints.length = 0;
        buttonClick.searchWay = false;
    }
    

    canvas.addEventListener('click', draw);

    document.getElementById("search").addEventListener("click", searchWayEvent);

    document.getElementById("clear").addEventListener("click", clearCanvas);
}

document.getElementById("paint").addEventListener("click", function () {
    paintDot();
});
