/* *
 * Enumeration of the possible error codes.
 *
 * @export
 * @enum {number}
 */
export enum ErrorCodes {
  /** The FSA action contained an invalid `type` */
  BAD_ACTION_TYPE = 1,
  /** The action refered to a non-existing pin number */
  BAD_PIN,
  /** The mode requested for the pin is not supported */
  BAD_MODE,
  /** The output requested on the pin is out of range */
  BAD_OUTPUT,
}
/**
 * Describes a generic Flux Standard Action (FSA).
 * It is used to derive specific FSAs such as [[pinModeFSA]] or [[digitalWriteFSA]]
 * or tu describe generic FSAs
 *
 * @typeParam Type the `type` property of the action
 * @typeParam Payload the shape of the `payload` property of the action
 * @typeParam Meta the shape of the `meta` property of the action.
 */
export type FSA<Type extends string = string, Payload = any, Meta = any> = {
  type: Type;
  payload?: Payload;
  meta?: Meta;
  error?: {
    code: ErrorCodes;
    msg: string;
  };
};
