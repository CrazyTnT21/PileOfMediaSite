import {IncludesString} from "../components/inputs/common";

export type Translation =
    {
      theme?: string;
      themes?: string;
      genre?: string;
      genres?: string;
      demography?: string;
      publisher?: string;
      start?: string;
      end?: string;
      chapter?: string;
      chapters?: string;
      score?: string;
      rank?: string;
      popularity?: string;
      favorites?: string;
      members?: string;
      cover?: string;
      image?: string;
      images?: string;
      title?: string;
      status?: string;
      books?: string;
      booksTitle?: string;
      book?: string;
      bookTitle?: string;
      bookTitleTemplate?: IncludesString<"{title}">;
      addBook?: string;
      addBookTitle?: string;
      addMovie?: string;
      addMovieTitle?: string;
      movie?: string;
      movies?: string;
      moviesTitle?: string;
      description?: string;
      noDescription?: string;
      involved?: string;
      comment?: string;
      comments?: string;
      commentVerb?: string;
      page?: string;
      pages?: string;
      word?: string;
      words?: string;
      published?: string;
      added?: string,
      reply?: string,
      replyVerb?: string
      popularTitle?: string;
      popular?: string;
      discoverTitle?: string;
      discover?: string;
      foryouTitle?: string;
      foryou?: string;
      topTitle?: string;
      top?: string;
      inputMinTextLengthValidation?: IncludesString<["{min}", "{currentLength}"]>;
      inputMaxTextLengthValidation?: IncludesString<["{max}", "{currentLength}"]>;
      required?: string;
      imageInputMinSizesValidation?: IncludesString<["{min}", "{fileSizes}"]>;
      imageInputMaxSizesValidation?: IncludesString<["{min}", "{fileSizes}"]>;
      valueMissing?: string;
      unsupportedImageType?: string;
      clearImage?: string;
      clearImages?: string;
      autocompleteItemNotFound?: IncludesString<"{value}">,
      autocompleteItemAlreadySelected?: IncludesString<"{value}">,
      language?: string;
      uploadCover?: string;
      graphicNovel?: string;
      graphicNovels?: string;
      game?: string;
      games?: string;
      show?: string;
      shows?: string;
      search?: string;
      headerShowingResults?: string;
      profile?: string;
      friends?: string;
      reviews?: string;
      settings?: string;
      preferences?: string;
      logout?: string;
      login?: string;
      signup?: string;
      newest?: string;
      highestRated?: string;
      favorite?: string;
      forgotPassword?: string;
      noAccount?: string;
      pleaseFillOutThisInput?: string;
    }
