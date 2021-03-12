import Board from 'firmata';

export const validDigitalPin = (board: Board, pin: number) =>
  pin >= 0 && pin <= board.pins.length;

export const validMode = (board: Board, pin: number, mode: Board.PIN_MODE) =>
  board.pins[pin].supportedModes.includes(mode);

export const validOutput = (
  board: Board,
  pin: number,
  output: Board.PIN_STATE
) => output === Board.PIN_STATE.LOW || output === Board.PIN_STATE.HIGH;
