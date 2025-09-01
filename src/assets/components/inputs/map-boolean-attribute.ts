import {setOrRemoveAttribute, setOrRemoveBooleanAttribute} from "./common";

type GetSet<T, Value> = {
  get: (this: T) => Value,
  set: (this: T, value: Value) => void
};

type ValidAttributeName<T, Value> = T extends {
  attributeChangedCallback: any
} ? Value extends Parameters<T["attributeChangedCallback"]>[0] ? Value : never : Value;

export function mapBooleanAttribute<T extends HTMLElement, Value extends string>(attributeName: ValidAttributeName<T, Value>): (a: GetSet<T, boolean>, context: ClassAccessorDecoratorResult<T, boolean> & {
  name: string
}) => GetSet<T, boolean>
{
  return function ()
  {
    return {
      get: function (): boolean
      {
        return this.getAttribute(attributeName) == "";
      },
      set: function (value: boolean): void
      {
        setOrRemoveBooleanAttribute(this, attributeName, value);
      }
    }
  }
}

type StringAttribute = string | null | undefined;

export function mapStringAttribute<T extends HTMLElement, Value extends string>(attributeName: ValidAttributeName<T, Value>): (a: GetSet<T, StringAttribute>, context: ClassAccessorDecoratorResult<T, StringAttribute> & {
  name: string
}) => GetSet<T, string | null>
{
  return function ()
  {
    return {
      get: function (): string | null
      {
        return this.getAttribute(attributeName);
      },
      set: function (value: string | null): void
      {
        setOrRemoveAttribute(this, attributeName, value);
      }
    }
  }
}

type NumberAttribute = number | null | undefined;

export function mapNumberAttribute<T extends HTMLElement, Value extends string>(attributeName: ValidAttributeName<T, Value>): (a: GetSet<T, NumberAttribute>, context: ClassAccessorDecoratorResult<T, NumberAttribute> & {
  name: string
}) => GetSet<T, NumberAttribute>
{
  return function ()
  {
    return {
      get: function (): NumberAttribute
      {
        const attribute = this.getAttribute(attributeName);
        return attribute ? Number(attribute) : null;
      },
      set: function (value: NumberAttribute): void
      {
        setOrRemoveAttribute(this, attributeName, value?.toString());
      }
    }
  }
}
