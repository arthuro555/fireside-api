export default function AuthSuccessPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      <h1>Authentication failed...</h1>
      <p>
        Discord notified us that the authentication attempt failed. Please try
        again.
      </p>
      {!!searchParams && !!searchParams.error && (
        <p>Error: {searchParams.error}</p>
      )}
    </>
  );
}
