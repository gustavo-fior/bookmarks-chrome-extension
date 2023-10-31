document
  .getElementById("saveBookmarkBtn")
  .addEventListener("click", function () {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      function (tabs) {
        let currentUrl = tabs[0].url;
        console.log(currentUrl);
      }
    );
  });

const authUrl = `https://bookmarks.gustavofior.com/`;

//
document.getElementById("loginBtn").addEventListener("click", function () {
  console.log(chrome);

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    function (redirectUrl) {
      console.log(redirectUrl);
    }
  );
});
