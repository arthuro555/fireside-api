export const GET = async () => {
  return new Response(
    await (
      await fetch(
        "https://raw.githubusercontent.com/arthuro555/fireside-api/master/src/sdks/gdevelop/Fireside.json"
      )
    ).text(),
    {
      headers: {
        "Content-Disposition": `attachment; filename="Fireside.json"`,
      },
    }
  );
};
