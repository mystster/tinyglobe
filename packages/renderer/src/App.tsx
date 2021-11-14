import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.svg';
import { Camera, Viewer, CesiumComponentRef } from "resium";
import { Ion, Camera as cCamera, Cartesian3, Ellipsoid, Cartographic, Rectangle } from "cesium";
import { useKey } from 'react-use';
import './App.css';

const App: React.FC = () => {
  const [count, setCount] = useState(0);

  Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_KEY as string;

  const cameraRef = useRef<CesiumComponentRef<cCamera>>(null);
  const zoom = (amount: number) => {
    console.log("fire");
    if (cameraRef.current?.cesiumElement) {
      const cam = cameraRef.current.cesiumElement as cCamera;
      if (amount > 0) {
        cam.zoomIn(amount);
      } else if (amount < 0) {
        cam.zoomOut(-amount);
      }
      console.log(cam.positionCartographic.height);
    }
  };

  const move = (moveWidth: number, moveHeight: number) => {
    if (cameraRef.current?.cesiumElement) {
      const cam = cameraRef.current.cesiumElement as cCamera;
      moveMap(cam, moveWidth, moveHeight);
    }
  };

  useKey("ArrowRight", () => move(0.1, 0));
  useKey("ArrowLeft", () => move(-0.1, 0));
  useKey("ArrowUp", () => move(0, 0.1));
  useKey("ArrowDown", () => move(0, -0.1));


  return (
    <div className="App">
      <Viewer full>
        <Camera ref={cameraRef}></Camera>
      </Viewer>
      <button onClick={()=>zoom(100000)}>ZoomIn</button>
    </div>
  );
};

function moveMap(cam: cCamera, moveWidth: number, moveHeight: number) {
  const nowPos = cam.positionCartographic;
  const nowRec = cam.computeViewRectangle();
  console.log("nowPos->"+nowPos);
  console.log(`nowRec->e:${nowRec?.east},w:${nowRec?.west},n:${nowRec?.north},s:${nowRec?.south}`);
  console.log(`wid:${nowRec?.width},hei:${nowRec?.height}`);
  if (!nowRec) return;
  let newLong = nowPos.longitude +  (nowRec.width == Math.PI *2 ? Math.PI : nowRec.width) * moveWidth;
  if (newLong > Math.PI) newLong -= Math.PI * 2;
  if (newLong < -Math.PI) newLong += Math.PI * 2;
  let newLat = nowPos.latitude + (nowRec.height == Math.PI ? Math.PI /2 : nowRec.height) * moveHeight;
  if (newLat > Math.PI / 2) newLat -= Math.PI;
  if (newLat < -Math.PI / 2) newLat += Math.PI;
  const newPos = Cartesian3.fromRadians(newLong, newLat, nowPos.height);
  console.log("now Center->" + Rectangle.center(nowRec));
  console.log("new->" + Cartographic.fromCartesian(newPos));
  cam.setView({ destination: newPos });
  // const newWest = nowRec.west + nowRec.width * moveWidth;
  // if (newWest > Math.PI) newWest - Math.PI * 2;
  // if (newWest < -Math.PI) newWest + Math.PI * 2;
  // const newEast = nowRec.east + nowRec.width * moveWidth;
  // if (newEast > Math.PI) newEast - Math.PI * 2;
  // if (newEast < -Math.PI) newEast + Math.PI * 2;
  // const newNorth = nowRec.north + nowRec.height * moveWidth;
  // if (newNorth > Math.PI / 2) newNorth - Math.PI;
  // if (newNorth < -Math.PI / 2) newNorth + Math.PI;
  // const newSouth = nowRec.south + nowRec.height * moveWidth;
  // if (newSouth > Math.PI / 2) newSouth - Math.PI;
  // if (newSouth < -Math.PI / 2) newSouth + Math.PI;

  // const newRec = Rectangle.center(Rectangle.fromRadians(newWest, newSouth, newEast, newNorth));
  // const newPos = Cartesian3.fromDegrees(newRec.longitude, newRec.latitude, newRec.height);
  // console.log("now->" + Rectangle.center(nowRec));
  // console.log("new->" + Cartographic.fromCartesian(newPos));
  //cam.setView({ destination: newPos });
}

export default App;
