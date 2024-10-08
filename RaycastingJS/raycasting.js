const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

// Mapa del mundo (1 representa una pared, 0 representa espacio vacío)
const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const tileSize = 80;
let player = {
  x: 150,  // Posición inicial del jugador
  y: 150,
  angle: 0, // Dirección en la que mira
  speed: 2, // Velocidad del jugador
  radius: 10 // Tamaño del jugador para colisiones
};

// Función para comprobar colisión
function hasCollision(x, y) {
  const mapX = Math.floor(x / tileSize);
  const mapY = Math.floor(y / tileSize);

  // Comprobar si la nueva posición está dentro de los límites del mapa y si hay una pared
  return map[mapY] && map[mapY][mapX] === 1;
}

function movePlayer(deltaX, deltaY) {
  const newX = player.x + deltaX;
  const newY = player.y + deltaY;

  // Comprobar colisión con los bordes del jugador
  if (!hasCollision(newX - player.radius, player.y) && !hasCollision(newX + player.radius, player.y)) {
    player.x = newX;
  }
  if (!hasCollision(player.x, newY - player.radius) && !hasCollision(player.x, newY + player.radius)) {
    player.y = newY;
  }
}

function drawMiniMap() {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        ctx.fillStyle = 'white';
        ctx.fillRect(col * tileSize / 8, row * tileSize / 8, tileSize / 8, tileSize / 8);
      }
    }
  }

  // Dibujar al jugador en el minimapa
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(player.x / 8, player.y / 8, player.radius / 8, 0, Math.PI * 2);
  ctx.fill();
}

function castRay(angle) {
  let xStep, yStep, wallHit = false;
  let distance = 0;
  let rayX = player.x;
  let rayY = player.y;

  // Incrementos en la posición del rayo
  xStep = Math.cos(angle);
  yStep = Math.sin(angle);

  // Seguimos avanzando hasta encontrar una pared o salir del mapa
  while (!wallHit && distance < 300) {
    rayX += xStep;
    rayY += yStep;
    distance += 1;

    const mapX = Math.floor(rayX / tileSize);
    const mapY = Math.floor(rayY / tileSize);

    if (map[mapY] && map[mapY][mapX] === 1) {
      wallHit = true;
    }
  }

  return distance;
}

function renderScene() {
  const fov = Math.PI / 4; // Campo de visión del jugador
  const halfFov = fov / 2;
  const numRays = canvas.width; // Cantidad de rayos que vamos a lanzar
  const angleStep = fov / numRays;

  for (let i = 0; i < numRays; i++) {
    const rayAngle = player.angle - halfFov + i * angleStep;
    let distance = castRay(rayAngle);

    // Corregir el efecto de "fish-eye"
    const correctedDistance = Math.min(distance, 500) * Math.cos(rayAngle - player.angle);

    // Calcular la altura de la pared
    const wallHeight = Math.min((tileSize * 300) / correctedDistance, canvas.height);

    // Calcular el sombreado en función de la distancia
    const shadeFactor = Math.max(1 - correctedDistance / 500, 0); // Reduce la luz con la distancia
    const wallColor = `rgb(${Math.floor(139 * shadeFactor)}, ${Math.floor(69 * shadeFactor)}, ${Math.floor(19 * shadeFactor)})`; // Color marrón con sombreado

    // Dibujar la pared con sombreado
    ctx.fillStyle = wallColor;
    ctx.fillRect(i, (canvas.height / 2) - wallHeight / 2, 1, wallHeight);

    // Dibujar el suelo
    ctx.fillStyle = 'green';
    ctx.fillRect(i, (canvas.height / 2) + wallHeight / 2, 1, canvas.height / 2);
  }
}


function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Movimiento del jugador
  if (keys['ArrowUp']) {
    movePlayer(Math.cos(player.angle) * player.speed, Math.sin(player.angle) * player.speed);
  }
  if (keys['ArrowDown']) {
    movePlayer(-Math.cos(player.angle) * player.speed, -Math.sin(player.angle) * player.speed);
  }
  if (keys['ArrowLeft']) {
    player.angle -= 0.05;
  }
  if (keys['ArrowRight']) {
    player.angle += 0.05;
  }

  // Renderizar la escena 3D
  renderScene();

  // Dibujar mini mapa (2D)
  drawMiniMap();

  requestAnimationFrame(gameLoop);
}

// Manejo de teclas
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Iniciar el bucle del juego
gameLoop();
