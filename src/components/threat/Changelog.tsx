import React from "react";
import { Dialog } from "primereact/dialog";

/**
 * Props for the Changelog component
 */
export interface ChangelogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Changelog modal component
 */
const Changelog: React.FC<ChangelogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      header="Changelog"
      visible={isOpen}
      onHide={onClose}
      style={{ width: "80vw", maxWidth: "800px" }}
      modal
      className="threat-modal"
    >
      <div className="changelog-content">
        <h3>Version 2.0.0</h3>
        <ul>
          <li>Converted to React components for better maintainability</li>
          <li>Improved UI/UX with better visualizations</li>
          <li>Added responsive design for mobile devices</li>
        </ul>

        <h3>Version 1.2.0</h3>
        <ul>
          <li>Added support for SoD (Season of Discovery)</li>
          <li>Fixed various threat calculation bugs</li>
          <li>Updated coefficients for certain classes</li>
        </ul>

        <h3>Version 1.1.0</h3>
        <ul>
          <li>Initial support for Era servers</li>
          <li>Basic threat tracking functionality</li>
          <li>Support for WarcraftLogs integration</li>
        </ul>
      </div>
    </Dialog>
  );
};

export default Changelog;
