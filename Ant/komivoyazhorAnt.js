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
    const yd = Math.pow(Math.abs(city1.y - city2.y), 2);
    return Math.sqrt(xd + yd);
};

const antProduct = (pheromone, distance) => Math.pow(pheromone, ALPHA) * Math.pow(1.0 / distance, BETA);

const selectNextCity = (cities, ant, phero) => {
    const numCities = cities.length;
    const from = ant.curCity;
    let totalProbability = 0;
    const probabilities = [];

    for (let to = 0; to < numCities; to++) {
        if (ant.tabu[to] === 0) {
            const prob = antProduct(phero[from][to], dist(cities[from], cities[to]));
            probabilities.push({ city: to, probability: prob });
            totalProbability += prob;
        }
    }

    // Проверка, что totalProbability не равно нулю (если равно, значит, вероятности не были вычислены)
    if (totalProbability === 0) {
        return -1; // Нет доступных городов для выбора
    }

    // Выбор случайного города с учетом вероятностей
    let rand = Math.random() * totalProbability;
    let accumulated = 0;
    let nextCity = -1;
    for (const { city, probability } of probabilities) {
        accumulated += probability;
        if (accumulated >= rand) {
            nextCity = city;
            break;
        }
    }

    if (nextCity !== -1) {
        ant.tabu[nextCity] = 1; // Обновляем tabu для выбранного города
    }

    return nextCity;
};

const init = (vertices) => {
    const numCities = vertices.length;
    const ants = new Array(numCities).fill(null).map(() => new Ant());

    const cities = vertices.map(coord => new City(coord.x, coord.y));

    const distMatrix = new Array(numCities).fill(null).map(() => new Array(numCities).fill(0.0));
    const phero = new Array(numCities).fill(null).map(() => new Array(numCities).fill(1.0 / numCities));

    for (let i = 0; i < numCities; i++) {
        for (let j = 0; j < numCities; j++) {
            distMatrix[i][j] = dist(cities[i], cities[j]);
        }
    }

    ants.forEach((ant, index) => {
        ant.curCity = index;
        ant.tabu[index] = 1;
        ant.path[0] = index;
    });

    return { cities, ants, dist: distMatrix, phero };
};

const simulateAnts = (cities, ants, distMatrix, phero) => {
    let moving = 0;
    let allCitiesVisited = true; // Переменная, чтобы отслеживать, посещены ли все города

    for (const ant of ants) {
        if (ant.pathIndex < cities.length || ant.curCity !== ant.path[0]) {
            ant.nextCity = selectNextCity(cities, ant, phero);

            // Если не нашли следующий город, значит все города посещены
            if (ant.nextCity === -1) {
                allCitiesVisited = false;
                continue; // Пропускаем муравья, который не может найти следующий город
            }

            ant.tabu[ant.nextCity] = 1;
            ant.path[ant.pathIndex++] = ant.nextCity;

            ant.tourLength += distMatrix[ant.curCity][ant.nextCity]; // Исправление: использование distMatrix вместо dist

            if (ant.pathIndex === cities.length) {
                ant.tourLength += distMatrix[ant.path[cities.length - 1]][ant.path[0]]; // Исправление: использование distMatrix вместо dist
                ant.curCity = ant.path[0]; // Обновляем текущий город на начальный
            } else {
                ant.curCity = ant.nextCity;
            }

            moving++;
        } else {
            ant.nextCity = -1; // Устанавливаем следующий город в -1, чтобы указать, что муравей завершил маршрут
        }
    }

    // Проверяем, все ли города посещены после первого прохода
    if (allCitiesVisited) {
        // Найдем ближайший непосещенный город для каждого муравья и переместим его туда
        for (const ant of ants) {
            if (ant.pathIndex < cities.length) {
                let nearestCity = -1;
                let nearestDist = Infinity;
                for (let i = 0; i < cities.length; i++) {
                    if (ant.tabu[i] === 0) {
                        const d = dist(cities[ant.curCity], cities[i]);
                        if (d < nearestDist) {
                            nearestDist = d;
                            nearestCity = i;
                        }
                    }
                }
                ant.nextCity = nearestCity;
                ant.tabu[nearestCity] = 1;
                ant.path[ant.pathIndex++] = nearestCity;
                ant.tourLength += nearestDist;
                ant.curCity = nearestCity;
                moving++;
            }
        }
    }

    // Полностью перезаписываем путь для каждого муравья
    for (const ant of ants) {
        if (ant.nextCity === -1) {
            ant.path = ant.path.slice(0, ant.pathIndex); // Обрезаем массив path до актуальной длины
        }
    }

    return moving;
}

const updateTrails = (ants, phero) => {
    const numCities = phero.length;

    // Итерация по всем муравьям
    for (const ant of ants) {
        // Обновление феромонов на каждом шаге маршрута
        for (let i = 0; i < ant.path.length - 1; i++) {
            const from = ant.path[i];
            const to = ant.path[i + 1];
            phero[from][to] += QVAL / ant.tourLength; // Увеличиваем феромон на найденном пути
            phero[to][from] = phero[from][to]; // Симметричное обновление феромонов
        }
    }

    // Обновление феромонов на всех путях с учетом испарения
    for (let from = 0; from < numCities; from++) {
        for (let to = 0; to < numCities; to++) {
            phero[from][to] *= (1.0 - RHO); // Испарение феромона
            if (phero[from][to] < 0.0) {
                phero[from][to] = INIT_PHER; // Предотвращаем отрицательные значения феромонов
            }
        }
    }
};

const restartAnts = (ants) => {
    const numCities = ants[0].path.length;

    let bestTourLength = Number.MAX_VALUE;
    let bestAntIndex = 0;

    for (let antIndex = 0; antIndex < ants.length; antIndex++) {
        const ant = ants[antIndex];
        if (ant.tourLength < bestTourLength) {
            bestTourLength = ant.tourLength;
            bestAntIndex = antIndex;
        }
        ant.nextCity = -1;
        ant.tourLength = 0.0;
        ant.tabu.fill(0);
        ant.path.fill(-1);

        ant.curCity = antIndex % numCities;
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
        if (simulateAnts(cities, ants, dist, phero) === 0) {

            updateTrails(ants, phero);

            if (curTime !== MAX_TIME) bestAntIndex = restartAnts(ants);
            bestTourLength = ants[bestAntIndex].tourLength;
        }
    }
    console.log('ПУТЬ:', ants[bestAntIndex].path.map(cityIndex => vertices[cityIndex]));

    return ants[bestAntIndex].path.map(cityIndex => vertices[cityIndex]);
};