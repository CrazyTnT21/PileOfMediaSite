import {IncludesString} from "../components/inputs/common";
import type * as translation from "../translations/translation_EN.json"

export type Translation = Partial<typeof translation & {
  bookTitleTemplate: IncludesString<"{title}">;
  inputMinTextLengthValidation: IncludesString<["{min}", "{currentLength}"]>;
  inputMaxTextLengthValidation: IncludesString<["{max}", "{currentLength}"]>;
  imageInputMinSizesValidation: IncludesString<["{min}", "{fileSizes}"]>;
  imageInputMaxSizesValidation: IncludesString<["{min}", "{fileSizes}"]>;
  autocompleteItemNotFound: IncludesString<"{value}">,
  autocompleteItemAlreadySelected: IncludesString<"{value}">,
}>;
