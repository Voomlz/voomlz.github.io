import React from "react";
import "./App.css";
import * as config from "../era/spells";
import ThreatViewer from "./components/threat/ThreatViewer";

import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function App() {
  return (
    <div className="App">
      <ThreatViewer config={config} />
    </div>
  );
}

export default App;
