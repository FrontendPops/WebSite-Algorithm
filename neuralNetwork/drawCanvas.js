import {canvas, context, pixelSize} from './const.js'

let paint = false;

export function startDrawing(event) {
    paint = true;
    drawBrush(event);
}

export function drawBrush(event) {
    if (paint) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);

        context.beginPath();
        context.arc(x, y, pixelSize / 2, 0, 2 * Math.PI);
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fill();
    }
}

export function stopDrawing() {
    paint = false;
}