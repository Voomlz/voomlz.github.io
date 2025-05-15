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
export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      header="How to use this tool"
      visible={isOpen}
      onHide={onClose}
      style={{ width: "80vw", maxWidth: "800px" }}
      modal
    >
      <div className="tutorial-content">
        <ol>
          <li>
            Go to warcraft logs and copy your report. Can use directly the
            entire url (ex:
            https://classic.warcraftlogs.com/reports/TvCLWArKDBYbw6Hk#fight=last)
            or only the id (ex: TvCLWArKDBYbw6Hk)
          </li>
          <li>Go to https://voomlz.github.io/</li>
          <li>Past your ID/report url in 'Report ID'</li>
          <li>Clic on 'Fetch'</li>
          <li>Select the fight you wanna see</li>
          <li>Clic on 'Fetch/Refresh'</li>
        </ol>
        Going further
        <ol start={7}>
          <li>Select the player you wanna see details in 'Target'</li>
          <li>
            Check In the 'buffs' table that everything is correctly set up
            (salvation, stances, and other buffs)
          </li>
          <li>If buffs are not correctly inferred automatically, force them</li>
          <li>
            click on 'Fetch/Refresh' after modifying buffs to recalculate new
            threat
          </li>
          <li>
            You can share the graphs (now only sharing the report, wip) by
            copying the url and sharing it
          </li>
        </ol>
        If something seem incorrect
        <ol>
          <li>Try to force refresh the website (ctrl f5 on chrome)</li>
          <li>
            Double check the default buffs that were inferred to the players
          </li>
        </ol>
      </div>
    </Dialog>
  );
};
