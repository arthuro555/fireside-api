using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public static class Fireside
{
    private static readonly string URL = "https://fireside.arthuro555.com/api/";
    private static readonly string AUTH_INIT_ENDPOINT = URL + "auth/init";
    private static readonly string OAUTH_ENDPOINT = URL + "auth/oauth";
    private static readonly string AUTH_POLL_ENDPOINT = URL + "auth/poll";

    [System.Serializable]
    private class AuthRequestResponse
    {
        /// The secret to claim the token of
        public string authRequestUid;
    }

    [System.Serializable]
    private class AuthSuccessResponse
    {
        /// An error message, if one happened during the authentication process.
        public string error;

        /// The authentication token.
        public string jwt;

        /// The JWT contents, conveniently pre-parsed & verified for us.
        public UserData userData;
    }

    [System.Serializable]
    public class UserData
    {
        public bool is_the_marshmallow_toaster;
        public bool is_marshal;
        public bool is_kindling;
        public bool is_flame;
        public bool is_nitro_booster;
        public int membership_time_in_ms;
        public string username;
        public string avatarUrl;
    }

    private static UserData currentUser = null;
    private static string currentToken = null;

    public static UserData GetCurrentUser()
    {
        if (currentUser == null)
        {
            Debug.LogWarning(
                "[Fireside] Fireside.GetCurrentUser was used before a user was fetched. Use Fireside.Authenticate first and await the success callback before using the current user!"
            );
        }
        ;
        return currentUser;
    }

    public static IEnumerator Authenticate(
        System.Action<UserData> OnAuthenticated,
        System.Action<string> OnFail
    )
    {
        // Request an authentication code for polling
        UnityWebRequest initRequest = UnityWebRequest.Get(AUTH_INIT_ENDPOINT);
        yield return initRequest.SendWebRequest();
        if (initRequest.result == UnityWebRequest.Result.ConnectionError)
        {
            OnFail.Invoke("[Fireside API] Could not initiate authentication: " + initRequest.error);
            yield break;
        }

        // We received our authentication code, we can launch authentication with it in the browser.
        var authRequest = JsonUtility.FromJson<AuthRequestResponse>(
            initRequest.downloadHandler.text
        );
        Application.OpenURL(OAUTH_ENDPOINT + "?state=" + authRequest.authRequestUid);

        UnityWebRequest pollRequest = UnityWebRequest.Get(
            AUTH_POLL_ENDPOINT + "?authRequestUid=" + authRequest.authRequestUid
        );

        // Now we'll wait for the results to arrive. Replay the request if it times out without a result.
        while (pollRequest.result != UnityWebRequest.Result.Success)
        {
            pollRequest = UnityWebRequest.Get(
                AUTH_POLL_ENDPOINT + "?authRequestUid=" + authRequest.authRequestUid
            );
            yield return pollRequest.SendWebRequest();
        }

        var authResponse = JsonUtility.FromJson<AuthSuccessResponse>(
            pollRequest.downloadHandler.text
        );

        Debug.Log(pollRequest.downloadHandler.text);

        if (authResponse.error != null)
            OnFail.Invoke("[Fireside API] The authentication has failed: " + authResponse.error);
        else if (authResponse.userData == null)
            OnFail.Invoke("[Fireside API] Backend did not return a user :/");
        else
        {
            currentUser = authResponse.userData;
            currentToken = authResponse.jwt;
            OnAuthenticated.Invoke(currentUser);
        }
    }
}
