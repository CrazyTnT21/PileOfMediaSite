import {NonEmptyString} from "./components/inputs/common";
import {Result} from "./result/result";

export type ErrorObject = { state: keyof ValidityStateFlags, userMessage: NonEmptyString };
export type ErrorResult = Result<void, ErrorObject>;
export type ErrorResultCallback = () => ErrorResult;
export type ErrorKey = number;

type ValidationInput = {
  readonly validity: ValidityState,
  readonly validationMessage: string
};

export function setValidityMap(input: ValidationInput, validityMessages: Map<keyof ValidityStateFlags, string>): void
{
  if (input.validity.valid)
    return;

  for (const x in input.validity)
  {
    if (x == "valid")
      return;

    if (input.validity[x as keyof ValidityState])
    {
      validityMessages.set(x as keyof ValidityStateFlags, input.validationMessage);
    }
  }
}
