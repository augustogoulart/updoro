import React from 'react';
import './App.css';
import {Timer} from "./components/Timer";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Timer />
          <div className={"controls"}>
              Pause
          </div>
          <div className={"intervals"}>
              1/10
          </div>
      </header>
    </div>
  );
}

export default App;
