import {mapSelectors} from "../../../dom";
import {
  AppLanguageAutocomplete, LanguageAutocompleteTag,
} from "../../../components/autocompletes/app-language-autocomplete";
import {AppButton} from "../../../components/app-button/app-button";
import {Config} from "../../../config";
import {NonEmptyArray} from "../../../components/inputs/common";
import {SelectedAddedEvent} from "../../../components/autocompletes/app-autocomplete/selected-added-event";
import {SelectedRemovedEvent} from "../../../components/autocompletes/app-autocomplete/selected-removed-event";

type Elements = { language: AppLanguageAutocomplete, submit: AppButton, form: HTMLFormElement, reset: AppButton };

async function main(): Promise<void>
{
  const elements = mapSelectors<Elements>(document, {
    language: "app-language-autocomplete",
    submit: "#submit",
    reset: "#reset-button",
    form: "form"
  })
  await customElements.whenDefined(genericValue<LanguageAutocompleteTag>("app-language-autocomplete"));

  setSelectedConfig(elements);
  elements.language.addEventListener(SelectedRemovedEvent.type, () => setLocales(elements));
  elements.language.addEventListener(SelectedAddedEvent.type, () => setLocales(elements))
  elements.form.addEventListener("reset", e =>
  {
    e.preventDefault();
    Config.config = Config.default();
    Config.saveConfiguration();
    setSelectedConfig(elements);
  })
}

await main();

function genericValue<T>(value: T): T
{
  return value;
}

function setLocales(elements: Elements): void
{
  const locales = elements.language.selected.map(x => new Intl.Locale(x.toLowerCase()));
  if (locales.length == 0)
  {
    Config.config = Config.default();
    Config.saveConfiguration();
    setSelectedConfig(elements);
  }
  else
  {
    Config.config.locales = locales as NonEmptyArray<Intl.Locale>;
    Config.saveConfiguration();
  }
}

function setSelectedConfig(elements: Elements): void
{
  elements.language.selected = [];
  for (const x of Config.config.locales)
  {
    const item = elements.language.findValue(x.language.toUpperCase());
    if (!item)
      continue;
    if (!elements.language.findSelected(item))
    {
      elements.language.addSelected(item);
    }
  }
}
