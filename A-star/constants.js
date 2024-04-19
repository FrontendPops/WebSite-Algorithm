const container = document.querySelector('.container');
export const containerWidth = parseInt(getComputedStyle(container).getPropertyValue('--container-width'));

export const state = {
    currentGreenCell: null,
    currentRedCell: null
};

export const colors = {
    whiteColor: '#FFFFFF',
    blackColor: '#000000',
    greenColor: '#00FF00',
    redColor: '#FF0000',
    lemonColor: '#FFFACD',
    pinkColor: '#FF1493'
};

export const flag = {
    countClickGreen: true,
    countClickRed: true,
    startPointClicked: false,
    endPointClicked: false
};

