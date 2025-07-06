import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, RefreshCw, ArrowUp, ArrowDown, ArrowRight, Maximize2, Minimize2 } from "lucide-react";

const mazeRows = 10;
const mazeCols = 10;
const cellSize = 40; // base cell size for drawing

interface Cell {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  visited: boolean;
}

interface Position {
  x: number;
  y: number;
}

const generateMaze = (): Cell[][] => {
  const maze: Cell[][] = Array.from({ length: mazeRows }, () =>
    Array.from({ length: mazeCols }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
      visited: false,
    }))
  );

  const stack: Position[] = [];
  const start: Position = { x: 0, y: 0 };
  maze[start.y][start.x].visited = true;
  stack.push(start);

  const directions = [
    { dx: 0, dy: -1, dir: "top", opp: "bottom" },
    { dx: 1, dy: 0, dir: "right", opp: "left" },
    { dx: 0, dy: 1, dir: "bottom", opp: "top" },
    { dx: -1, dy: 0, dir: "left", opp: "right" },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { x, y } = current;
    const neighbors = directions
      .map(({ dx, dy, dir, opp }) => {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx >= 0 &&
          nx < mazeCols &&
          ny >= 0 &&
          ny < mazeRows &&
          !maze[ny][nx].visited
        ) {
          return { nx, ny, dir, opp };
        }
        return null;
      })
      .filter(Boolean);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)]!;
      maze[y][x][next.dir as keyof Cell] = false;
      maze[next.ny][next.nx][next.opp as keyof Cell] = false;
      maze[next.ny][next.nx].visited = true;
      stack.push({ x: next.nx, y: next.ny });
    } else {
      stack.pop();
    }
  }

  return maze;
};

interface MazeEscapeProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

const MazeEscape: React.FC<MazeEscapeProps> = ({ onBack, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gameCardRef = useRef<HTMLDivElement>(null);
  const [maze, setMaze] = useState<Cell[][]>(generateMaze());
  const [player, setPlayer] = useState<Position>({ x: 0, y: 0 });
  const [gameWon, setGameWon] = useState(false);
  const [canvasSize, setCanvasSize] = useState<number>(mazeCols * cellSize);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive canvas size (handle fullscreen and normal)
  useEffect(() => {
    const handleResize = () => {
      let size;
      if (isFullscreen && gameCardRef.current) {
        // Fix to 60vh for both width and height in fullscreen
        const vh = window.innerHeight * 0.6;
        size = vh;
      } else if (wrapperRef.current) {
        size = Math.min(
          wrapperRef.current.offsetWidth,
          window.innerHeight * 0.5,
          mazeCols * cellSize
        );
      } else {
        size = mazeCols * cellSize;
      }
      setCanvasSize(size);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isFullscreen]);

  useEffect(() => {
    drawMaze();
    if (gameWon) {
      onComplete && onComplete(true, 100);
    }
  }, [player, maze, gameWon, canvasSize]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => handleMove(e.key);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const drawMaze = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive cell size
    const size = canvasSize;
    const cell = size / mazeCols;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, size, size);

    maze.forEach((row, y) => {
      row.forEach((cellData, x) => {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        if (cellData.top) {
          ctx.beginPath();
          ctx.moveTo(x * cell, y * cell);
          ctx.lineTo((x + 1) * cell, y * cell);
          ctx.stroke();
        }
        if (cellData.right) {
          ctx.beginPath();
          ctx.moveTo((x + 1) * cell, y * cell);
          ctx.lineTo((x + 1) * cell, (y + 1) * cell);
          ctx.stroke();
        }
        if (cellData.bottom) {
          ctx.beginPath();
          ctx.moveTo(x * cell, (y + 1) * cell);
          ctx.lineTo((x + 1) * cell, (y + 1) * cell);
          ctx.stroke();
        }
        if (cellData.left) {
          ctx.beginPath();
          ctx.moveTo(x * cell, y * cell);
          ctx.lineTo(x * cell, (y + 1) * cell);
          ctx.stroke();
        }
      });
    });

    // Player
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(
      player.x * cell + cell * 0.125,
      player.y * cell + cell * 0.125,
      cell * 0.75,
      cell * 0.75
    );

    // Goal
    ctx.fillStyle = "#facc15";
    ctx.fillRect(
      (mazeCols - 1) * cell + cell * 0.25,
      (mazeRows - 1) * cell + cell * 0.25,
      cell * 0.5,
      cell * 0.5
    );
  };

  const handleMove = (direction: string) => {
    if (gameWon) return;
    const { x, y } = player;
    const cell = maze[y][x];
    let newX = x;
    let newY = y;

    if ((direction === "ArrowUp" || direction === "up") && !cell.top) newY--;
    if ((direction === "ArrowDown" || direction === "down") && !cell.bottom)
      newY++;
    if ((direction === "ArrowLeft" || direction === "left") && !cell.left)
      newX--;
    if ((direction === "ArrowRight" || direction === "right") && !cell.right)
      newX++;

    if (newX !== x || newY !== y) {
      setPlayer({ x: newX, y: newY });
      if (newX === mazeCols - 1 && newY === mazeRows - 1) {
        setGameWon(true);
      }
    }
  };

  const handleRestart = () => {
    setMaze(generateMaze());
    setPlayer({ x: 0, y: 0 });
    setGameWon(false);
  };

  // Fullscreen handlers
  const handleFullscreen = () => {
    if (!isFullscreen && gameCardRef.current) {
      if (gameCardRef.current.requestFullscreen) {
        gameCardRef.current.requestFullscreen();
      } else if ((gameCardRef.current as any).webkitRequestFullscreen) {
        (gameCardRef.current as any).webkitRequestFullscreen();
      }
    } else if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement
        )
      );
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFullscreen}
              className="flex items-center justify-center p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              )}
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white text-sm font-medium transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* Game Card */}
        <div
          ref={gameCardRef}
          className={`relative bg-gradient-to-br from-white via-indigo-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl dark:shadow-gray-900/40 border border-gray-200 dark:border-gray-700 mb-6 ${
            isFullscreen ? "w-screen h-screen max-w-none max-h-none rounded-none p-0 sm:p-0 flex flex-col" : ""
          }`}
          style={isFullscreen ? { zIndex: 50 } : {}}
        >
          {/* Fullscreen overlay controls */}
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-50 flex space-x-2">
              <button
                onClick={handleFullscreen}
                className="flex items-center justify-center p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center justify-center p-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white transition"
                title="Restart"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}
          {/* Game name always at the top */}
          <div className={`${isFullscreen ? "w-full flex-none pt-8 pb-4 bg-transparent" : ""}`}>
            <h1 className="text-4xl font-bold mb-4 text-center">Maze Escape</h1>
          </div>
          {/* Center game and controls in fullscreen */}
          <div className={`flex flex-col items-center w-full h-full ${isFullscreen ? "justify-center flex-1" : ""}`}>
            <div className={`w-full flex justify-center items-center h-full ${isFullscreen ? "flex-1" : ""}`} ref={wrapperRef}>
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  width: isFullscreen ? "60vh" : "100%",
                  height: isFullscreen ? "60vh" : "auto",
                  maxWidth: isFullscreen ? "60vh" : "100%",
                  maxHeight: isFullscreen ? "60vh" : "60vh",
                  aspectRatio: "1 / 1",
                  display: "block",
                  backgroundColor: "#0f172a",
                }}
                className="border-4 border-blue-600 rounded-lg shadow-lg mb-4 bg-slate-900"
              ></canvas>
            </div>
            {/* Gamepad D-pad controls */}
            <div className={`flex justify-center mb-4 ${isFullscreen ? "w-full" : ""}`}>
              <div className="grid grid-cols-3 grid-rows-3 gap-2 w-32 h-32 mx-auto">
                <div></div>
                <button
                  onClick={() => handleMove("up")}
                  aria-label="Up"
                  className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded shadow w-full h-full text-white text-2xl"
                >
                  <ArrowUp className="w-7 h-7" />
                </button>
                <div></div>
                <button
                  onClick={() => handleMove("left")}
                  aria-label="Left"
                  className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded shadow w-full h-full text-white text-2xl"
                >
                  <ArrowLeft className="w-7 h-7" />
                </button>
                <div></div>
                <button
                  onClick={() => handleMove("right")}
                  aria-label="Right"
                  className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded shadow w-full h-full text-white text-2xl"
                >
                  <ArrowRight className="w-7 h-7" />
                </button>
                <div></div>
                <button
                  onClick={() => handleMove("down")}
                  aria-label="Down"
                  className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded shadow w-full h-full text-white text-2xl"
                >
                  <ArrowDown className="w-7 h-7" />
                </button>
                <div></div>
              </div>
            </div>
          </div>
          {gameWon && (
            <p className="text-green-400 text-xl font-medium animate-pulse mb-4 text-center">
              You escaped the maze!
            </p>
          )}
        </div>

        {/* How to Play / Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            🌀 How to Play
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Use arrow keys or the on-screen buttons to navigate the maze. Reach
            the yellow square to escape!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MazeEscape;
