export async function get(url, ...parameters)
{
  if (parameters.length > 0)
    url += "?";
  for (let i = 0; i < parameters.length; i++)
  {
    url += parameters[i][0] + "=" + parameters[i][1];
  }
  const result = await fetch(url);
  return result.json();
}

export const server_Url = "http://localhost:3000/";

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
