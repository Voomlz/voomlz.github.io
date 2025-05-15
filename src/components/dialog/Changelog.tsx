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
export const Changelog: React.FC<ChangelogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      header="Changelog"
      visible={isOpen}
      onHide={onClose}
      style={{ width: "80vw", maxWidth: "800px" }}
      modal
    >
      <div className="changelog-content">
        <h3>Quality of life:</h3>
        <ul>
          <li>
            New browser extension to open directly the threat graph from
            warcraft logs
          </li>
          <li>
            <ul>
              <li>
                <a href="https://addons.mozilla.org/en-US/firefox/addon/wcl-threat-link/">
                  Firefox
                </a>
              </li>
              <li>
                <a href="https://chrome.google.com/webstore/detail/wcl-threat-link/pbhoiekekddmkjfkoalcohlpjgfabkjn?hl=en">
                  Chrome
                </a>
              </li>
            </ul>
          </li>
          <li>
            Adding warcraft log url as parameter with '?id=' i.e:
            <code>
              https://voomlz.github.io/threat?id=https://classic.warcraftlogs.com/reports/V84N3Q17vFRaxDhj
            </code>
          </li>
        </ul>
        <h3>Warriors:</h3>
        <ul>
          <li>New Shield Slam</li>
          <li>New Heroic Strike</li>
          <li>Adding devastate</li>
          <li>Reworking devastate, no sunder threat when expose armor is up</li>
          <li>Rework Revenge</li>
          <li>Rework Thunderclap</li>
          <li>Adding Improved berserker stance</li>
          <li>Fix Defiance talent</li>
        </ul>
        <h3>Druid feral:</h3>
        <ul>
          <li>New FF</li>
          <li>New Demoralizing shout</li>
          <li>Adding Lacerate</li>
          <li>Adding Mangle</li>
          <li>Rework Swipe</li>
          <li>Rework Maul</li>
          <li>Fix Feral instict</li>
        </ul>
        <h3>Warlock</h3>
        <ul>
          <li>Adding Soulshatter</li>
          <li>Adding Destructive reach</li>
        </ul>
        <h3>Shaman</h3>
        <ul>
          <li>Adding enchancement reduction talent</li>
          <li>Adding elemental reduction talent</li>
          <li>Adding earth shock</li>
          <li>Adding Lightning Overload procs</li>
          <li>Earth shock modifier modified to 1 (instead of 2 in classic)</li>
        </ul>
        <h3>Hunter</h3>
        <ul>
          <li>Adding Missdirection</li>
        </ul>
        <h3>Mage</h3>
        <ul>
          <li>
            Adding dummy invisibility. Removing 25% threat when cast and when
            fades. Need to be fixed to be x% per second or X value per second.
            Needs more testing and custome code
          </li>
        </ul>
        <h3>Paladin</h3>
        <ul>
          <li>Adding rework of Holy shield</li>
          <li>Adding rework of Avenger shield</li>
        </ul>
        <h3>Misc</h3>
        <ul>
          <li>Better handling of horde salvation</li>
          <li>Adding Threat on gloves abd Subtlety buff, automatically</li>
          <li>Thunderfury nerf</li>
          <li>Adding missdirection beta</li>
          <li>Nightbane Threat wipe when he flies</li>
        </ul>
      </div>
    </Dialog>
  );
};
