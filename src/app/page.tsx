import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div {...inter}>
      <h1>Fireside API</h1>
      <h2>Documentation:</h2>
      <h5>
        <a href="/api/hello">/api/hello</a>
      </h5>
      <p>Greets you</p>
      <h5>
        <a href="/api/example">/api/:gameID</a>
      </h5>
      <p>Gets data from the API</p>
    </div>
  );
}
