/**
 * Contains various utility functions
 * @module
 */
import type Board from 'firmata';

/**
 * Validates that the pin number given is within the range of pins of the board.
 * @param board instance of the active board
 * @param pin number of the pin to be verified
 * @returns true if the pin number is valid for the given board
 */
export const validDigitalPin = (board: Board, pin: number) =>
  pin >= 0 && pin <= board.pins.length;
/**
 * Validates that the mode specified for the pin is supported the given board
 * @param board instance of the active board
 * @param pin number of the pin to be set
 * @param mode Intended mode to be set
 * @returns true if the mode is valid for that pin
 */
export const validMode = (board: Board, pin: number, mode: Board.PIN_MODE) =>
  board.pins[pin].supportedModes.includes(mode);
/**
 * Validates that the value to be set is either 0 or 1.
 * @param board instance of the active board
 * @param pin number of the pin to be set
 * @param output value to be set
 * @returns true if it is either 0 or 1
 */
export const validOutput = (
  board: Board,
  pin: number,
  output: Board.PIN_STATE
) => output === board.LOW || output === board.HIGH;
