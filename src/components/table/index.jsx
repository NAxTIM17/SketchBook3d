import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { useLoader } from "@react-three/fiber";

export const Table = () => {
    const { scene } = useLoader(GLTFLoader, "Table.gltf");
    return <primitive object={scene} />;
  };
