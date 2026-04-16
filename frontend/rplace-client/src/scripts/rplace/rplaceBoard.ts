import { ref, onMounted, onUnmounted } from 'vue';
import { useRPlaceStore } from '../../stores/rplace';
import { useAuthStore } from '../../stores/auth';

export function useRPlaceBoard() {
  const store = useRPlaceStore();
  const authStore = useAuthStore();
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrame: number;

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
  // TODO: Mettre l'image globale de la map
  overviewImage.src = '/local/FondTemp2.png';
  let isImageLoaded = false;
  overviewImage.onload = () => { isImageLoaded = true; };

  // Réalisé et débuggé grâce à l'IA
  const draw = () => {
    if (!ctx || !canvasRef.value) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasRef.value.width / dpr, canvasRef.value.height / dpr);
    ctx.translate(canvasRef.value.width / (2 * dpr) + camera.x, canvasRef.value.height / (2 * dpr) + camera.y);
    ctx.scale(camera.scale, camera.scale);
    ctx.translate(-store.gridSize / 2, -store.gridSize / 2);

    // Scale 5 (à changer pour avoir l'image de fond plus tôt/tard)
    if (camera.scale < 5 && isImageLoaded) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(overviewImage, 0, 0, store.gridSize, store.gridSize);
    } else {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, store.gridSize, store.gridSize);

      for (let y = 0; y < store.gridSize; y++) {
        for (let x = 0; x < store.gridSize; x++) {
          const color = store.pixels[y * store.gridSize + x] ?? '#ffffff';
          if (color !== '#ffffff') {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.1;
    ctx.strokeRect(0, 0, store.gridSize, store.gridSize);

    animationFrame = requestAnimationFrame(draw);
  };

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

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      camera.isDragging = true;
      camera.dragMoved = false;
      camera.lastMouseX = e.clientX;
      camera.lastMouseY = e.clientY;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (camera.isDragging) {
      const dx = e.clientX - camera.lastMouseX;
      const dy = e.clientY - camera.lastMouseY;
      
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        camera.dragMoved = true;
      }

      camera.x += dx;
      camera.y += dy;
      
      camera.lastMouseX = e.clientX;
      camera.lastMouseY = e.clientY;
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (camera.isDragging && !camera.dragMoved && camera.scale >= 5) {
      if (authStore.isAuthenticated) {
        const { x, y } = screenToGrid(e.clientX, e.clientY);
        store.placePixel(x, y);
      } else {
        // TODO : afficher un message à l'utilisateur
        console.warn('Vous devez être connecté pour dessiner !');
      }
    }
    camera.isDragging = false;
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!canvasRef.value) return;

    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    const oldScale = camera.scale;
    const newScale = Math.min(Math.max(camera.scale * delta, 0.5), 100);

    const rect = canvasRef.value.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    camera.x -= (mouseX - camera.x) * (newScale / oldScale - 1);
    camera.y -= (mouseY - camera.y) * (newScale / oldScale - 1);
    camera.scale = newScale;
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
      x: Math.floor(worldX),
      y: Math.floor(worldY)
    };
  };

  onMounted(async () => {
    if (canvasRef.value) {
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

      draw();
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    cancelAnimationFrame(animationFrame);
  });

  return {
    canvasRef
  };
}
