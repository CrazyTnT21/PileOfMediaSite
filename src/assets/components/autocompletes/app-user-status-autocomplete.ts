import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {UserStatus} from "../../openapi/user-status";
import {Observer} from "../../observer";
import {unsafeObjectKeys} from "../../unsafe-object-keys";

export const appUserStatusAutocompleteTexts = {
  ...appAutocompleteTexts,
  userStatus: "User status",
  notStarted: "Not started",
  ongoing: "Ongoing",
  paused: "Paused",
  finished: "Finished"
}

export class AppUserStatusAutocomplete extends AppAutocomplete<UserStatus>
{
  override readonly texts = new Observer(appUserStatusAutocompleteTexts);

  readonly valueMapping = new Observer({
    "NotStarted": "Not started",
    "Ongoing": "Ongoing",
    "Paused": "Paused",
    "Finished": "Finished"
  });

  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || this.texts.get("userStatus");
    await super.connectedCallback();
  }

  constructor()
  {
    super();
    this.texts.addListener("userStatus", (value) => this.label = value);
    this.matchLabelText("NotStarted", "notStarted");
    this.matchLabelText("Ongoing", "ongoing");
    this.matchLabelText("Paused", "paused");
    this.matchLabelText("Finished", "finished");
  }

  override async* searchItems(): AsyncGenerator<UserStatus[]>
  {
    yield unsafeObjectKeys(this.valueMapping.object());
  }

  override async* loadItems(): AsyncGenerator<UserStatus[]>
  {
    yield unsafeObjectKeys(this.valueMapping.object());
  }

  private matchLabelText(key: UserStatus, textKey: keyof typeof appUserStatusAutocompleteTexts): void
  {
    this.texts.addListener(textKey, (value) => this.valueMapping.set(key, value));
    this.valueMapping.addListener(key, (value) =>
    {
      const dataElement = this.getDataElementByValue(key);
      if (dataElement != null)
      {
        dataElement.innerText = value;
      }
      if (super.value == key)
        this.elements.input.value = value;
    });
  }

  public static override define(): void
  {
    if (customElements.get("app-user-status-autocomplete"))
      return;
    customElements.define("app-user-status-autocomplete", AppUserStatusAutocomplete);
  }

  override itemValue(item: UserStatus): any
  {
    return item;
  }

  override itemLabel(item: UserStatus): string | null
  {
    return this.valueMapping.get(item);
  }

  private getDataElementByValue(value: UserStatus): HTMLDataElement | null
  {
    return [...this.elements.items.children]
        .map((x): HTMLDataElement | null =>
            {
              const dataElement = (<HTMLDataElement>x.children[0]!);
              if (dataElement.value == value)
                return dataElement;
              return null
            }
        )
        .filter(x => x)[0] ?? null;
  }
}

AppUserStatusAutocomplete.define();

