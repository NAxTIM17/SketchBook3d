import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const Book = ({ activeShortcut, actionRef, playingRef }) => {
  const { mouse, camera } = useThree();
  const { scene, animations } = useLoader(GLTFLoader, "BookAnimationTest19_Chonky.glb");
  const textureRef = useRef();
  const canvasRef = useRef();

  const mixerRef = useRef();
  const frameCountRef = useRef(0);
  
  const framesPerStep = 10;
  const frameRate = 30; // FPS de tu animación
  const timePerStep = framesPerStep / frameRate;

  const raycaster = new THREE.Raycaster();
  const isDrawingRef = useRef(false);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const [points, setPoints] = useState([]);

  console.log(activeShortcut);

 

  const handlePointerMove = (event) => {
    xRef.current = event.clientX;
    yRef.current = event.clientY;
  };

  const handlePointerDown = () => {
    isDrawingRef.current = true;
  };

  const handlePointerUp = () => {
    setPoints([]);
    isDrawingRef.current = false;

    const canvas = canvasRef.current;

    try {
      const dataURL = canvas.toDataURL();
      sessionStorage.setItem("canvasTexture", dataURL);
    } catch (err) {
      console.warn("No se pudo guardar el canvas en sessionStorage:", err);
    }
  };

  const midPointBtw = (p1, p2) => {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2,
    };
  };

  // Function to paint on the texture based on UV coordinates
  const paintOnTexture = (uv, color) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");
    const x = uv.x * canvas.width;
    const y = (1 - uv.y) * canvas.height; // Flip Y-axis

    points.push({ x: x, y: y });
    let p1 = points[0];
    let p2 = points[1];

    if (p2 === undefined) return;

    for (let i = 1, len = points.length; i < len; i++) {
      // we pick the point between pi+1 & pi+2 as the
      // end point and p1 as our control point
      const midPoint = midPointBtw(p1, p2);

      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);

      ctx.lineWidth = 10;
      // Math.max(points[i].pressure * 10, 1);
      ctx.strokeStyle = color;
      ctx.lineCap = "round";

      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      p1 = points[i];
      p2 = points[i + 1];
    }
    textureRef.current.needsUpdate = true;
  };

  useEffect(() => {
    console.log("Use Effect book");
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");

      const savedTextureData = sessionStorage.getItem("canvasTexture");
      console.log(savedTextureData);
      if (savedTextureData) {
        // Restaurar el contenido del canvas desde base64
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const texture = new THREE.CanvasTexture(canvas);
          textureRef.current = texture;
          canvasRef.current = canvas;

          // Aplicar la textura al modelo
          scene.traverse((node) => {
            if (node.isMesh && node.material) {
              node.material.side = THREE.DoubleSide; // 👈 ¡esto es lo importante!
              node.material.map = texture;
              node.material.needsUpdate = true;
            }
          });
        };
        img.src = savedTextureData;
      } else {
        // Crear canvas nuevo con fondo blanco
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        textureRef.current = texture;
        canvasRef.current = canvas;

        sessionStorage.setItem("canvasTexture", canvas.toDataURL());

        // Aplicar la textura al modelo
        scene.traverse((node) => {
          if (node.isMesh && node.material) {
            node.material.map = texture;
            node.material.needsUpdate = true;
          }
        });
      }
    }

    if (activeShortcut === undefined) {
      window.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [scene, activeShortcut]);

  useEffect(() => {
    if (animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene);
      const action = mixer.clipAction(animations[0]);
      action.play(); // Podés recorrer todas si hay más de una
      mixerRef.current = mixer;
      actionRef.current = action;
    }
  }, [animations, scene, actionRef]);

  useFrame((state, delta) => {
    raycaster.setFromCamera(mouse, camera);
    raycaster.params.Points.threshold = 0.01;
    const intersects = raycaster.intersectObject(scene, true);

    if (intersects.length > 0) {
      console.log("Puede pintar")
      const uv = intersects[0].uv;
      if (uv) {
        paintOnTexture(uv, "#2b2b2b");
      }
    }else{
      console.log("No puede pintar");
    }


      // Control de animación por tiempo/frames
  if (mixerRef.current && actionRef.current && playingRef.current) {
    mixerRef.current.update(delta);

    const currentFrameBlockStart = frameCountRef.current * timePerStep;
    const nextFrameBlockEnd = (frameCountRef.current + 1) * timePerStep;

    // Pausar si se pasó el tiempo límite del bloque actual
    if (actionRef.current.time >= nextFrameBlockEnd) {
      actionRef.current.paused = true;
      actionRef.current.time = nextFrameBlockEnd; // Cortar exacto
      playingRef.current = false;
      frameCountRef.current += 1;
    }
  }
  });
  return <primitive object={scene} rotation={[0, Math.PI / -2, 0]} scale={[2, 2, 2]}/>;
};
