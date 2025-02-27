import React from "react";
import Modal from "./Modal";

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
const Disclaimer: React.FC<DisclaimerProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Disclaimer">
      <div className="disclaimer-content">
        <p>
          This tool attempts to compute threat values based on combat logs. Due
          to limitations in the WoW Classic logging API, not all threat
          mechanics can be perfectly captured. Use the results as a guideline
          rather than absolute values.
        </p>
        <p>
          Threat calculations are based on publicly available information and
          testing, but may not be 100% accurate due to hidden game mechanics.
        </p>
        <p>
          Some abilities and mechanics might not be correctly captured in logs,
          which could result in inaccurate threat values.
        </p>
        <p>
          Please report any bugs or inconsistencies you find to help improve
          this tool.
        </p>
      </div>
    </Modal>
  );
};

export default Disclaimer;
