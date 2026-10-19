import React, { useRef, useEffect } from "react";

export interface PingPongDotLoaderProps {
  rows?: number;
  cols?: number;
  paddleHeight?: number;
  baseSpeed?: number;
  dotSize?: number;
  isVisible?: boolean;
}

export const PingPongDotLoader: React.FC<PingPongDotLoaderProps> = ({
  rows = 6,
  cols = 6,
  paddleHeight = 3,
  baseSpeed = 0.25,
  dotSize = 9,
  isVisible = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const gap = Math.max(2, dotSize * 0.25);
  const padding = dotSize;
  const canvasWidth = cols * dotSize + (cols - 1) * gap + padding * 2;
  const canvasHeight = rows * dotSize + (rows - 1) * gap + padding * 2;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.OffscreenCanvas) return;

    // 1. FIX THE "TWO BOXES" BUG
    // Force clear the container to kill any zombie canvases left by React HMR/Strict Mode
    container.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    canvas.style.position = "relative";
    canvas.style.zIndex = "10";
    canvas.style.backgroundColor = "#2a1b10";
    canvas.style.borderRadius = `${dotSize * 0.8}px`;
    canvas.style.border = "1px solid #c99a4a";
    canvas.style.boxShadow = "0 18px 40px -12px rgba(90, 50, 15, 0.55), inset 0 0 0 3px #3a2616";

    container.appendChild(canvas);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 2. FIX THE "NO RENDER" BUG (Blob Worker)
    // By wrapping the worker logic in a string Blob, we completely bypass Vite/Next.js 
    // file-loading rules. This guarantees the worker initializes successfully.
    const workerCode = `
      let canvas, ctx, animationId, lastTime;
      let rows, cols, paddleHeight, baseSpeed, dotSize, isVisible, prefersReducedMotion;
      let gap, padding;
      let state;

      function initGame() {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const initialAngle = (Math.random() - 0.5) * (Math.PI / 4);
        state = {
          ball: {
            x: Math.floor(cols / 2),
            y: Math.floor(rows / 2),
            dx: baseSpeed * Math.cos(initialAngle) * direction,
            dy: baseSpeed * Math.sin(initialAngle),
          },
          paddleL: { x: 0, y: (rows - paddleHeight) / 2 },
          paddleR: { x: cols - 1, y: (rows - paddleHeight) / 2 },
        };
      }

      function updatePhysics(dt) {
        const speedScale = dt / (1000 / 60);
        const maxBounceAngle = Math.PI / 3;

        state.ball.x += state.ball.dx * speedScale;
        state.ball.y += state.ball.dy * speedScale;

        // AI Paddles
        if (state.ball.dx < 0) {
          state.paddleL.y += (state.ball.y - (state.paddleL.y + paddleHeight / 2)) * 0.12 * speedScale;
        }
        if (state.ball.dx > 0) {
          state.paddleR.y += (state.ball.y - (state.paddleR.y + paddleHeight / 2)) * 0.12 * speedScale;
        }

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

        // Paddle Collisions
        const checkCollision = (paddle, isLeft) => {
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

        // Reset if ball escapes
        if (state.ball.x < -1 || state.ball.x > cols) {
          initGame();
        }
      }

      function drawDot(col, row, color, glow) {
        const x = padding + col * (dotSize + gap) + dotSize / 2;
        const y = padding + row * (dotSize + gap) + dotSize / 2;
        
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
        
        ctx.beginPath();
        ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.shadowBlur = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            drawDot(c, r, "#3d2a1a", 0);
          }
        }

        const lY = Math.round(state.paddleL.y);
        const rY = Math.round(state.paddleR.y);
        const glowSmall = dotSize * 0.6;

        for (let i = 0; i < paddleHeight; i++) {
          drawDot(state.paddleL.x, lY + i, "#ffd48a", glowSmall);
          drawDot(state.paddleR.x, rY + i, "#ffd48a", glowSmall);
        }

        const bX = Math.round(state.ball.x);
        const bY = Math.round(state.ball.y);
        drawDot(bX, bY, "#ff8a3d", dotSize * 1.5);
      }

      function loop(now) {
        if (!isVisible || prefersReducedMotion) {
          draw(); 
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
        
        animationId = self.requestAnimationFrame(loop);
      }

      self.onmessage = (e) => {
        if (e.data.type === 'INIT') {
          canvas = e.data.canvas;
          ctx = canvas.getContext('2d');
          
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
            self.cancelAnimationFrame(animationId);
            loop(performance.now());
          } else {
            self.cancelAnimationFrame(animationId);
          }
        }
      };
    `;

    // Initialize the Blob URL
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);

    workerRef.current = new Worker(workerUrl);

    const offscreenCanvas = canvas.transferControlToOffscreen();

    workerRef.current.postMessage(
      {
        type: "INIT",
        canvas: offscreenCanvas,
        rows,
        cols,
        paddleHeight,
        baseSpeed,
        dotSize,
        isVisible,
        prefersReducedMotion,
      },
      [offscreenCanvas],
    );

    return () => {
      // Cleanup on unmount
      if (workerRef.current) {
        workerRef.current.terminate();
        URL.revokeObjectURL(workerUrl); // Free up memory
      }
      if (container && canvas.parentNode) {
        container.removeChild(canvas);
      }
    };
  }, [canvasWidth, canvasHeight, rows, cols, paddleHeight, baseSpeed, dotSize]);

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "VISIBILITY", isVisible });
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      style={{ display: isVisible ? "block" : "none" }}
    />
  );
};