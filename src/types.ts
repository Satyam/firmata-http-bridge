import Board from 'firmata';

export enum ErrorCodes {
  BAD_ACTION_TYPE = 1,
  BAD_PIN,
  BAD_MODE,
}

export type FSA<Type extends string = string, Payload = any, Meta = any> = {
  type: Type;
  payload?: Payload;
  meta?: Meta;
  error?: {
    code: ErrorCodes;
    msg: string;
  };
};

export type Commands<
  Type extends string = string,
  Payload = any,
  Meta = any
> = (
  board: Board,
  action: FSA<Type, Payload, Meta>
) => FSA<Type, Payload, Meta>;
