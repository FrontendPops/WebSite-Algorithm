const fs = require("fs");
const sharp = require("sharp");
const path = "./neural";

const imageData = (path, size, file) => {
    return new Promise((resolve, reject) => {
        sharp(path + "/" + file)
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then(({ data }) => {
                const pixels = [];

                // Меняем шаг цикла так, чтобы они учитывали каждый пиксель (а не каждый канал)
                for (let i = 0; i < size * size; i++) {
                    let value = 0;
                    // Суммируем все каналы для текущего пикселя
                    for (let j = 0; j < 3; j++) {
                        value += data[i * 3 + j]; // Учитываем смещение для каждого канала
                    }
                    // Нормализуем значение и добавляем в массив пикселей
                    pixels.push(value / (3 * 255)); // Учитываем количество каналов и нормализуем
                }
                resolve({
                    digit: Number(file[10]), // file[10] - цифра для predict
                    pixels
                });
            })
            .catch(error => {
                console.error("File: ", file);
                reject(error);
            });
    });
};


// Получаем пиксели с картинок
const pixelsImage = async (size) => {
    const path = "./traintwo";

    const files = fs.readdirSync(path);

    const imagesData = await Promise.all(
        files.map((file) => imageData(path, size, file))
    );

    return imagesData;
};

class Layer {
    constructor(size, nextLayerSize) {
        this.size = size;
        this.neurons = new Array(size).fill(0);
        this.biases = new Array(size).fill(0);
        this.weights = new Array(size).fill(0).map(() => new Array(nextLayerSize).fill(0));
    }
}

class NeuralNetwork {
    constructor(learningRate, sigmoid, dsigmoid, ...sizes) {
        this.learningRate = learningRate;
        this.sigmoid = sigmoid;
        this.dsigmoid = dsigmoid;
        this.layers = [];

        sizes.forEach((size, i) => {
            let nextLayerSize = i < sizes.length - 1 ? sizes[i + 1] : 0;
            this.layers.push(new Layer(size, nextLayerSize));

            this.layers[i].biases = this.layers[i].biases.map(() => Math.random() * 2.0 - 1.0);
            this.layers[i].weights = this.layers[i].weights.map(() => new Array(nextLayerSize).fill(0).map(() => Math.random() * 2.0 - 1.0));
        });
    }

    feedForward(inputs) {
        this.layers[0].neurons = inputs.slice();
        for (let i = 1; i < this.layers.length; i++) { // let i = 1 - было
            let layerFirst = this.layers[i - 1];
            let layerSecond = this.layers[i];
            for (let j = 0; j < layerSecond.size; j++) {
                layerSecond.neurons[j] = 0;
                for (let k = 0; k < layerFirst.size; k++) {
                    layerSecond.neurons[j] += layerFirst.neurons[k] * layerFirst.weights[k][j];
                }
                layerSecond.neurons[j] += layerSecond.biases[j];
                layerSecond.neurons[j] = this.sigmoid(layerSecond.neurons[j]);
            }
        }
        return this.layers[this.layers.length - 1].neurons;
    }

    backpropagation(targets) {
        let errors = new Array(this.layers[this.layers.length - 1].size);

        for (let i = 0; i < this.layers[this.layers.length - 1].size; i++) {
            errors[i] = targets[i] - this.layers[this.layers.length - 1].neurons[i];
        }

        for (let k = this.layers.length - 2; k >= 0; k--) {
            let layerFirst = this.layers[k];
            let layerSecond = this.layers[k + 1];
            let errorsNext = new Array(layerFirst.size).fill(0);
            let gradients = new Array(layerSecond.size).fill(0);

            for (let i = 0; i < layerSecond.size; i++) {
                gradients[i] = errors[i] * this.dsigmoid(this.layers[k + 1].neurons[i]);
                gradients[i] *= this.learningRate;
            }

            let deltas = new Array(layerSecond.length).fill(0);
            for (let i = 0; i < layerSecond.size; i++) {
                deltas[i] = new Array(layerFirst.length).fill(0);
            }

            for (let i = 0; i < layerSecond.size; i++) {
                for (let j = 0; j < layerFirst.size; j++) {
                    deltas[i][j] = gradients[i] * layerFirst.neurons[j];
                }
            }

            for (let i = 0; i < layerFirst.size; i++) {
                for (let j = 0; j < layerSecond.size; j++) {
                    errorsNext[i] += layerFirst.weights[i][j] * errors[j];
                }
            }

            errors = errorsNext;

            let weightsNew = new Array(layerFirst.weights.length).fill(0);
            for (let i = 0; i < layerFirst.weights.length; i++) {
                weightsNew[i] = new Array(layerFirst.weights[0].length).fill(0);
            }

            for (let i = 0; i < layerSecond.size; i++) {
                for (let j = 0; j < layerFirst.size; j++) {
                    weightsNew[j][i] = layerFirst.weights[j][i] + deltas[i][j];
                }
            }

            layerFirst.weights = weightsNew;

            for (let i = 0; i < layerSecond.size; i++) {
                layerSecond.biases[i] += gradients[i];
            }
        }
    }

    saveWeights(file) {
        const weightsToSave = this.layers.map((layer) => layer.weights);
        const jsonWeights = JSON.stringify(weightsToSave);

        fs.writeFileSync(path + "/" + file, jsonWeights);
    }

    saveNeurons(file) {
        const neuronsToSave = this.layers.map((layer) => layer.neurons);
        const jsonNeurons = JSON.stringify(neuronsToSave);

        fs.writeFileSync(path + "/" + file, jsonNeurons);
    }

    saveBiases(file) {
        const biasesToSave = this.layers.map((layer) => layer.biases);
        const jsonBiases = JSON.stringify(biasesToSave);

        fs.writeFileSync(path + "/" + file, jsonBiases);
    }
}
const neuralEpochs = (Network, imagesData, digits, epochs) => {
    for (let i = 0; i < epochs; i++) {
        let correct = 0;
        for (let j = 0; j < 100; j++) { // проходимся по 100 изображений за эпоху
            const idx = i * 100 + j;
            const startDigit = digits[idx];
            const targets = new Array(10).fill(0);
            targets[startDigit] = 1;

            const output = Network.feedForward(imagesData[idx].pixels);

            let predict = 0;
            let predictWeight = -1;

            for (let d = 0; d < 10; d++) {
                if (predictWeight < output[d]) {
                    predictWeight = output[d];
                    predict = d;
                }
            }
            if (startDigit === predict) {
                correct++;
            }

            Network.backpropagation(targets);
        }
    }
};


learn = async () => {
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const dsigmoid = (y) => y * (1 - y);

    const NeuralNetworks = new NeuralNetwork(0.01, sigmoid, dsigmoid, 2500, 1000, 10);

    const pixelsData = await pixelsImage(50);

    const digits = pixelsData.map((imageData) => imageData.digit);

    const epochs = 600;

    neuralEpochs(NeuralNetworks, pixelsData, digits, epochs);

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    NeuralNetworks.saveWeights("weights.json");
    NeuralNetworks.saveNeurons("neurons.json");
    NeuralNetworks.saveBiases("biases.json");

};

learn();