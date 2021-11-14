import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.svg';
import { Camera, Viewer, CesiumComponentRef } from "resium";
import { Ion, Camera as cCamera, Cartesian3, Ellipsoid, Cartographic, Rectangle } from "cesium";
import './App.css';

const App: React.FC = () => {
  const [count, setCount] = useState(0);
  Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_KEY as string;
  
  const cameraRef = useRef<CesiumComponentRef<cCamera>>(null);
  const zoomIn = () => {
    console.log("fire");
    if (cameraRef.current?.cesiumElement) {
      const cam = cameraRef.current.cesiumElement as cCamera;
      cam.zoomIn(1000000);
      console.log(cam.positionCartographic.height);
    }
  };
  const zoomOut = () => {
    if (cameraRef.current?.cesiumElement) {
      const cam = cameraRef.current.cesiumElement as cCamera;
      cam.zoomOut(1000000);
    }
  };
  return (
    <div className="App">
      <Viewer full>
        <Camera ref={cameraRef}></Camera>
      </Viewer>
      <button onClick={zoomIn}>ZoomIn</button>
    </div>
  );
};

export default App;
