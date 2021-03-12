import Board from 'firmata';

export const validDigitalPin = (board: Board, pin: number) =>
  pin >= 0 && pin <= board.pins.length;

export const validMode = (board: Board, pin: number, mode: Board.PIN_MODE) =>
  board.pins[pin].supportedModes.includes(mode);
