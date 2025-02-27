import React from "react";
import "./App.css";
import * as config from "../era/spells";
import ThreatViewer from "./components/threat/ThreatViewer";
import "./components/threat/ThreatViewer.css";

function App() {
  return (
    <div className="App">
      <ThreatViewer config={config} />
    </div>
  );
}

export default App;
