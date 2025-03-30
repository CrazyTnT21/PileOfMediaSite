import {components} from "pileofmedia-openapi";
import {Config, getTranslatedField, logError} from "../classes/config";
import {AppCard} from "../components/app-card/app-card";
import {collect_ok, Err, Ok, Result} from "../result/result";
import {apiClient} from "../openapi/client";
import {queryParam} from "../components/inputs/common";

function createBookCard(x: components["schemas"]["Book"]): AppCard
{
  const {statistic} = x;
  const {translation} = getTranslatedField(x);

  const card = new AppCard();
  card.srcSet = translation.cover.versions.map(x => `${x.uri} ${x.width}w`).join(",");
  card.titleText = translation.title;
  card.alt = `${translation.title}`
  card.link = `/books/${x.slug}`;
  const publishedText = x.published ? Config.dateFormatter.format(new Date(x.published)) : ""
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
