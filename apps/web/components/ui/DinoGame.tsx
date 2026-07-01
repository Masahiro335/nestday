'use client';

import { useCallback, useEffect, useRef } from 'react';

const W = 600;
const H = 180;
const GROUND = 150;
const DINO_X = 60;
const DINO_W = 44;
const DINO_H = 47;
const GRAVITY = 0.65;
const JUMP_V = -14;
const BASE_SPEED = 5;

interface Props {
  isActive: boolean;
  onGameOver?: (score: number) => void;
}

type State = {
  dy: number;
  dvy: number;
  jumping: boolean;
  obstacles: { x: number; h: number }[];
  score: number;
  speed: number;
  frame: number;
  legFrame: number;
  nextObstacleFrame: number;
  running: boolean;
  rafId: number;
  groundOff: number;
};

function drawDino(ctx: CanvasRenderingContext2D, dy: number, leg: number, jumping: boolean) {
  const x = DINO_X;
  ctx.fillStyle = '#535353';

  // Tail
  ctx.fillRect(x - 14, dy + 20, 16, 8);
  ctx.fillRect(x - 20, dy + 24, 8, 6);

  // Body
  ctx.fillRect(x, dy + 14, 30, 24);

  // Arm
  ctx.fillRect(x + 6, dy + 22, 14, 6);

  // Head
  ctx.fillRect(x + 12, dy, 32, 20);

  // Eye white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 32, dy + 4, 8, 8);
  // Eye pupil
  ctx.fillStyle = '#535353';
  ctx.fillRect(x + 34, dy + 6, 5, 5);

  // Snout notch
  ctx.fillStyle = '#535353';
  ctx.fillRect(x + 38, dy + 14, 6, 4);

  // Legs
  ctx.fillStyle = '#535353';
  if (jumping) {
    ctx.fillRect(x + 4, dy + 36, 10, 9);
    ctx.fillRect(x + 18, dy + 36, 10, 9);
  } else if (leg === 0) {
    ctx.fillRect(x + 4, dy + 36, 10, 11);
    ctx.fillRect(x + 4, dy + 44, 14, 3);
    ctx.fillRect(x + 18, dy + 36, 10, 5);
  } else {
    ctx.fillRect(x + 4, dy + 36, 10, 5);
    ctx.fillRect(x + 18, dy + 36, 10, 11);
    ctx.fillRect(x + 18, dy + 44, 14, 3);
  }
}

function drawCactus(ctx: CanvasRenderingContext2D, x: number, h: number) {
  ctx.fillStyle = '#4a9a4a';
  const tx = x + 10;
  const tw = 12;
  // Trunk
  ctx.fillRect(tx, GROUND - h, tw, h);
  // Left arm stem (vertical)
  ctx.fillRect(tx - 10, GROUND - h + Math.floor(h * 0.1), 8, Math.floor(h * 0.3) + 4);
  // Left arm cap (horizontal)
  ctx.fillRect(tx - 10, GROUND - h + Math.floor(h * 0.1), tw, 8);
  // Right arm stem (vertical)
  ctx.fillRect(tx + tw + 2, GROUND - h + Math.floor(h * 0.25), 8, Math.floor(h * 0.3) + 4);
  // Right arm cap (horizontal)
  ctx.fillRect(tx, GROUND - h + Math.floor(h * 0.25), tw + 10, 8);
}

function drawGround(ctx: CanvasRenderingContext2D, off: number) {
  ctx.fillStyle = '#757575';
  ctx.fillRect(0, GROUND, W, 2);
  ctx.fillStyle = '#bdbdbd';
  for (let i = 0; i < 20; i++) {
    const x = ((i * 45 - off * 0.35) % W + W) % W;
    ctx.fillRect(x, GROUND + 5, 22, 2);
  }
  for (let i = 0; i < 12; i++) {
    const x = ((i * 65 + 20 - off * 0.18) % W + W) % W;
    ctx.fillRect(x, GROUND + 11, 12, 2);
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, off: number, idx: number) {
  const x = ((idx * 180 - off * 0.4 + 30) % (W + 140) + W + 140) % (W + 140) - 70;
  const y = 18 + (idx % 3) * 14;
  ctx.fillStyle = 'rgba(220,235,245,0.9)';
  ctx.beginPath();
  ctx.ellipse(x, y, 32, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 22, y - 6, 22, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - 16, y - 4, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

export default function DinoGame({ isActive, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>({
    dy: GROUND - DINO_H,
    dvy: 0,
    jumping: false,
    obstacles: [],
    score: 0,
    speed: BASE_SPEED,
    frame: 0,
    legFrame: 0,
    nextObstacleFrame: 90,
    running: false,
    rafId: 0,
    groundOff: 0,
  });
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s.jumping && s.running) {
      s.dvy = JUMP_V;
      s.jumping = true;
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    const s = stateRef.current;
    s.dy = GROUND - DINO_H;
    s.dvy = 0;
    s.jumping = false;
    s.obstacles = [];
    s.score = 0;
    s.speed = BASE_SPEED;
    s.frame = 0;
    s.legFrame = 0;
    s.nextObstacleFrame = 90;
    s.running = true;
    s.groundOff = 0;

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('touchstart', onTouch, { passive: false });

    function loop() {
      if (!s.running) return;

      s.frame++;
      s.speed = BASE_SPEED + s.frame * 0.005;
      s.score = Math.floor(s.frame / 6);
      s.groundOff += s.speed;
      if (s.frame % 8 === 0 && !s.jumping) s.legFrame ^= 1;

      // Physics
      s.dvy += GRAVITY;
      s.dy += s.dvy;
      if (s.dy >= GROUND - DINO_H) {
        s.dy = GROUND - DINO_H;
        s.dvy = 0;
        s.jumping = false;
      }

      // Spawn
      if (s.frame >= s.nextObstacleFrame) {
        const h = 30 + Math.floor(Math.random() * 40);
        s.obstacles.push({ x: W, h });
        s.nextObstacleFrame = s.frame + 60 + Math.floor(Math.random() * 50);
      }

      s.obstacles = s.obstacles
        .map((o) => ({ ...o, x: o.x - s.speed }))
        .filter((o) => o.x > -80);

      // Collision (inset hitbox — db follows dino position so jumps work)
      const dl = DINO_X + 10;
      const dr = DINO_X + DINO_W - 10;
      const dt = s.dy + 10;
      const db = s.dy + DINO_H - 4;

      for (const o of s.obstacles) {
        const ol = o.x + 6;
        const or_ = o.x + 26;
        const ot = GROUND - o.h + 6;
        if (dr > ol && dl < or_ && db > ot && dt < GROUND) {
          s.running = false;
          onGameOverRef.current?.(s.score);
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#333';
          ctx.font = 'bold 22px "Segoe UI", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
          ctx.font = '15px "Segoe UI", sans-serif';
          ctx.fillText(`スコア: ${s.score}`, W / 2, H / 2 + 16);
          return;
        }
      }

      // Draw
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#e3f2fd');
      bg.addColorStop(1, '#f5f5f5');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 4; i++) drawCloud(ctx, s.groundOff, i);
      drawGround(ctx, s.groundOff);
      for (const o of s.obstacles) drawCactus(ctx, o.x, o.h);
      drawDino(ctx, s.dy, s.legFrame, s.jumping);

      ctx.fillStyle = '#555';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${String(s.score).padStart(5, '0')}`, W - 12, 24);

      s.rafId = requestAnimationFrame(loop);
    }

    s.rafId = requestAnimationFrame(loop);

    return () => {
      s.running = false;
      cancelAnimationFrame(s.rafId);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('touchstart', onTouch);
    };
  }, [isActive, jump]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ maxWidth: '100%', display: 'block', cursor: 'pointer' }}
      onClick={jump}
    />
  );
}
