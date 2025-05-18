"use client";
import { Slider, Select, ActionIcon, TextInput } from "@mantine/core";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { SWATCHES, THEMES } from "@/constants";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  IconEraser,
  IconArrowBack,
  IconArrowForward,
  IconLetterT,
  IconPhoto,
} from "@tabler/icons-react";
import Link from "next/link";

// Draggable component using @dnd-kit
function DraggableLatex({ id, latex, position, onDragEnd }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    position: "absolute",
    left: position.x,
    top: position.y,
    cursor: "move",
    zIndex: 1000,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div className="p-2 bg-white/80 text-black rounded shadow-md">
        <div className="latex-content">{latex}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FFFFFF");
  const [brushSize, setBrushSize] = useState(3);
  const [reset, setReset] = useState(false);
  const [dictOfVars, setDictOfVars] = useState({});
  const [result, setResult] = useState(null);
  const [latexPositions, setLatexPositions] = useState([{ x: 10, y: 200 }]);
  const [latexExpression, setLatexExpression] = useState([]);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTool, setActiveTool] = useState("pen");
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState("dark");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isAddingText, setIsAddingText] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [uploadedImage, setUploadedImage] = useState(null);

  // Initialize drawing history
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
    setDrawingHistory([canvas.toDataURL()]);
    setHistoryIndex(0);
  }, []);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        drawImageOnCanvas(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const drawImageOnCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    // Calculate dimensions to maintain aspect ratio
    const maxWidth = canvas.width * 0.8;
    const maxHeight = canvas.height * 0.8;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = height * ratio;
    }

    if (height > maxHeight) {
      const ratio = maxHeight / height;
      height = maxHeight;
      width = width * ratio;
    }

    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;
    ctx.drawImage(img, x, y, width, height);

    saveCanvasState();
  };

  // Save canvas state to history
  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL();
      setDrawingHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(imageData);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Undo functionality
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  };

  // Redo functionality
  const redo = () => {
    if (historyIndex < drawingHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Restore canvas from history
  useEffect(() => {
    const restoreCanvasState = () => {
      const canvas = canvasRef.current;
      if (canvas && drawingHistory[historyIndex]) {
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = drawingHistory[historyIndex];
      }
    };
    restoreCanvasState();
  }, [historyIndex, drawingHistory]);

  // Add text to canvas
  const addTextToCanvas = (e) => {
    if (!isAddingText) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      
      setTextPosition({ x, y });
      
      if (textInput) {
        ctx.font = `${brushSize * 5}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText(textInput, x, y);
        saveCanvasState();
        setTextInput("");
        setIsAddingText(false);
      }
    }
  };

  // Handle MathJax rendering
  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  // Handle result changes
  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result]);

  // Handle reset
  useEffect(() => {
    if (reset) {
      resetCanvas();
      setLatexExpression([]);
      setResult(undefined);
      setDictOfVars({});
      setLatexPositions([{ x: 10, y: 200 }]);
      setUploadedImage(null);
      setReset(false);
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100;
      setDrawingHistory([canvas.toDataURL()]);
      setHistoryIndex(0);
    }
  }, [reset]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        ctx.lineCap = "round";
        ctx.lineWidth = brushSize;

        // Apply theme
        if (theme === "dark") {
          canvas.style.background = "#1a1a1a";
        } else if (theme === "light") {
          canvas.style.background = "#f5f5f5";
        } else if (theme === "grid") {
          canvas.style.background = "#ffffff";
          drawGrid(ctx, canvas.width, canvas.height);
        } else if (theme === "paper") {
          canvas.style.background = "#f0e6d2";
        }

        // Redraw uploaded image if it exists
        if (uploadedImage) {
          drawImageOnCanvas(uploadedImage);
        }
      }
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
        },
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [theme, uploadedImage]);

  // Draw grid for grid theme
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const renderLatexToCanvas = (expression, answer) => {
  // Ensure the expression doesn't already contain an equals sign
  let formattedExpression = expression;
  if (!formattedExpression.includes('=')) {
    formattedExpression = `${formattedExpression} = ${answer}`;
  } else {
    // If it already has an equals sign, make sure the answer is correct
    const parts = formattedExpression.split('=');
    formattedExpression = `${parts[0].trim()} = ${answer}`;
  }
  
  const latex = `\\(\\LARGE{${formattedExpression}}\\)`;
  setLatexExpression((prev) => [...prev, latex]);

  if (latexPositions.length <= latexExpression.length) {
    setLatexPositions((prev) => [
      ...prev,
      {
        x: prev[prev.length - 1].x + 20,
        y: prev[prev.length - 1].y + 20,
      },
    ]);
  }

  saveCanvasState();
};
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Reapply theme after reset
        if (theme === "grid") {
          drawGrid(ctx, canvas.width, canvas.height);
        }
      }
    }
  };

  const startDrawing = (e) => {
    if (isAddingText) {
      addTextToCanvas(e);
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle =
          activeTool === "eraser"
            ? theme === "dark"
              ? "#1a1a1a"
              : theme === "light"
              ? "#f5f5f5"
              : theme === "paper"
              ? "#f0e6d2"
              : "#ffffff"
            : color;

        ctx.lineWidth = brushSize;

        if (activeTool === "pen" || activeTool === "eraser") {
          ctx.beginPath();
          ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        } else {
          setStartPos({
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
        }

        setIsDrawing(true);
      }
    }
  };

  const draw = (e) => {
    if (!isDrawing || isAddingText) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle =
          activeTool === "eraser"
            ? theme === "dark"
              ? "#1a1a1a"
              : theme === "light"
              ? "#f5f5f5"
              : theme === "paper"
              ? "#f0e6d2"
              : "#ffffff"
            : color;

        ctx.lineWidth = brushSize;

        if (activeTool === "pen" || activeTool === "eraser") {
          ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          ctx.stroke();
        }
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (activeTool === "circle") {
          const radius = Math.sqrt(
            Math.pow(e.nativeEvent.offsetX - startPos.x, 2) +
            Math.pow(e.nativeEvent.offsetY - startPos.y, 2)
          );
          ctx.beginPath();
          ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (activeTool === "rectangle") {
          ctx.beginPath();
          ctx.rect(
            startPos.x,
            startPos.y,
            e.nativeEvent.offsetX - startPos.x,
            e.nativeEvent.offsetY - startPos.y
          );
          ctx.stroke();
        } else if (activeTool === "line") {
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          ctx.stroke();
        }
      }
    }

    saveCanvasState();
    setIsDrawing(false);
  };

  const runRoute = async () => {
    const canvas = canvasRef.current;

    if (canvas) {
      saveCanvasState();

      const response = await axios({
        method: "post",
        url: `api/calculate`,
        data: {
          image: canvas.toDataURL("image/png"),
          dict_of_vars: dictOfVars,
        },
      });

      const resp = await response.data;
      console.log("Response", resp);
      resp.data.forEach((data) => {
        if (data.assign === true) {
          setDictOfVars({
            ...dictOfVars,
            [data.expr]: data.result,
          });
        }
      });

      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (imageData.data[i + 3] > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      setLatexPositions((prev) => {
        const newPositions = [...prev];
        newPositions[newPositions.length - 1] = { x: centerX, y: centerY };
        return newPositions;
      });

      resp.data.forEach((data) => {
        setTimeout(() => {
          setResult({
            expression: data.expr,
            answer: data.result,
          });
        }, 1000);
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    setLatexPositions((prev) => {
      const newPositions = [...prev];
      newPositions[active.id] = {
        x: newPositions[active.id].x + delta.x,
        y: newPositions[active.id].y + delta.y,
      };
      return newPositions;
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg z-20 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setReset(true)}
            variant="outline"
            className="bg-red-600 text-white"
          >
            Clear
          </Button>

          <ActionIcon
            onClick={undo}
            disabled={historyIndex <= 0}
            variant="outline"
            size="lg"
            className="dark:bg-gray-700 dark:text-white"
          >
            <IconArrowBack size={18} />
          </ActionIcon>

          <ActionIcon
            onClick={redo}
            disabled={historyIndex >= drawingHistory.length - 1}
            variant="outline"
            size="lg"
            className="dark:bg-gray-700 dark:text-white"
          >
            <IconArrowForward size={18} />
          </ActionIcon>
        </div>

        <div className="flex items-center gap-2">
          <ActionIcon
            onClick={() => {
              setActiveTool("pen");
              setIsAddingText(false);
            }}
            variant={activeTool === "pen" ? "filled" : "outline"}
            size="lg"
            color={activeTool === "pen" ? "blue" : undefined}
            className="dark:bg-gray-700 dark:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
          </ActionIcon>

          <ActionIcon
            onClick={() => {
              setActiveTool("eraser");
              setIsAddingText(false);
            }}
            variant={activeTool === "eraser" ? "filled" : "outline"}
            size="lg"
            color={activeTool === "eraser" ? "red" : undefined}
            className="dark:bg-gray-700 dark:text-white"
          >
            <IconEraser size={18} />
          </ActionIcon>

          <ActionIcon
            onClick={() => {
              setActiveTool("text");
              setIsAddingText(true);
            }}
            variant={activeTool === "text" ? "filled" : "outline"}
            size="lg"
            color={activeTool === "text" ? "green" : undefined}
            className="dark:bg-gray-700 dark:text-white"
          >
            <IconLetterT size={18} />
          </ActionIcon>

          <ActionIcon
            onClick={() => document.getElementById('image-upload').click()}
            variant="outline"
            size="lg"
            className="dark:bg-gray-700 dark:text-white"
            title="Upload Image"
          >
            <IconPhoto size={18} />
          </ActionIcon>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        {isAddingText && (
          <TextInput
            placeholder="Enter text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-40"
          />
        )}

        <div className="flex items-center gap-2">
          <div className="w-24">
            <Slider
              value={brushSize}
              onChange={setBrushSize}
              min={1}
              max={20}
              label={`Size: ${brushSize}px`}
              className="dark:text-white"
            />
          </div>

          <div className="relative flex justify-center items-center">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />

            {showColorPicker && (
              <div className="mt-2 ml-3 p-2 bg-white dark:bg-gray-800 rounded shadow-lg z-30 grid grid-cols-6 gap-1">
                {SWATCHES.map((swatch) => (
                  <div
                    key={swatch}
                    className="w-6 h-6 rounded-full cursor-pointer border-2"
                    style={{ backgroundColor: swatch }}
                    onClick={() => {
                      setColor(swatch);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <Select
          data={THEMES.map((t) => ({
            value: t,
            label: t.charAt(0).toUpperCase() + t.slice(1),
          }))}
          value={theme}
          onChange={(value) => {
            setTheme(value);
            saveCanvasState();
          }}
          className="w-32"
          variant="filled"
          size="sm"
          radius="md"
          styles={{
            input: {
                backgroundColor: theme === 'dark' ? '#2D3748' : '#EDF2F7',
                color: theme === 'dark' ? 'white' : '#1A202C',
                borderColor: theme === 'dark' ? '#4A5568' : '#CBD5E0',
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#2D3748' : '#E2E8F0',
                },
            },
            dropdown: {
              backgroundColor: theme === 'dark' ? '#2D3748' : 'white',
              borderColor: theme === 'dark' ? '#4A5568' : '#CBD5E0',
            },
            item: {
              color: theme === 'dark' ? 'white' : '#1A202C',
              '&[data-hovered]': {
                backgroundColor: theme === 'dark' ? '#4A5568' : '#EDF2F7',
                color: theme === 'dark' ? 'white' : '#1A202C',
              },
              '&[data-selected]': {
                backgroundColor: theme === 'dark' ? '#4299E1' : '#3182CE',
                color: 'white',
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#3182CE' : '#2C5282',
                },
              },
            },
          }}
        />
        <Link href={'/how-to-use'}>
        <Button className='bg-green-600'>
          How to Use?
        </Button>
        </Link>
          <h1 className="text-black">🤖 MPad - AI Math Solver</h1>
        <Button
          onClick={runRoute}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          Calculate
        </Button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        id="canvas"
        className={`absolute top-0 left-0 w-full h-full ${
          theme === "dark"
            ? "bg-gray-900"
            : theme === "light"
            ? "bg-gray-100"
            : theme === "paper"
            ? "bg-amber-50"
            : "bg-white"
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />

      {/* Latex Results */}
      <DndContext onDragEnd={handleDragEnd}>
        {latexExpression.map((latex, index) => (
          <DraggableLatex
            key={index}
            id={index}
            latex={latex}
            position={latexPositions[index] || { x: 10, y: 200 }}
          />
        ))}
      </DndContext>

    </div>
  );
}