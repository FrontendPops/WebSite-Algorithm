let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

let pointList = [];
let tempPointList;

canvas.addEventListener('mousedown', (event) => {
	const rect = canvas.getBoundingClientRect();
	const xVal = event.clientX - rect.left;
	const yVal = event.clientY - rect.top;

	pointList.push({ x: xVal, y: yVal });
  // console.log(event.clientX, event.clientY);
	drawPoints();
});

window.addEventListener(`resize`, event => {
	if (window.innerWidth <= 900) {
    canvas.width = 300;
    canvas.height = 300;
  }
  else {
    canvas.width = 500;
    canvas.height = 500;
  }
}, false);

function orientation(p, q, r) {
  return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

function compare(p0, p1, p2) {
  const val = (p1.y - p0.y) * (p2.x - p1.x) - (p1.x - p0.x) * (p2.y - p1.y);
  if (val === 0) {
      return Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2) - Math.sqrt((p2.x - p0.x) ** 2 + (p2.y - p0.y) ** 2);
  }
  return val;
}

function convexHull(points) {
  const n = points.length;
  if (n < 3) return points;

  let minY = Infinity;
  let minIndex = -1;
  for (let i = 0; i < n; i++) {
      if (points[i].y < minY || (points[i].y === minY && points[i].x < points[minIndex].x)) {
          minY = points[i].y;
          minIndex = i;
      }
  }

  [points[0], points[minIndex]] = [points[minIndex], points[0]];

  points.sort((a, b) => compare(points[0], a, b));

  const stack = [points[0], points[1]]; 

  for (let i = 2; i < n; i++) {
      let top = stack.length - 1;
      while (top > 0 && orientation(stack[top - 1], stack[top], points[i]) >= 0) {
          // Удаляем точки, образующие не выпуклый угол
          stack.pop();
          top--;
      }
      stack.push(points[i]);
  }
  stack.push(points[0]);
  return stack;
}

function drawPoints() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for (let point of pointList) {
    ctx.fillStyle = '#0';
		ctx.fillRect(point.x, point.y, 10, 10);
	}
}

function distance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function regionQuery(point, eps) {
  let neighbors = [];
  for (let i = 0; i < pointList.length; i++) {
    if (distance(point, tempPointList[i]) <= eps) {
      neighbors.push(tempPointList[i]);
    }
  }
  return neighbors;
}

function getCentroids(pointList, k) {
  let centroids = [];

  for (let i = 0; i < k; i++) {
    while (true) {
      let checked = true;
      centroidCandidate = pointList[getRandomInt(pointList.length)];
      for (let j = 0; j < centroids.length; j++) {
        if (centroidCandidate.x == centroids[j].x ||centroidCandidate.xy == centroids[j].y) checked = false;
      }
      if (checked) break;
    }
    centroids.push(centroidCandidate);
  }
  return centroids;
}
  
function initializeClusters(pointList, k, centroids) {
    let clusters = [];

    for (let i = 0; i < k; i++) {
      let newCluster = {
        index: i,
        points: [
          {x: centroids[i].x,
          y: centroids[i].y}
        ],
        centroid: {
          x: centroids[i].x,
          y: centroids[i].y
        }
      };
      clusters.push(newCluster);
    }

    for (let i = 0; i < pointList.length; i++) {
        let minDistance = Infinity;
        let clusterIndex = -1;
        for (let j = 0; j < k; j++) {
            let distanceToCluster = distance(pointList[i], clusters[j].centroid);
            if (distanceToCluster < minDistance) {
                minDistance = distanceToCluster;
                clusterIndex = j;
            }
        }
        clusters[clusterIndex].points.push(pointList[i]);
    }
    return clusters;
}
  
function updateClusters(clusters, pointList) {
  const newClusters = clusters.map(cluster => ({
    index: cluster.index,
    points: [],
    centroid:  {
      x: cluster.points.reduce((acc, point) => acc + point.x, 0) / cluster.points.length,
      y: cluster.points.reduce((acc, point) => acc + point.y, 0) / cluster.points.length
    }
  }));
  
  for (let point of pointList) {
    let minDistance = Infinity;
    let closestClusterIndex = -1;

    for (let m = 0; m < newClusters.length; m++) {
      const distanceToCluster = distance(point, newClusters[m].centroid);

      if (distanceToCluster < minDistance) {
        minDistance = distanceToCluster;
        closestClusterIndex = m;
      }
    }    
      newClusters[closestClusterIndex].points.push(point);
    } 
  return newClusters;
}
  
function drawClustersKmeans(clusters) {
  for (let cluster of clusters) {
    ctx.fillStyle = `hsl(${cluster.index * 360 / clusters.length}, 60%, 70%)`;
    ctx.strokeStyle = `hsl(${cluster.index * 360 / clusters.length}, 60%, 70%)`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    let hull = convexHull(cluster.points)

    for (let point of hull) {
        // ctx.fillRect(point.x, point.y, 8, 8);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }
    ctx.fill();
  }
}
  
function drawClustersDbscan(clusters) {
  for (let i = 0; i < clusters.length; i++) {
    let clusterElement = clusters[i];
    ctx.fillStyle = `hsl(${i * 360 / clusters.length}, 100%, 50%)`;
    ctx.beginPath();
    // console.log(clusterElement);
    for (let point of clusterElement) {
      ctx.fillRect(point.x, point.y, 8, 8);
    }
  }
}

function drawClustersHierarchical(clusters) {
  for (let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i];
    ctx.strokeStyle = `gray`;
    ctx.lineWidth = 3;
    ctx.setLineDash([6]);
    ctx.beginPath();
    let hull = convexHull(cluster)

    for (let point of hull) {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }
  }
  
  ctx.setLineDash([0]);
}

function kMeans(pointList) {
  let input = document.querySelector('input');
  let k = input.value;
  if (pointList.length >= k) {
    let centroids = getCentroids(pointList, k)
    let clusters = initializeClusters(pointList, k, centroids);
    let iteration = 0;
  
    while (iteration < 50) {
      clusters = updateClusters(clusters, pointList);
      iteration++;
    }
    drawClustersKmeans(clusters);
  }
}
  
function expandCluster(point, neighbors, eps, minPts) {
  let cluster = [point];
  for (let i = 0; i < neighbors.length; i++) {
    if (neighbors[i].cluster === undefined) {
      neighbors[i].cluster = cluster[0].cluster;
      let newNeighbors = regionQuery(neighbors[i], eps);
      if (newNeighbors.length >= minPts) {
        cluster = cluster.concat(expandCluster(neighbors[i], newNeighbors, eps, minPts));
      } else {
        neighbors[i].cluster = -1;
      }
    }
  }
  return cluster;
}

function dbscan(pointList) {
  eps = document.getElementById("myRange").value;
  // console.log(eps);
  let clusters = [];
  tempPointList = [];
  for (let i = 0 ; i < pointList.length; i++) { 
    tempPointList.push({ x: pointList[i].x, y: pointList[i].y });
  }

  for (let i = 0; i < tempPointList.length; i++) {
    if (tempPointList[i].cluster === undefined) {
      let neighbors = regionQuery(tempPointList[i], eps);
      if (neighbors.length >= minPts) {
        tempPointList[i].cluster = clusters.length;
        clusters.push(expandCluster(tempPointList[i], neighbors, eps, minPts));
      } else {
        tempPointList[i].cluster = -1;
      }
    }
  }
  // console.log(clusters);
  // console.log("DBSCAN: " + clusters.length  + " clusters found.");
  drawClustersDbscan(clusters);
}

function euclideanDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function hierarchicalClustering(points) {
  // Инициализация кластеров, каждая точка изначально является отдельным кластером
  let clusters = points.map(point => [point]);
  let input = document.querySelector('input');
  let k = input.value;

  while (clusters.length > k) {
      let minDistance = Infinity;
      let closestClusters = [0, 1]; // Индексы двух ближайших кластеров

      // Находим два ближайших кластера
      for (let i = 0; i < clusters.length; i++) {
          for (let j = i + 1; j < clusters.length; j++) {
              let distance = 0;
              for (let point1 of clusters[i]) {
                  for (let point2 of clusters[j]) {
                      distance += euclideanDistance(point1, point2);
                  }
              }
              distance /= clusters[i].length * clusters[j].length;

              if (distance < minDistance) {
                  minDistance = distance;
                  closestClusters = [i, j];
              }
          }
      }

      // Объединяем два ближайших кластера
      clusters[closestClusters[0]] = clusters[closestClusters[0]].concat(clusters[closestClusters[1]]);
      clusters.splice(closestClusters[1], 1);
  }

  drawClustersHierarchical(clusters);
}


let eps; 
let minPts = 4; 
const startButton = document.getElementById('start-button');

startButton.addEventListener('click', () => {
  // console.log("Starting..."); 
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  kMeans(pointList);
  dbscan(pointList);
  hierarchicalClustering(pointList);
});
  
