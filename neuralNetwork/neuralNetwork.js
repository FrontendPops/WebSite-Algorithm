export function neuralNetwork(Biases, Weights) {
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));

    function feedForward(network, inputs) {
        network.layers[0].neurons = [...inputs];

        for (let i = 1; i < network.layers.length; i++) {
            let layerFirst = network.layers[i - 1];
            let layerSecond = network.layers[i];
            //const nextLayerSize = i < network.layers.length - 1 ? network.layers[i + 1].size : 0;

            for (let j = 0; j < layerSecond.size; j++) {
                layerSecond.neurons[j] = 0;

                for (let k = 0; k < layerFirst.size; k++) {
                    layerSecond.neurons[j] += layerFirst.neurons[k] * layerFirst.weights[k][j];
                }

                layerSecond.neurons[j] += layerSecond.biases[j];
                layerSecond.neurons[j] = sigmoid(layerSecond.neurons[j]);
            }
        }

        return network.layers[network.layers.length - 1].neurons;
    }

    const network = {
        layers: []
    };

    const sizes = Biases.map(layer => layer.length);
    // console.log(sizes);
    Biases.forEach((layerBiases, index) => {
        const size = sizes[index];
        //const nextLayerSize = index < sizes.length - 1 ? sizes[index + 1] : 0;
        const layer = {
            size,
            neurons: new Array(size).fill(0),
            biases: [...layerBiases],
            weights: Weights[index]
        };
        network.layers.push(layer);
    });

    return {
        network,
        feedForward: (inputs) => feedForward(network, inputs)
    };
}
