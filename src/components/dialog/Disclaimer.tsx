import React from "react";
import { Dialog } from "primereact/dialog";

/**
 * Props for the Disclaimer component
 */
export interface DisclaimerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Disclaimer modal component
 */
export const Disclaimer: React.FC<DisclaimerProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      header="Disclaimer"
      visible={isOpen}
      onHide={onClose}
      style={{ width: "80vw", maxWidth: "800px" }}
      modal
    >
      <div className="disclaimer-content">
        <p>Private logs cannot be imported.</p>
        <p>
          This tool is modified from{" "}
          <a href="https://github.com/nuiva/nuiva.github.io" target="_blank">
            https://github.com/nuiva/nuiva.github.io
          </a>
        </p>
        <p>
          For any feedback or inconsistencies feel free to join us on{" "}
          <a href="https://discord.gg/3J4FGUNfW7">discord</a>.
        </p>
      </div>
    </Dialog>
  );
};
