export const canvas = document.getElementById("canvas");
export const context = canvas.getContext("2d");

export const hiddenCanvas = document.createElement("canvas");
export const contextHiddenCanvas = hiddenCanvas.getContext("2d");

export const buttonStart = document.getElementById("buttonStart");
export const buttonClear = document.getElementById("buttonClear");
export const predictNumber = document.getElementById("predictedNumber");


// Переменные
export const pixelSize = 3; // Размер кисти
export const digitSize = 35; // Пороговый размер для увеличения


