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

export function join(...paths: string[])
{
  if (paths.length < 2)
    throw new Error(`Less than two paths were provided ${paths}`);

  let result = paths[0]!;
  for (let i = 1; i < paths.length; i++)
  {
    result = joinPart(result, paths[i]!);
  }
  return result;
}

function joinPart(path: string, secondPath: string)
{
  if (path.endsWith("/"))
  {
    if (secondPath.startsWith("/"))
      return path + secondPath.substring(1, secondPath.length);

    if (secondPath.startsWith("?"))
      return path.substring(0, path.length - 1) + secondPath;

    return path + secondPath;
  }
  if (secondPath.startsWith("/"))
    return path + secondPath;

  if (secondPath.startsWith("?"))
    return path + secondPath;

  if (path === "" && secondPath === "")
    return "";

  return path + "/" + secondPath;
}

export async function deleteHttp(url: string, query: string)
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
