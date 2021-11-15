import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.svg';
import { Camera, Viewer, CesiumComponentRef, ImageryLayer, Entity, PointGraphics, EntityDescription, Label, LabelCollection } from "resium";
import { Ion, Camera as cCamera, Cartesian3, Ellipsoid, Cartographic, Rectangle, BingMapsImageryProvider, BingMapsStyle, Transforms } from "cesium";
import { useKey } from 'react-use';
import './App.css';
import countriesData from '../assets/countries/countries.json';

const App: React.FC = () => {
  const [count, setCount] = useState(0);

  Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_KEY as string;

  const bingmapImageProvider = new BingMapsImageryProvider({
    key: import.meta.env.VITE_BINGMAP_KEY as string,
    url: 'https://dev.virtualearth.net',
    culture: 'ja',
    mapStyle: BingMapsStyle.AERIAL_WITH_LABELS
  })

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
        {/* <ImageryLayer imageryProvider={bingmapImageProvider} /> */}
        <LabelCollection>
          {countriesData.map((x) => {
            return (
              <Label
                text={x?.translations?.jpn?.common ?? x.name.common}
                position={Cartesian3.fromDegrees(x.latlng[1], x.latlng[0])}
                key={x.ccn3}
              />
            );
          })}
        </LabelCollection>
      </Viewer>
      <button onClick={() => zoom(1000000)}>ZoomIn</button>
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
  // cam.flyTo({ destination: newPos, duration: 0.2 });
}

export default App;
