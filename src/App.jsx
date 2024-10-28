import "./index.css";
import { useRef, useEffect } from "react";
import {
  Canvas,
  useThree,
  extend,
  useFrame,
  useLoader,
} from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {
  OrbitControls,
  useGLTF,
  Environment,
  View,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { Pencil, Eraser, PenLine, Hand } from "lucide-react";

function App() {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  const Book = () => {
    const { scene } = useLoader(GLTFLoader, "BookNoMaterial.gltf");
    return <primitive object={scene} />;
  };

  return (
    <>
      <div className="bg-white w-full h-screen relative">
        <div className=" absolute top-5 z-10 left-0 right-0 flex justify-center">
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
        </div>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight />
          <directionalLight />
          <OrbitControls enableDamping={true} dampingFactor={0.5} />
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[50, 0.2, 50]} />
            <meshPhongMaterial />
          </mesh>
          <Book />
        </Canvas>
      </div>
    </>
  );
}

export default App;
