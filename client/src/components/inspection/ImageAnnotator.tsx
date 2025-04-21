import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Annotation } from '@shared/schema';
import {
  Pencil,
  Circle,
  Square,
  ArrowUpRight,
  Type,
  Ruler,
  Undo2,
  Save,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageAnnotatorProps {
  imageUrl: string;
  initialAnnotations?: Annotation[];
  onSave: (annotations: Annotation[]) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

type AnnotationTool = 'arrow' | 'circle' | 'rectangle' | 'text' | 'measurement' | null;
type Point = { x: number; y: number };

const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  imageUrl,
  initialAnnotations = [],
  onSave,
  onCancel,
  readOnly = false
}) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [currentTool, setCurrentTool] = useState<AnnotationTool>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [measurementValue, setMeasurementValue] = useState<number | null>(null);
  const [measurementUnit, setMeasurementUnit] = useState('m');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Current annotation color
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000'];
  
  // Load image and initialize canvas
  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    
    if (!image || !canvas) return;
    
    const handleImageLoad = () => {
      if (!canvas || !image) return;
      
      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw existing annotations
      drawAnnotations();
    };
    
    image.onload = handleImageLoad;
    
    // If image is already loaded
    if (image.complete) {
      handleImageLoad();
    }
  }, [imageUrl]);
  
  // Redraw annotations when they change
  useEffect(() => {
    drawAnnotations();
  }, [annotations, currentColor]);
  
  // Draw all annotations on the canvas
  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    
    if (!ctx || !canvas || !image) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each annotation
    annotations.forEach(annotation => {
      drawAnnotation(ctx, annotation);
    });
    
    // Draw current annotation in progress
    if (isDrawing && startPoint && currentPoints.length > 0) {
      const tempAnnotation: Annotation = {
        type: currentTool || 'arrow',
        points: [startPoint, ...currentPoints],
        color: currentColor
      };
      
      if (currentTool === 'text' && textInput) {
        tempAnnotation.text = textInput;
      }
      
      if (currentTool === 'measurement' && measurementValue !== null) {
        tempAnnotation.measurement = measurementValue;
        tempAnnotation.unit = measurementUnit;
      }
      
      drawAnnotation(ctx, tempAnnotation);
    }
  };
  
  // Draw a single annotation
  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
    const { type, points, color = '#FF0000', text, measurement, unit } = annotation;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.font = '16px Arial';
    
    switch (type) {
      case 'arrow':
        if (points.length < 2) return;
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
        const headLength = 15;
        
        ctx.beginPath();
        ctx.moveTo(points[1].x, points[1].y);
        ctx.lineTo(
          points[1].x - headLength * Math.cos(angle - Math.PI / 6),
          points[1].y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          points[1].x - headLength * Math.cos(angle + Math.PI / 6),
          points[1].y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'circle':
        if (points.length < 2) return;
        
        const radius = Math.sqrt(
          Math.pow(points[1].x - points[0].x, 2) + Math.pow(points[1].y - points[0].y, 2)
        );
        
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
        
      case 'rectangle':
        if (points.length < 2) return;
        
        const width = points[1].x - points[0].x;
        const height = points[1].y - points[0].y;
        
        ctx.beginPath();
        ctx.rect(points[0].x, points[0].y, width, height);
        ctx.stroke();
        break;
        
      case 'text':
        if (points.length < 1 || !text) return;
        
        ctx.fillText(text, points[0].x, points[0].y);
        break;
        
      case 'measurement':
        if (points.length < 2 || measurement === undefined) return;
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        
        // Draw measurement text
        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2;
        const measurementText = `${measurement} ${unit || 'm'}`;
        
        // Draw background for text
        const textMetrics = ctx.measureText(measurementText);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          midX - textMetrics.width / 2 - 5,
          midY - 10,
          textMetrics.width + 10,
          20
        );
        
        // Draw text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(measurementText, midX - textMetrics.width / 2, midY + 5);
        break;
    }
  };
  
  // Handle mouse down event
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !currentTool) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentPoints([{ x, y }]);
    
    if (currentTool === 'text') {
      setTextPosition({ x, y });
    }
  };
  
  // Handle mouse move event
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !isDrawing || !currentTool) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPoints([{ x, y }]);
    drawAnnotations();
  };
  
  // Handle mouse up event
  const handleMouseUp = () => {
    if (readOnly || !isDrawing || !currentTool || !startPoint) return;
    
    if (currentTool === 'text') {
      // For text, we show an input field
      return;
    }
    
    if (currentTool === 'measurement') {
      // For measurement, we show an input field for the measurement value
      const endPoint = currentPoints[0];
      if (!endPoint) return;
      
      // Calculate pixel distance
      const distance = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      );
      
      // Set a default measurement based on pixel distance
      // This is just a placeholder - in a real app, you'd want to calibrate this
      setMeasurementValue(parseFloat((distance / 10).toFixed(1)));
      return;
    }
    
    // For other tools, add the annotation immediately
    const newAnnotation: Annotation = {
      type: currentTool,
      points: [startPoint, ...currentPoints],
      color: currentColor
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoints([]);
  };
  
  // Add text annotation
  const addTextAnnotation = () => {
    if (!textPosition || !textInput) return;
    
    const newAnnotation: Annotation = {
      type: 'text',
      points: [textPosition],
      text: textInput,
      color: currentColor
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setTextInput('');
    setTextPosition(null);
    setIsDrawing(false);
    setCurrentTool(null);
  };
  
  // Add measurement annotation
  const addMeasurementAnnotation = () => {
    if (!startPoint || !currentPoints[0] || measurementValue === null) return;
    
    const newAnnotation: Annotation = {
      type: 'measurement',
      points: [startPoint, currentPoints[0]],
      measurement: measurementValue,
      unit: measurementUnit,
      color: currentColor
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setMeasurementValue(null);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoints([]);
    setCurrentTool(null);
  };
  
  // Undo last annotation
  const handleUndo = () => {
    if (annotations.length === 0) return;
    setAnnotations(annotations.slice(0, -1));
  };
  
  // Clear all annotations
  const handleClear = () => {
    setAnnotations([]);
  };
  
  // Handle save
  const handleSave = () => {
    onSave(annotations);
  };
  
  return (
    <div className="flex flex-col space-y-4" ref={containerRef}>
      {/* Hidden image for reference */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Original"
        className="hidden"
      />
      
      {/* Canvas for drawing */}
      <div className="relative border rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt="Annotation base"
          className="max-w-full h-auto"
          style={{ maxHeight: '70vh' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {/* Text input overlay */}
        {textPosition && (
          <div
            className="absolute bg-background/90 p-2 rounded shadow-md"
            style={{
              left: textPosition.x,
              top: textPosition.y + 20,
              zIndex: 10
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-40"
              placeholder="Digite o texto..."
              autoFocus
            />
            <div className="flex justify-end mt-2 space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTextPosition(null);
                  setTextInput('');
                  setIsDrawing(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={addTextAnnotation}
                disabled={!textInput}
              >
                Adicionar
              </Button>
            </div>
          </div>
        )}
        
        {/* Measurement input overlay */}
        {measurementValue !== null && (
          <div className="absolute bg-background/90 p-2 rounded shadow-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={measurementValue}
                onChange={(e) => setMeasurementValue(parseFloat(e.target.value))}
                className="border rounded px-2 py-1 text-sm w-20"
                step="0.1"
                min="0"
                autoFocus
              />
              <select
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="m">metros</option>
                <option value="cm">centímetros</option>
                <option value="mm">milímetros</option>
              </select>
            </div>
            <div className="flex justify-end mt-2 space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMeasurementValue(null);
                  setIsDrawing(false);
                  setStartPoint(null);
                  setCurrentPoints([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={addMeasurementAnnotation}
              >
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {!readOnly && (
        <>
          {/* Annotation tools */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex border rounded-md overflow-hidden">
              <Button
                type="button"
                variant={currentTool === 'arrow' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setCurrentTool('arrow')}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={currentTool === 'circle' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setCurrentTool('circle')}
              >
                <Circle className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={currentTool === 'rectangle' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setCurrentTool('rectangle')}
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={currentTool === 'text' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setCurrentTool('text')}
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={currentTool === 'measurement' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => setCurrentTool('measurement')}
              >
                <Ruler className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Color picker */}
            <div className="flex border rounded-md p-1 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "w-5 h-5 rounded-full",
                    currentColor === color && "ring-2 ring-offset-1 ring-primary"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </div>
            
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={annotations.length === 0}
              >
                <Undo2 className="h-4 w-4 mr-1" />
                Desfazer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={annotations.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageAnnotator;