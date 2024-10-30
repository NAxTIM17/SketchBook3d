import "./index.css";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Pencil, Eraser, PenLine, Hand } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import Hotkeys from "react-hot-keys";
import * as THREE from "three";

function App() {
  const [shortcuts, setShortcuts] = useState({
    pan: false,
    zoom: false,
    rotate: false,
  });
  const [activeShortcut, setActiveShortcut] = useState(undefined);
  const { scene } = useLoader(GLTFLoader, "Book.gltf");
  const textureRef = useRef();
  const canvasRef = useRef();
  const raycaster = new THREE.Raycaster();
  const isDrawingRef = useRef(false);
  const xRef = useRef(0);
  const yRef = useRef(0);
  let points = [];

  const onKeyDown = useCallback((keyName, e, handle) => {
    setActiveShortcut(keyName);
    switch (keyName) {
      case "shift+a":
        setShortcuts({
          ...shortcuts,
          rotate: true,
        });
        break;
      case "shift+d":
        setShortcuts({
          ...shortcuts,
          pan: true,
        });
        break;
      case "shift+z":
        setShortcuts({
          ...shortcuts,
          zoom: true,
        });
        break;
      case 'ctrl+alt+z':
        console.log('ctrl+alt+z')
        break;
      default:
        break;
    }
  },[shortcuts]);
  const onKeyUp = useCallback((keyName, e, handle) => {
    setActiveShortcut(undefined);
    switch (keyName) {
      case "shift+a":
        setShortcuts({
          ...shortcuts,
          rotate: false,
        });
        break;
      case "shift+d":
        setShortcuts({
          ...shortcuts,
          pan: false,
        });
        break;
      case "shift+z":
        setShortcuts({
          ...shortcuts,
          zoom: false,
        });
        break;
      default:
        break;
    }
  },[shortcuts]);
  console.log("active shortcut",activeShortcut)

  const Table = () => {
    const { scene } = useLoader(GLTFLoader, "Table.gltf");
    return <primitive object={scene} />;
  };
  
  const PaintableModel = () => {
    const { mouse, camera, gl } = useThree();
    console.log("isDrawing",isDrawingRef.current);
    console.log("canvasRef",canvasRef)
    
    
    useEffect(() => {
      if(!canvasRef.current){
        console.log("Refs",xRef, yRef)
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create a canvas texture
        const texture = new THREE.CanvasTexture(canvas);
        textureRef.current = texture;
        canvasRef.current = canvas;
        
        console.log("textureRef",textureRef);
        
        // Traverse through the GLTF model and apply the texture to the materials
        scene.traverse((node) => {
          if (node.isMesh && node.material) {
            node.material.map = texture;
            node.material.needsUpdate = true;
          }
        });
      }

      if(activeShortcut === undefined){
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('keydown', (e) => {
          console.log(e)
        })
      }

      return()=>{
        window.removeEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.addEventListener('keydown', (e) => {
          console.log(e)
        })
      }

    }, [scene]);
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
     
      points.push({x:x, y:y})
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
    const handlePointerMove = (event) => {
      console.log("Move");
      xRef.current = event.clientX;
      yRef.current = event.clientY;
    };
    const handlePointerDown = (event) => {
      console.log("down");
      isDrawingRef.current = true;
    };
    const handlePointerUp = (event) => {
      console.log("up");
      points = [];
      isDrawingRef.current = false;
    };

    useFrame(() => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(scene, true);
      
      if (intersects.length > 0) {
        const uv = intersects[0].uv;
        if (uv) {
          paintOnTexture(uv, "#2b2b2b"); // Paint green at intersected UV point
        }
      }
    });

    return (
      <primitive
        object={scene}
      />
    );
  };

  return (
    <>
      <Hotkeys
        keyName="shift+a,shift+d,shift+z,ctrl+alt+z"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        allowChanges={true}
        autoFocus={true}
        tabIndex="0"
      >
        <div className="bg-black w-full h-screen relative">
          <div className=" absolute top-5 z-10 left-0 right-0 flex justify-center gap-5">
            <div className="bg-white h-10 rounded-lg flex justify-center gap-1 items-center p-1">
              <Hand
                size={30}
                className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700"
              />
              <Pencil
                size={30}
                className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700"
              />
              <PenLine
                size={30}
                className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700"
              />
              <Eraser
                size={30}
                className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700"
              />
            </div>
            <div className="bg-white h-10 flex justify-center items-center rounded-md p-2 select-none">
              <h1 className="font-bold">{activeShortcut}</h1>
            </div>
          </div>
          <Canvas>
            <ambientLight />
            <PerspectiveCamera makeDefault fov={60} position={[0, 2, 0]} />
            <directionalLight />
            <OrbitControls
              enableRotate={shortcuts.rotate}
              enablePan={shortcuts.pan}
              enableDamping={true}
              dampingFactor={0.5}
              target={[0, 0, 0]}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 3.5}
              minDistance={1} // Distancia mínima de la cámara (zoom in máximo)
              maxDistance={5}
            />
            <Table/>
            <PaintableModel />
          </Canvas>
        </div>
      </Hotkeys>
    </>
  );
}

export default App;
