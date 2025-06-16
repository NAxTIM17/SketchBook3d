import "./index.css";
import { Book } from "./components/book";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Pencil, Eraser, PenLine, Hand } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import Hotkeys from "react-hot-keys";
import { Table } from "./components/table";

function App() {
  const [shortcuts, setShortcuts] = useState({
    pan: false,
    zoom: false,
    rotate: false,
  });
  const [activeShortcut, setActiveShortcut] = useState(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const actionRef = useRef();
  const playingRef = useRef(false);
  
 const toggleAnimation = () => {
  if (actionRef.current) {
    actionRef.current.paused = false;
    actionRef.current.play();
    playingRef.current = true;
  }
  };
  
  const onKeyDown = useCallback((keyName) => {
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
  
  const onKeyUp = useCallback((keyName) => {
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
              <div onClick={toggleAnimation} className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700">
                Pause
              </div>
            </div>
            <div className="bg-white h-10 flex justify-center items-center rounded-md p-2 select-none">
              <h1 className="font-bold">{activeShortcut}</h1>
            </div>
          </div>
          <Canvas>
            <ambientLight />
            <PerspectiveCamera makeDefault fov={85} position={[0, 2, 0]} />
            <directionalLight />
            <OrbitControls
              enableRotate={shortcuts.rotate}
              enablePan={shortcuts.pan}
              enableDamping={true}
              dampingFactor={0.5}
              target={[0, 0, 0]}
              minPolarAngle={0}
            />
            <Table />
            <Book actionRef={actionRef} playingRef={playingRef} activeShortcut={activeShortcut} />
          </Canvas>
        </div>
      </Hotkeys>
    </>
  );
}

export default App;
