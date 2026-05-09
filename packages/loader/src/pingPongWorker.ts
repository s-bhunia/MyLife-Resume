// pingPongWorker.ts

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
let animationId: number;
let lastTime: number;

// Game Config
let rows: number, cols: number, paddleHeight: number, baseSpeed: number, dotSize: number;
let isVisible: boolean, prefersReducedMotion: boolean;
let gap: number, padding: number;

// Game State
let state: {
  ball: { x: number; y: number; dx: number; dy: number };
  paddleL: { x: number; y: number };
  paddleR: { x: number; y: number };
};

function initGame() {
  const getInitialBallState = () => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const initialAngle = (Math.random() - 0.5) * (Math.PI / 4);
    return {
      x: Math.floor(cols / 2),
      y: Math.floor(rows / 2),
      dx: baseSpeed * Math.cos(initialAngle) * direction,
      dy: baseSpeed * Math.sin(initialAngle),
    };
  };

  state = {
    ball: getInitialBallState(),
    paddleL: { x: 0, y: (rows - paddleHeight) / 2 },
    paddleR: { x: cols - 1, y: (rows - paddleHeight) / 2 },
  };
}

function updatePhysics(dt: number) {
  const speedScale = dt / (1000 / 60);
  const maxBounceAngle = Math.PI / 3;

  state.ball.x += state.ball.dx * speedScale;
  state.ball.y += state.ball.dy * speedScale;

  // AI Paddle Movement
  if (state.ball.dx < 0) {
    state.paddleL.y += (state.ball.y - (state.paddleL.y + paddleHeight / 2)) * 0.12 * speedScale;
  }
  if (state.ball.dx > 0) {
    state.paddleR.y += (state.ball.y - (state.paddleR.y + paddleHeight / 2)) * 0.12 * speedScale;
  }

  // Clamp Paddles
  state.paddleL.y = Math.max(0, Math.min(state.paddleL.y, rows - paddleHeight));
  state.paddleR.y = Math.max(0, Math.min(state.paddleR.y, rows - paddleHeight));

  // Wall Bounces
  if (state.ball.y <= 0) {
    state.ball.y = 0;
    state.ball.dy *= -1;
  } else if (state.ball.y >= rows - 1) {
    state.ball.y = rows - 1;
    state.ball.dy *= -1;
  }

  // Collision Detection
  const checkCollision = (paddle: { x: number; y: number }, isLeft: boolean) => {
    const ballGridX = Math.round(state.ball.x);
    if ((isLeft && ballGridX <= paddle.x) || (!isLeft && ballGridX >= paddle.x)) {
      if (state.ball.y >= paddle.y - 0.5 && state.ball.y <= paddle.y + paddleHeight + 0.5) {
        const intersectY = paddle.y + paddleHeight / 2 - state.ball.y;
        const normalizedIntersect = intersectY / (paddleHeight / 2);
        const bounceAngle = normalizedIntersect * maxBounceAngle;
        const direction = isLeft ? 1 : -1;
        const angleJitter = (Math.random() - 0.5) * 0.1;

        state.ball.dx = baseSpeed * Math.cos(bounceAngle + angleJitter) * direction;
        state.ball.dy = baseSpeed * -Math.sin(bounceAngle + angleJitter);
        state.ball.x = isLeft ? paddle.x + 1 : paddle.x - 1;
      }
    }
  };

  checkCollision(state.paddleL, true);
  checkCollision(state.paddleR, false);

  // Reset if out of bounds
  if (state.ball.x < -1 || state.ball.x > cols) {
    initGame();
  }
}

function drawDot(col: number, row: number, color: string, glow: number) {
  const x = padding + col * (dotSize + gap) + dotSize / 2;
  const y = padding + row * (dotSize + gap) + dotSize / 2;

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  
  ctx.beginPath();
  // Using 40% border radius equivalent
  ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw inactive grid
  ctx.shadowBlur = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      drawDot(c, r, "#1a1a24", 0);
    }
  }

  // Draw Paddles
  const lY = Math.round(state.paddleL.y);
  const rY = Math.round(state.paddleR.y);
  const glowSmall = dotSize * 0.6;

  for (let i = 0; i < paddleHeight; i++) {
    drawDot(state.paddleL.x, lY + i, "#ffffff", glowSmall);
    drawDot(state.paddleR.x, rY + i, "#ffffff", glowSmall);
  }

  // Draw Ball
  const bX = Math.round(state.ball.x);
  const bY = Math.round(state.ball.y);
  drawDot(bX, bY, "#ffffff", dotSize * 1.5);
}

function loop(now: number) {
  if (!isVisible || prefersReducedMotion) {
    draw(); // Draw static frame once
    return;
  }

  const dt = now - lastTime;
  const targetFPS = 30; 
  const frameDuration = 1000 / targetFPS;

  if (dt >= frameDuration) {
    updatePhysics(dt);
    draw();
    lastTime = now;
  }
  
  animationId = requestAnimationFrame(loop);
}

// Listen for messages from the React component
self.onmessage = (e: MessageEvent) => {
  if (e.data.type === 'INIT') {
    canvas = e.data.canvas;
    ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    
    // Assign variables
    ({ rows, cols, paddleHeight, baseSpeed, dotSize, isVisible, prefersReducedMotion } = e.data);
    gap = Math.max(2, dotSize * 0.25);
    padding = dotSize;

    initGame();
    lastTime = performance.now();
    loop(performance.now());
  } 
  
  if (e.data.type === 'VISIBILITY') {
    isVisible = e.data.isVisible;
    if (isVisible && !prefersReducedMotion) {
      lastTime = performance.now();
      cancelAnimationFrame(animationId);
      loop(performance.now());
    } else {
      cancelAnimationFrame(animationId);
    }
  }
};