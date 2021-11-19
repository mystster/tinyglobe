import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.svg';
import { Camera, Viewer, CesiumComponentRef, ImageryLayer, Entity, PointGraphics, EntityDescription, Label, LabelCollection } from "resium";
import { Ion, Camera as cCamera, Cartesian3, Ellipsoid, Cartographic, Rectangle, BingMapsImageryProvider, BingMapsStyle, LabelCollection as cLabelCollection, Viewer as cViewer } from "cesium";
import { useKey } from 'react-use';
import './App.css';
import countriesData from '../assets/countries_kana.json';

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

  const labelsRef = useRef<CesiumComponentRef<cLabelCollection>>(null);
  const viewerRef = useRef<CesiumComponentRef<cViewer>>(null);
  let labels: cLabelCollection | undefined = undefined;
  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      console.log("viewer ok");
      const viewer = viewerRef.current.cesiumElement as cViewer;
      if (!labels) {
        labels = viewer.scene.primitives.add(new cLabelCollection());
      }
    } else {
      console.log("viewer ng");
    }
  }, [])
  
  const cameraUpdated = () => {
    console.log("camera update");
    if (cameraRef.current?.cesiumElement) {
      if (!labels) return;
      labels.removeAll();
      const nowPos = cameraRef.current.cesiumElement.positionCartographic;
      if (!nowPos) return;
      const nowRec = cameraRef.current.cesiumElement.computeViewRectangle();
      if (!nowRec) return;
      const deg = (rad: number): number => rad * 180 / Math.PI;

      const w = nowRec.width == Math.PI * 2 ? deg(nowPos.longitude) - 35 : deg(nowRec.west);
      const e = nowRec.width == Math.PI * 2 ? deg(nowPos.longitude) + 35 : deg(nowRec.east);
      const s = nowRec.height == Math.PI ? deg(nowPos.latitude) - 35 : deg(nowRec.south);
      const n = nowRec.height == Math.PI ? deg(nowPos.latitude) + 35 : deg(nowRec.north);
      console.log(`w: ${w} e:${e} s:${s} n:${n}`);

      if (!countriesData) return;
      countriesData.forEach((x) => {
        if (labels && w <= x.latlng[1] && x.latlng[1] <= e && s <= x.latlng[0] && x.latlng[0] <= n) {
          labels.add({
            text: x?.translations?.jpn_kana?.common ?? x.name.common,
            position: Cartesian3.fromDegrees(x.latlng[1], x.latlng[0]),
            key: x.ccn3
          });
        }
      });
    }
  }
  // useEffect(() => {
  //     if (labelsRef.current?.cesiumElement) {
  //       console.log("label ok");
  //       const labels = labelsRef.current?.cesiumElement as cLabelCollection;
  //       countriesData.forEach( x => {
  //         labels.add({
  //           text: x?.translations?.jpn_kana?.common ?? x.name.common,
  //           position: Cartesian3.fromDegrees(x.latlng[1], x.latlng[0]),
  //           key: x.ccn3
  //         });
  //         console.log(x.ccn3);
  //       });
  //     } else {
  //       console.log("label ng");
  //     }
  // },[]);

  return (
    <div className="App">
      <Viewer full ref={viewerRef}>
        <Camera ref={cameraRef} onChange = {cameraUpdated}></Camera>
        {/* <ImageryLayer imageryProvider={bingmapImageProvider} /> */}
        {/* <LabelCollection
          // ref={labelsRef}
        >
          {countriesData.map((x) => {
            return (
              <Label
                text={x?.translations?.jpn_kana?.common ?? x.name.common}
                position={Cartesian3.fromDegrees(x.latlng[1], x.latlng[0])}
                key={x.ccn3}
              />
            );
          })}
        </LabelCollection> */}
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
