/*
 * Enumeration of the possible error codes.
 *
 * @export
 * @enum {number}
 */
export enum ErrorCodes {
  BAD_ACTION_TYPE = 1,
  BAD_PIN,
  BAD_MODE,
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
