export async function get(url: string, ...parameters: string[][])
{
  if (parameters.length > 0)
    url += "?";
  const parts = [];
  for (const parameter of parameters)
  {
    parts.push(parameter[0] + "=" + parameter[1]);
  }
  url += parts.join("&");
  const result = await fetch(url);
  return result.json();
}

export async function post<T>(url: string, value: T)
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

export async function put<T>(url: string, value: T)
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
