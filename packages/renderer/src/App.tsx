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
      <header className="App-header">
        <Viewer/>
        <p>Hello Vite + React!</p>
        <p>
          <button onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  );
};

export default App;
