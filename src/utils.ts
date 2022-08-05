// TODO: Add support for query params
export async function fetchApi<T = unknown>({
  path,
  method = 'GET',
  body,
}: {
  path: string,
  method?: string,
  body?: BodyInit,
}): Promise<T> {
  const res = await fetch(`${process.env.REACT_APP_API_ROOT}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body,
  });
  if (!res.ok) throw new Error(String(res.status));
  const contentType = res.headers.get('Content-Type');
  if (contentType?.startsWith('application/json')) {
    const data = await res.json();
    return data as T;
  }
  return null as unknown as T;
}
