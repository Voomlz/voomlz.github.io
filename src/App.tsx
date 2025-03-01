import React from "react";
import "./App.css";
import * as config from "../era/spells";
import { ThreatViewer } from "./components/threat/ThreatViewer";

import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

/**
 * Props for the App component
 */
export interface AppProps {}

/**
 * Root component of the application
 */
export const App: React.FC<AppProps> = () => {
  return (
    <div className="App">
      <ThreatViewer config={config} />
    </div>
  );
};
