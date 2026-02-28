import React, { useEffect, useRef, useState } from "react";

export interface PingPongDotLoaderProps {
  rows?: number;
  cols?: number;
  paddleHeight?: number;
  baseSpeed?: number;
  dotSize?: number;
}

export const PingPongDotLoader: React.FC<PingPongDotLoaderProps> = ({
  rows = 6,
  cols = 6,
  paddleHeight = 3,
  baseSpeed = 0.25,
  dotSize = 9,
}) => {
  const colorInactive = "#1a1a24";
  const colorBall = "#ffffff";
  const colorPaddle = "#ffffff";

  const gapSize = Math.max(2, dotSize * 0.25);
  const glowSmall = dotSize * 0.6;
  const glowLarge = dotSize * 1.5;

  const cellRefs = useRef<(HTMLDivElement | null)[][]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Trigger animations shortly after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (
    cellRefs.current.length !== rows ||
    cellRefs.current[0]?.length !== cols
  ) {
    cellRefs.current = Array.from({ length: rows }, () =>
      Array(cols).fill(null),
    );
  }

  function getInitialBallState() {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const initialAngle = (Math.random() - 0.5) * (Math.PI / 4);
    return {
      x: Math.floor(cols / 2),
      y: Math.floor(rows / 2),
      dx: baseSpeed * Math.cos(initialAngle) * direction,
      dy: baseSpeed * Math.sin(initialAngle),
    };
  }

  const gameState = useRef({
    ball: getInitialBallState(),
    paddleL: { x: 1, y: (rows - paddleHeight) / 2 },
    paddleR: { x: cols - 2, y: (rows - paddleHeight) / 2 },
  });

  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const state = gameState.current;
    const maxBounceAngle = Math.PI / 3;

    state.paddleL.x = 0;
    state.paddleR.x = cols - 1;

    const resetBall = () => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const initialAngle = (Math.random() - 0.5) * (Math.PI / 4);
      state.ball.x = Math.floor(cols / 2);
      state.ball.y = Math.floor(rows / 2);
      state.ball.dx = baseSpeed * Math.cos(initialAngle) * direction;
      state.ball.dy = baseSpeed * Math.sin(initialAngle);
    };

    if (
      state.ball.x < 0 ||
      state.ball.x >= cols ||
      state.ball.y < 0 ||
      state.ball.y >= rows ||
      (state.ball.dx === 0 && state.ball.dy === 0)
    ) {
      resetBall();
    }

    let lastTime = performance.now();
    const targetFPS = 60;
    const frameDuration = 1000 / targetFPS;

    const updatePhysics = (dt: number) => {
      const speedScale = dt / (1000 / 60);
      state.ball.x += state.ball.dx * speedScale;
      state.ball.y += state.ball.dy * speedScale;

      if (state.ball.dx < 0) {
        state.paddleL.y +=
          (state.ball.y - (state.paddleL.y + paddleHeight / 2)) *
          0.12 *
          speedScale;
      }
      if (state.ball.dx > 0) {
        state.paddleR.y +=
          (state.ball.y - (state.paddleR.y + paddleHeight / 2)) *
          0.12 *
          speedScale;
      }

      state.paddleL.y = Math.max(
        0,
        Math.min(state.paddleL.y, rows - paddleHeight),
      );
      state.paddleR.y = Math.max(
        0,
        Math.min(state.paddleR.y, rows - paddleHeight),
      );

      if (state.ball.y <= 0) {
        state.ball.y = 0;
        state.ball.dy *= -1;
      } else if (state.ball.y >= rows - 1) {
        state.ball.y = rows - 1;
        state.ball.dy *= -1;
      }

      const checkCollision = (
        paddle: { x: number; y: number },
        isLeft: boolean,
      ) => {
        const ballGridX = Math.round(state.ball.x);
        if (
          (isLeft && ballGridX <= paddle.x) ||
          (!isLeft && ballGridX >= paddle.x)
        ) {
          if (
            state.ball.y >= paddle.y - 0.5 &&
            state.ball.y <= paddle.y + paddleHeight + 0.5
          ) {
            const intersectY = paddle.y + paddleHeight / 2 - state.ball.y;
            const normalizedIntersect = intersectY / (paddleHeight / 2);
            const bounceAngle = normalizedIntersect * maxBounceAngle;
            const direction = isLeft ? 1 : -1;
            const angleJitter = (Math.random() - 0.5) * 0.1;

            state.ball.dx =
              baseSpeed * Math.cos(bounceAngle + angleJitter) * direction;
            state.ball.dy = baseSpeed * -Math.sin(bounceAngle + angleJitter);
            state.ball.x = isLeft ? paddle.x + 1 : paddle.x - 1;
          }
        }
      };

      checkCollision(state.paddleL, true);
      checkCollision(state.paddleR, false);

      if (state.ball.x < -1 || state.ball.x > cols) resetBall();
    };

    const draw = () => {
      const cells = cellRefs.current;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (cells[r]?.[c]) {
            cells[r][c]!.style.backgroundColor = colorInactive;
            cells[r][c]!.style.boxShadow = "none";
          }
        }
      }

      const lY = Math.round(state.paddleL.y);
      const rY = Math.round(state.paddleR.y);

      for (let i = 0; i < paddleHeight; i++) {
        if (cells[lY + i]?.[state.paddleL.x]) {
          cells[lY + i][state.paddleL.x]!.style.backgroundColor = colorPaddle;
          cells[lY + i][state.paddleL.x]!.style.boxShadow =
            `0 0 ${glowSmall}px ${colorPaddle}`;
        }
        if (cells[rY + i]?.[state.paddleR.x]) {
          cells[rY + i][state.paddleR.x]!.style.backgroundColor = colorPaddle;
          cells[rY + i][state.paddleR.x]!.style.boxShadow =
            `0 0 ${glowSmall}px ${colorPaddle}`;
        }
      }

      const bX = Math.round(state.ball.x);
      const bY = Math.round(state.ball.y);
      if (cells[bY]?.[bX]) {
        cells[bY][bX]!.style.backgroundColor = colorBall;
        cells[bY][bX]!.style.boxShadow =
          `0 0 ${glowSmall}px ${colorBall}, 0 0 ${glowLarge}px ${colorBall}`;
      }
    };

    const loop = (now: number) => {
      const dt = now - lastTime;
      if (dt >= frameDuration) {
        updatePhysics(dt);
        draw();
        lastTime = now;
      } else {
        draw();
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    lastTime = performance.now();
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [rows, cols, paddleHeight, baseSpeed, dotSize, glowSmall, glowLarge]);

  // Social Links Data (side: -1 is left, 1 is right)
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com",
      side: -1,
      yOffset: -50,
      delay: "0.1s",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com",
      side: -1,
      yOffset: 50,
      delay: "0.2s",
    },
    {
      name: "YouTube",
      url: "https://youtube.com",
      side: 1,
      yOffset: -50,
      delay: "0.3s",
    },
    {
      name: "Twitter",
      url: "https://twitter.com",
      side: 1,
      yOffset: 50,
      delay: "0.4s",
    },
  ];

  return (
    <div
      style={{
        // Purely the game board styling now
        position: "relative",
        zIndex: 10, // Keeps the board above the icons
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${dotSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${dotSize}px)`,
        gap: `${Math.max(2, dotSize * 0.25)}px`,
        padding: `${dotSize}px`,
        backgroundColor: "#050508",
        borderRadius: `${dotSize * 0.8}px`,
        border: "1px solid #1f1f2e",
        boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
      }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <div
            key={`${r}-${c}`}
            ref={(el) => {
              if (cellRefs.current[r]) cellRefs.current[r][c] = el;
            }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "40%",
              backgroundColor: "#1a1a24",
              transition: "background-color 0.15s ease, box-shadow 0.15s ease",
            }}
          />
        )),
      )}
    </div>
  );
};
