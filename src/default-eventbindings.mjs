import {
  EventKey,
  deleteCellContent,
  moveToCellAhead,
  moveToCellBehind,
  moveToCellDown,
  moveToCellLeft,
  moveToCellRight,
  moveToCellUp,
  moveToClueAhead,
  moveToClueBehind,
  toggleClueDirection,
} from './crossword-gridview.mjs';

// eventBinding = {eventName,keyBindings[keybinding,...]}
// keybinding =  {key, action}
// action = (controller, event, eventCell) => {...}

const defaultKeyDownBinding = {
  eventName: 'keydown',
  keyBindings: [
    {
      key: EventKey.backspace,
      action: (controller, event, eventCell) => {
        deleteCellContent(controller, event, eventCell);
        moveToCellBehind(controller, eventCell);
      },
    },
    {
      key: EventKey.delete,
      action: (controller, event, eventCell) => {
        deleteCellContent(controller, event, eventCell);
      },
    },
    {
      key: EventKey.enter,
      action: (controller, event, eventCell) => {
        toggleClueDirection(controller, eventCell);
      },
    },
    {
      key: EventKey.tab,
      action: (controller, event, eventCell) => {
        event.shiftKey
          ? moveToClueBehind(controller, eventCell)
          : moveToClueAhead(controller, eventCell);
      },
    },
    {
      key: EventKey.space,
      action: (controller, event, eventCell) => {
        event.shiftKey
          ? moveToCellBehind(controller, eventCell)
          : moveToCellAhead(controller, eventCell);
      },
    },
  ],
};

const defaultKeyUpBinding = {
  eventName: 'keyup',
  keyBindings: [
    {
      key: EventKey.left,
      action: (controller, event, eventCell) => {
        moveToCellLeft(controller, eventCell);
      },
    },
    {
      key: EventKey.up,
      action: (controller, event, eventCell) => {
        moveToCellUp(controller, eventCell);
      },
    },
    {
      key: EventKey.right,
      action: (controller, event, eventCell) => {
        moveToCellRight(controller, eventCell);
      },
    },
    {
      key: EventKey.down,
      action: (controller, event, eventCell) => {
        moveToCellDown(controller, eventCell);
      },
    },
  ],
};

export { defaultKeyDownBinding, defaultKeyUpBinding };
