export async function get(url)
{
  const result = await fetch(url);
  return result.json();
}

export async function post(url, value)
{
  const result = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  return result.json();
}

export async function put(url, value)
{
  const result = await fetch(url, {
    method: "PUT",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  return result.json();
}

export async function deleteHttp(url, query)
{
  // const result = await fetch(url, {
  //   method: "DELETE",
  //   mode: "cors",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
  // return result.json();
}
