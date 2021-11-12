import React, { useState } from 'react';
import logo from './logo.svg';
import { Viewer } from "resium";
import { Ion } from "cesium";
import './App.css';

const App: React.FC = () => {
  const [count, setCount] = useState(0);
  Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_KEY as string;
  
  return (
    <div className="App">
      <Viewer full/>
    </div>
  );
};

export default App;
