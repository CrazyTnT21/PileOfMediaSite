import {components} from "pileofmedia-openapi";
import {Config, getTranslatedField, logError} from "../config";
import {AppCard} from "../components/app-card/app-card";
import {collect_ok, Err, Ok, Result} from "../result/result";
import {apiClient} from "../openapi/client";
import {last, queryParam} from "../components/inputs/common";
import {Temporal} from "temporal-polyfill";

function createBookCard(x: components["schemas"]["Book"]): AppCard
{
  const {statistic} = x;
  const {translation} = getTranslatedField(x);

  const card = new AppCard();
  const images = translation.cover.versions.toSorted((x, y) => x.width + x.height - (y.width + y.height))

  card.srcset = images.map(image =>
  {
    return {
      imageUri: image.uri,
      descriptor: {width: image.width}
    }
  });
  card.sizes = [...images.slice(0, -1).map(image =>
  {
    return {
      mediaCondition: `width >= ${image.width}px`,
      sourceSizeValue: `${image.width}px`
    }
  }),
    {
      sourceSizeValue: `${last(images).unwrap().width}px`
    }]
  card.itemTitle = translation.title;
  card.coverAlt = `${translation.title}`
  card.href = `/books/${x.slug}`;
  let publishedText;
  if (x.published)
  {
    const formattedYear = Temporal.PlainDate.from(x.published)
      .withCalendar("gregory")
      .toPlainYearMonth()
      .toLocaleString(Config.config.locales, {
        year: "numeric"
      });
    publishedText = `(${formattedYear})`;
  }
  else
  {
    publishedText = "";
  }
  const scoreText = statistic.rating.score ? `<span class="icon" style="font-size: 1rem">star</span> ` + statistic.rating.score.toString() : "";
  const connect = publishedText && scoreText ? " • " : ""
  card.innerHTML = `<div class="extra" slot="extra" class="center-align">${publishedText} ${connect} ${scoreText} </div>`
  return card;
}

const {error} = collect_ok(...await Promise.all([
  append("#popular", 0),
  append("#top", 1)
]));
if (error)
  logError(error);

//TODO All Media & Sort
async function append(id: string, page: number): Promise<Result<void, Error>>
{
  const {data, error} = await apiClient.GET("/books", {params: {...queryParam(page, 12)}});

  if (!data)
    return new Err(new Error(error));

  for (const item of data.items)
  {
    const li = document.createElement("li");
    const card = createBookCard(item)
    li.append(card);
    document.querySelector(id)!.append(li);
  }
  return new Ok(undefined)
}
