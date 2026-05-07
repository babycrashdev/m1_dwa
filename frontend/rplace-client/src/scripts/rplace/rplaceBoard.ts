import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRPlaceStore } from '../../stores/rplace';
import { useAuthStore } from '../../stores/auth';
import { useBrushPanelStore } from '../../stores/rplace/brushPanel';

export function useRPlaceBoard() {
  const store = useRPlaceStore();
  const authStore = useAuthStore();
  const brushStore = useBrushPanelStore();
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrame: number;


  const offscreenCanvas = document.createElement('canvas');
  let offscreenCtx: CanvasRenderingContext2D | null = null;

  const setupBuffer = () => {
    offscreenCanvas.width = store.gridSize;
    offscreenCanvas.height = store.gridSize;
    offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });
  };

  const updateBuffer = () => {
    if (!offscreenCtx) return;
    offscreenCtx.fillStyle = '#ffffff';
    offscreenCtx.fillRect(0, 0, store.gridSize, store.gridSize);

    for (let i = 0; i < store.pixels.length; i++) {
      const x = i % store.gridSize;
      const y = Math.floor(i / store.gridSize);
      const pixel = store.pixels[i];
      if (pixel && pixel.color && pixel.color !== '#ffffff') {
        offscreenCtx.fillStyle = pixel.color;
        offscreenCtx.fillRect(x, y, 1, 1);
      }
    }
  };

  const updatePixelOnBuffer = (x: number, y: number, color: string) => {
    if (!offscreenCtx || !color) return;
    offscreenCtx.fillStyle = color;
    offscreenCtx.fillRect(x, y, 1, 1);
  };

  watch(() => store.isInitialLoaded, (loaded) => {
    if (loaded) updateBuffer();
  });

  watch(() => authStore.token, () => {
    console.log('Mise à jour WebSocket');
    store.disconnectWebSocket();
    store.connectWebSocket();
  });

  store.$onAction(({ name, args, after }) => {
    if (name === 'placePixel') {
      after(() => {
        const [x, y] = args as [number, number];
        updatePixelOnBuffer(x, y, store.selectedColor);
      });
    } else if (name === 'updatePixelFromWS') {
      after(() => {
        const [data] = args as [any];
        if (Array.isArray(data)) {
          data.forEach((p: any) => updatePixelOnBuffer(p.x, p.y, p.color));
        } else {
          updatePixelOnBuffer(data.x, data.y, data.color);
        }
      });
    }
  });

  const camera = {
    x: 0,
    y: 0,
    scale: 10,
    isDragging: false,
    dragMoved: false,
    lastMouseX: 0,
    lastMouseY: 0
  };

  const overviewImage = new Image();
  //overviewImage.src = '/local/FondTemp2.png';
  let isImageLoaded = false;
  overviewImage.onload = () => { isImageLoaded = true; };

  const mousePos = ref({ x: 0, y: 0 });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Réalisé et débuggé grâce à l'IA
  const draw = () => {
    if (!ctx || !canvasRef.value) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.value.getBoundingClientRect();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasRef.value.width / dpr, canvasRef.value.height / dpr);
    
    ctx.translate(Math.round(rect.width / 2 + camera.x), Math.round(rect.height / 2 + camera.y));
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-store.gridSize / 2, -store.gridSize / 2);

    const copyWidth = store.gridSize;
    const viewWidth = rect.width / camera.scale;
    const startCopy = Math.floor((-camera.x / camera.scale - viewWidth / 2) / copyWidth);
    const endCopy = Math.ceil((-camera.x / camera.scale + viewWidth / 2) / copyWidth);

    for (let i = startCopy; i <= endCopy; i++) {
      const offsetX = i * store.gridSize;
      
      if (camera.scale < 5 && isImageLoaded) {
        ctx.imageSmoothingEnabled = true;
      } else {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offscreenCanvas, offsetX, 0, store.gridSize + 0.15, store.gridSize);

        if (store.hoveredPixel.x !== -1 && authStore.isAuthenticated && store.cooldownSeconds === 0) {
          ctx.save();
          ctx.translate(offsetX, 0);
          ctx.fillStyle = store.selectedColor;
          ctx.globalAlpha = 0.5;

          if (brushStore.isBrushActive) {
            const offset = Math.floor(brushStore.brushSize / 2);
            const cx = store.hoveredPixel.x;
            const cy = Math.max(offset, Math.min(store.hoveredPixel.y, store.gridSize - 1 - offset));

            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.1;
            for (let dy = -offset; dy <= offset; dy++) {
              for (let dx = -offset; dx <= offset; dx++) {
                const nx = ((cx + dx) % store.gridSize + store.gridSize) % store.gridSize;
                const ny = cy + dy;
                ctx.fillRect(nx + 0.1, ny + 0.1, 0.8, 0.8);
                ctx.strokeRect(nx, ny, 1, 1);
              }
            }
            ctx.restore();
          } else {
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.1;
            ctx.fillRect(store.hoveredPixel.x + 0.1, store.hoveredPixel.y + 0.1, 0.8, 0.8);
            ctx.strokeRect(store.hoveredPixel.x, store.hoveredPixel.y, 1, 1);
            ctx.restore();
          }
          ctx.restore();
        }
      }

    }

    animationFrame = requestAnimationFrame(draw);
  };

  // Réalisé et débuggé grâce à l'IA
  const handleResize = () => {
    if (canvasRef.value) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvasRef.value.parentElement?.getBoundingClientRect();
      if (rect) {
        canvasRef.value.width = rect.width * dpr;
        canvasRef.value.height = rect.height * dpr;
        canvasRef.value.style.width = `${rect.width}px`;
        canvasRef.value.style.height = `${rect.height}px`;
      }
    }
  };

  // Réalisé et débuggé grâce à l'IA
  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      camera.isDragging = true;
      camera.dragMoved = false;
      camera.lastMouseX = e.clientX;
      camera.lastMouseY = e.clientY;
    }
  };

  // Réalisé et débuggé grâce à l'IA
  const handleMouseMove = (e: MouseEvent) => {
    mousePos.value = { x: e.clientX, y: e.clientY };
    const { x, y } = screenToGrid(e.clientX, e.clientY);
    if (x >= 0 && x < store.gridSize && y >= 0 && y < store.gridSize) {
      store.hoveredPixel = { x, y };
    } else {
      store.hoveredPixel = { x: -1, y: -1 };
    }

    if (camera.isDragging && canvasRef.value) {
      const rect = canvasRef.value.getBoundingClientRect();
      const dx = e.clientX - camera.lastMouseX;
      const dy = e.clientY - camera.lastMouseY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        camera.dragMoved = true;
      }

      camera.x += dx;
      camera.y += dy;

      const totalWidth = store.gridSize * camera.scale;
      camera.x = ((camera.x + totalWidth / 2) % totalWidth + totalWidth) % totalWidth - totalWidth / 2;

      const limitY = Math.max(0, (store.gridSize * camera.scale) / 2 - rect.height / 2);
      camera.y = Math.min(limitY, Math.max(-limitY, camera.y));

      camera.lastMouseX = e.clientX;
      camera.lastMouseY = e.clientY;
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (camera.isDragging && !camera.dragMoved && camera.scale >= 5) {
      if (!authStore.isAuthenticated) {
        // TODO : afficher un message à l'utilisateur
        console.warn('Vous devez être connecté pour dessiner !');
      } else {
        const { x, y } = screenToGrid(e.clientX, e.clientY);
        try {
          if (brushStore.isBrushActive) {
            const offset = Math.floor(brushStore.brushSize / 2);
            const cx = x;
            const cy = Math.max(offset, Math.min(y, store.gridSize - 1 - offset));
            brushStore.placeBrushPixels(cx, cy);
          } else {
            store.placePixel(x, y);
          }
        } catch (error: any) {
          console.warn(error.message);
        }
      }
    }
    camera.isDragging = false;
  };

  // Réalisé et débuggé grâce à l'IA
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!canvasRef.value) return;

    const rect = canvasRef.value.getBoundingClientRect();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    const oldScale = camera.scale;

    const minScale = Math.min(rect.width / store.gridSize, rect.height / store.gridSize);
    const newScale = Math.min(Math.max(camera.scale * delta, minScale), 100);

    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    camera.x -= (mouseX - camera.x) * (newScale / oldScale - 1);
    camera.y -= (mouseY - camera.y) * (newScale / oldScale - 1);
    camera.scale = newScale;

    const totalWidth = store.gridSize * newScale;
    camera.x = ((camera.x + totalWidth / 2) % totalWidth + totalWidth) % totalWidth - totalWidth / 2;

    const limitY = Math.max(0, (store.gridSize * camera.scale) / 2 - rect.height / 2);
    camera.y = Math.min(limitY, Math.max(-limitY, camera.y));
  };

  const screenToGrid = (screenX: number, screenY: number) => {
    if (!canvasRef.value) return { x: -1, y: -1 };

    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.value.getBoundingClientRect();

    const x = (screenX - rect.left - rect.width / 2) * dpr;
    const y = (screenY - rect.top - rect.height / 2) * dpr;

    const worldX = (x / dpr - camera.x) / camera.scale + store.gridSize / 2;
    const worldY = (y / dpr - camera.y) / camera.scale + store.gridSize / 2;

    return {
      x: ((Math.floor(worldX) % store.gridSize) + store.gridSize) % store.gridSize,
      y: Math.floor(worldY)
    };
  };

  onMounted(async () => {
    if (canvasRef.value) {
      await store.fetchConfig();

      setupBuffer();

      ctx = canvasRef.value.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
      }

      handleResize();
      window.addEventListener('resize', handleResize);
      canvasRef.value.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      canvasRef.value.addEventListener('wheel', handleWheel, { passive: false });

      await store.fetchInitialBoard();

      store.connectWebSocket();

      //store.generateTestGrid();
      updateBuffer();

      draw();
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    store.disconnectWebSocket();
    cancelAnimationFrame(animationFrame);
  });

  return {
    canvasRef,
    hoveredPixel: computed(() => store.hoveredPixel),
    mousePos,
    hoveredPixelData: computed(() => store.hoveredPixelData),
    formatDate
  };
}
