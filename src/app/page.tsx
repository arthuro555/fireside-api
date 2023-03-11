import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Fireside API</h1>
      <h2>Downloads:</h2>
      <ul>
        <li>
          <Link href="/downloads/unity">Unity SDK</Link>
        </li>
        <li>
          <Link href="/downloads/gdevelop">GDevelop SDK</Link>
        </li>
        <li>
          <Link href="/downloads/unreal">Unreal Engine SDK</Link>
        </li>
      </ul>
      <h2>REST API Documentation:</h2>
      <p>
        The REST API always responds with JSON data. If an error has occured,
        the HTTP status code will still be 200, but the JSON will contain{" "}
        <code>{`{"error": "<error message>"}`}</code>.
      </p>
      <h3>Authentication</h3>
      <h4>Typical Flow</h4>
      <p>
        First, obtain an authentication request code using{" "}
        <a href="/api/auth/init">/api/auth/init</a>. Open a browser at{" "}
        <a href="/api/auth/oauth">/api/auth/oauth?state={"{authRequestUid}"}</a>{" "}
        for the user to log into discord from a trusted environement. Meanwhile,
        continuously send requests at{" "}
        <a href="/api/auth/poll">
          /api/auth/poll?authRequestUid={"{authRequestUid}"}
        </a>
        , until the request succeeds, which indicate that either the user
        successfully logged in, or that the attempt has failed, timed out, or
        been cancelled by the user.
      </p>
      <h4>Endpoints</h4>
      <h5>
        <a href="/api/auth/init">/api/auth/init</a>
      </h5>
      <p>
        Create an authentication request. This returns{" "}
        <code>{`{"authRequestUid": "<uuidv4>"}`}</code>.<br />
        This request UID is required to launch the oauth flow, and to acquire
        the results of the authentication request. It expires after 2 minutes.
      </p>
      <h5>
        <a href="/api/auth/oauth">/api/auth/oauth?state={"{authRequestUid}"}</a>
      </h5>
      <p>
        Launched the discord oauth authentication/authorization flow. Once
        completed, it will mark the authentication request as successful (or
        failed). The result of the oauth process can be queried via the polling
        endpoint up to 30 seconds after the end of the oauth flow.
      </p>
      <p>
        This endpoint cannot be called directly with an HTTP client. Rather, it
        should be opened in the user-trusted system browser for the user to log
        themselves in and approve of the oauth request.
      </p>
      <h5>
        <a href="/api/auth/poll">
          /api/auth/poll?authRequestUid={"{authRequestUid}"}
        </a>
      </h5>
      <p>
        Gets the result of an authentication request that has been fulfilled in
        a separate browser. Returns{" "}
        <code>{`{"error": "<error message>"}`}</code> if the authentication
        request failed. If it succeeded, it will contain:
      </p>
      <pre>
        <code>{`{
  "jwt": "<token> (for authentication on future APIs)", 
  "userData": {
    "is_the_marshmallow_toaster": "<boolean>";
    "is_marshal": "<boolean>";
    "is_kindling": "<boolean>";
    "is_flame": "<boolean>";
    "is_nitro_booster": "<boolean>";
    "membership_time_in_ms": "<number>";
    "username": "<string>";
    "avatarUrl": "<string>";
  }
}`}</code>
      </pre>
      <p>
        The endpoint will wait for the oauth flow to end before responding,
        blocking the connection until then. It is advised to use an asynchronous
        HTTP client to ensure the game is not frozen while waiting for the
        token.
      </p>
      <p>
        It is very probably that the connection will fail with a 504 (gateway
        timeout) error, or otherwise timeout before the end of the oauth flow.
        Even if authentication has not succeeded or the request is invalid, this
        endpoint will always return a status code of 200 (OK), so until it does,
        you can simply repeat the request over and over again each time it fails
        until you get the results.
      </p>
    </div>
  );
}
