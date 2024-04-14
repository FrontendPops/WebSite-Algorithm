import { colors, canvas, context, startBtn, clearBtn, createPoints } from './const.js'
import { findBestPath, shuffleArray } from './genetic.js'


// Объявление временных переменных, массивов для работы с ними
function initializeVariables() {
    let points = [];
    let allowAddPoints = true;

    return { points, allowAddPoints };
}

let { points, allowAddPoints } = initializeVariables();

// Кнопка для установки вершин  
createPoints.addEventListener('click', () => {
    allowAddPoints = true;

    // Удаляем старый обработчик события click, чтобы они не оставались активными и повторялись
    canvas.removeEventListener('click', createPointsCanvas);

    canvas.addEventListener('click', createPointsCanvas);
});

// Рисуем на холсте "canvas" - вершины, в дальнейшем для отображения пути  
function createPointsCanvas(event) {
    if (allowAddPoints) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        points.push({ x, y });
        drawPoints();
    }
}

// Кнопка для запуска алгоритма  
startBtn.addEventListener('click', async function () {
    // Мешаем вершины местами  
    console.log(points.length)
    shuffleArray(points);

    // Выставляем значения для популяции, процента мутации и количества поколений  
    const populationSize = 5000;
    const mutationRate = 0.7;
    const generations = points.length * 10;
    console.log(generations);

    // Получаем все пути на каждой итерации алгоритма 
    const allPaths = findBestPath(points, populationSize, mutationRate, generations);

    // Отображаем каждый путь на холсте Canvas 
    for (let i = 0; i < allPaths.length; i++) {
        drawPath(allPaths[i]);
        await sleep(200); // Добавляем задержку для визуализации 
    }

    allowAddPoints = false; // Установка false, после запуска алгоритма нельзя добавлять вершины, пока не нажмется кнопка "Установить вершины"  
});


// Кнопка очистки холста "canvas"  
clearBtn.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points.splice(0, points.length);
});

// Рисование вершин на холсте "canvas"  
function drawPoints() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach(point => {
        context.beginPath();
        context.arc(point.x, point.y, 10, 0, Math.PI * 2);
        context.fillStyle = colors.orange;
        context.fill();
    });
}

// Рисование пути по вершинам  
function drawPath(path) {
    drawPoints();
    context.beginPath();
    context.moveTo(points[path[0]].x, points[path[0]].y);
    for (let i = 1; i < path.length; i++) {
        context.lineTo(points[path[i]].x, points[path[i]].y);
    }
    context.lineTo(points[path[0]].x, points[path[0]].y);
    context.lineWidth = 1;
    context.strokeStyle = "grey";
    context.stroke();
}

// Задержка для показа прохода по вершинам  
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}