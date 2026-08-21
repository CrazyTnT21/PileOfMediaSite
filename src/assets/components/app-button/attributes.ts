import {AppButton} from "./app-button";
import {AttributeValue} from "../inputs/common";

export function disabledAttribute(element: AppButton, value: AttributeValue): void
{
  const internals = element["internals"];
  const disabled = element.isDisabledByFieldSet || value == "";
  const {button} = element["elements"];
  button.disabled = disabled;

  if (disabled)
  {
    internals.ariaDisabled = "";
    internals.states.add("disabled")
  }
  else
  {
    internals.ariaDisabled = null;
    internals.states.delete("disabled")
  }
}

export function typeAttribute(element: AppButton, value: AttributeValue): void
{
  const {button} = element["elements"];
  const validType = value && ["submit", "button", "reset"].includes(value);
  if (validType)
    button.type = value as "button" | "submit" | "reset"
  else
    button.type = "submit";
}

export function popovertargetAttribute(element: AppButton, value: AttributeValue): void
{
  const {button} = element["elements"];
  if (value == null)
  {
    button.popoverTargetElement = null;
    return;
  }
  const root = element.getRootNode() as HTMLDocument | ShadowRoot;
  button.popoverTargetElement = root.querySelector(`#${value}`);
}

