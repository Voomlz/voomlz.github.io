import React from "react";
import { Dialog } from "primereact/dialog";

/**
 * Props for the Tutorial component
 */
export interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Tutorial modal component
 */
const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      header="How to Use This Tool"
      visible={isOpen}
      onHide={onClose}
      style={{ width: "80vw", maxWidth: "800px" }}
      modal
      className="threat-modal"
    >
      <div className="tutorial-content">
        <h3>Getting Started</h3>
        <ol>
          <li>
            <strong>Enter a Report ID:</strong> Paste a WarcraftLogs report URL
            or ID in the Report field and click "Select Report"
          </li>
          <li>
            <strong>Select a Fight:</strong> Choose a boss fight from the
            dropdown menu
          </li>
          <li>
            <strong>Choose an Enemy:</strong> Select the enemy/boss you want to
            analyze
          </li>
          <li>
            <strong>Select a Target:</strong> Choose the player you want to view
            threat details for
          </li>
        </ol>

        <h3>Understanding the Graph</h3>
        <p>
          The graph shows threat over time for all players against the selected
          enemy. Each line represents a different player, with colors
          corresponding to their class.
        </p>
        <p>
          You can click on any player's line to see their detailed threat
          breakdown.
        </p>

        <h3>Threat Details</h3>
        <p>
          The threat table shows a breakdown of threat sources for the selected
          player:
        </p>
        <ul>
          <li>Ability name</li>
          <li>Total threat generated</li>
          <li>Threat per second</li>
        </ul>

        <h3>Advanced Features</h3>
        <p>You can customize some aspects of the visualization:</p>
        <ul>
          <li>
            Toggle "Color by class" to switch between class colors and automatic
            coloring
          </li>
          <li>
            View "Display detailed coefficients" for more information about
            threat multipliers
          </li>
          <li>
            For players you can adjust buff status and talent ranks if needed
          </li>
        </ul>
      </div>
    </Dialog>
  );
};

export default Tutorial;
