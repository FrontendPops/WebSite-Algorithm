const MAX_CITIES = 30;
const MAX_DIST = 100;
const MAX_TOUR = MAX_CITIES * MAX_DIST;
const ALPHA = 1.0;
const BETA = 5.0;
const RHO = 0.5;
const QVAL = 100;
const MAX_TOURS = 20;
const MAX_TIME = MAX_TOURS * MAX_CITIES;
const INIT_PHER = 1.0 / MAX_CITIES;

class City {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Ant {
    constructor() {
        this.curCity = 0;
        this.nextCity = -1;
        this.pathIndex = 1;
        this.tabu = new Array(MAX_CITIES).fill(0); // Инициализация массива tabu с нулями
        this.path = [];
        this.tourLength = 0;
    }
}

const dist = (city1, city2) => {
    const xd = Math.pow(Math.abs(city1.x - city2.x), 2);
    const yd = Math.pow(Math.abs(city1.y - city2.y), 2);// евклидово расстояние между городами
    return Math.sqrt(xd + yd);
};

const antProduct = (pheromone, distance) => Math.pow(pheromone, ALPHA) * Math.pow(1.0 / distance, BETA);// выбор след города от силы феромона и эвристики

const selectNextCity = (cities, ant, phero) => {//варик выбора нового города
    const numCities = cities.length;
    const from = ant.curCity;
    let maxProb = -1;
    let nextCity = -1;

    for (let to = 0; to < numCities; to++) {
        if (ant.tabu[to] === 0) {
            const prob = antProduct(phero[from][to], dist(cities[from], cities[to]));// вероятность выбрать этот город
            if (prob > maxProb) {
                maxProb = prob;
                nextCity = to;
            }
        }
    }

    if (nextCity !== -1) {
        ant.tabu[nextCity] = 1; // говорим что посетили новый город
    } else {
        nextCity = 0;
    }

    return nextCity;
};

const init = (vertices) => {
    const numCities = vertices.length;
    const ants = new Array(numCities).fill(null).map(() => new Ant());// популяция муравьев

    const cities = vertices.map(coord => new City(coord.x, coord.y));

    const distMatrix = new Array(numCities).fill(null).map(() => new Array(numCities).fill(0.0));// матрица расстояния между городами
    const phero = new Array(numCities).fill(null).map(() => new Array(numCities).fill(1.0 / numCities));// урвоень феромона между городами

    for (let i = 0; i < numCities; i++) {
        for (let j = 0; j < numCities; j++) {
            distMatrix[i][j] = dist(cities[i], cities[j]);
        }
    }

    ants.forEach((ant, index) => {
        ant.curCity = index;// текущий город
        ant.tabu[index] = 1;// запрет на посещение города
        ant.path[0] = index;// стартовый маршрут
    });

    return { cities, ants, dist: distMatrix, phero };
};

const simulateAnts = (cities, ants, dist, phero) => {// движение муравьев в колонии
    let moving = 0;// колво муравьев на этапе

    for (const ant of ants) {
        if (ant.pathIndex < cities.length || ant.curCity !== ant.path[0]) {// проверка завершил ли он проход 
            ant.nextCity = selectNextCity(cities, ant, phero);// выбор следующего города

            ant.tabu[ant.nextCity] = 1;// почемаем что прошли его и добавляем в итоговый путь
            ant.path[ant.pathIndex++] = ant.nextCity;

            ant.tourLength += dist[ant.curCity][ant.nextCity];// длинна маршрута

            if (ant.pathIndex === cities.length) {// если муравей посетил все города 
                ant.tourLength += dist[ant.path[cities.length - 1]][ant.path[0]];
                ant.curCity = ant.path[0]; // Обновляем текущий город на начальный
            } else {
                ant.curCity = ant.nextCity;//если муравей не посетил все города то переходим к следующему 
            }

            moving++;
        } else {
            ant.nextCity = -1; // Устанавливаем следующий город в -1, чтобы указать, что муравей завершил маршрут
        }
    }

    // Полностью перезаписываем путь для каждого муравья
    for (const ant of ants) {
        if (ant.nextCity === -1) {
            ant.path = ant.path.slice(0, ant.pathIndex); // Обрезаем массив path до актуальной длины
        }
    }

    return moving;
};

const updateTrails = (ants, phero) => {// обновление уровня феромона на пути
    const numCities = phero.length;

    for (let from = 0; from < numCities; from++) {
        for (let to = 0; to < numCities; to++) {
            if (from !== to) {
                phero[from][to] *= (1.0 - RHO);// испарение феромона

                if (phero[from][to] < 0.0) {
                    phero[from][to] = INIT_PHER;
                }
            }
        }
    }

    for (const ant of ants) {
        for (let i = 0; i < ant.path.length; i++) {
            const from = ant.path[i];
            const to = (i < ant.path.length - 1) ? ant.path[i + 1] : ant.path[0];// определяю текущий город и след город

            phero[from][to] += QVAL / ant.tourLength;// увеличиваем феромон
            phero[to][from] = phero[from][to];
        }
    }

    for (let from = 0; from < numCities; from++) {// постепенно везде испаряется феромон
        for (let to = 0; to < numCities; to++) {
            phero[from][to] *= RHO;
        }
    }
};

const restartAnts = (ants) => {
    const numCities = ants[0].path.length;// колво городов на сонове прохода первого муравья

    let bestTourLength = Number.MAX_VALUE;
    let bestAntIndex = 0;

    for (let antIndex = 0; antIndex < ants.length; antIndex++) {
        const ant = ants[antIndex];
        if (ant.tourLength < bestTourLength) {// перезаписываем длинну чтобы найти самый короткий путь
            bestTourLength = ant.tourLength;
            bestAntIndex = antIndex;
        }
        ant.nextCity = -1;
        ant.tourLength = 0.0;
        ant.tabu.fill(0);
        ant.path.fill(-1);

        ant.curCity = antIndex % numCities;// ставим текущий город другим чтобы начинать с разных городов
        ant.pathIndex = 1;
        ant.path[0] = ant.curCity;

        ant.tabu[ant.curCity] = 1;
    }

    return bestAntIndex;
};

export const findShortestPath = (vertices) => {
    const { cities, ants, dist, phero } = init(vertices);
    let bestTourLength = Number.MAX_VALUE;
    let bestAntIndex = 0;
    let curTime = 0;

    while (curTime++ < MAX_TIME) {
        if (simulateAnts(cities, ants, dist, phero) === 0) {// муравьи ищут путь

            updateTrails(ants, phero);

            if (curTime !== MAX_TIME) bestAntIndex = restartAnts(ants);
            bestTourLength = ants[bestAntIndex].tourLength;
        }
    }
    for (let i = 0; i < vertices.length; i++) {
        ants[bestAntIndex].path[i] = vertices[i];
    }
    return ants[bestAntIndex].path;
};