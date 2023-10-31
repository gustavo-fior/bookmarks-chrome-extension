let currentFolderid;

document
  .getElementById("saveBookmarkBtn")
  .addEventListener("click", function () {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      function (tabs) {
        let currentUrl = tabs[0].url;

        document.getElementById("saveBookmarkBtn").classList.add("disabled");
        document.getElementById("saveBookmarkBtn").innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';


        fetch(
          "https://bookmarks.gustavofior.com/api/trpc/bookmarks.create?batch=1",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              0: {
                json: {
                  url: currentUrl,
                  folderId: currentFolderid,
                },
              },
            }),
          }
        )
          .then((response) => response.json())
          .then((data) => {
              document.getElementById("saveBookmarkBtn").innerHTML = data[0].result.data.json.title.split(" ")[0] + " saved!";
              setTimeout(() => {
                  document.getElementById("saveBookmarkBtn").innerHTML = "Save";
                }, 2000);
                document.getElementById("saveBookmarkBtn").classList.remove("disabled");
            });
        }
    );
  });

chrome.cookies.getAll({}, function (cookies) {
  fetch("https://bookmarks.gustavofior.com/api/auth/session", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": cookies.filter(
        (cookie) => cookie.name === "__Host-next-auth.csrf-token"
      )[0].value,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const userId = data.user.id;

      fetch(
        `https://bookmarks.gustavofior.com/api/trpc/users.findByUserId,folders.findByUserId?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22userId%22%3A%22${userId}%22%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22userId%22%3A%22${userId}%22%7D%7D%7D
        `,
        {
          headers: {
            "X-CSRFToken": cookies.filter(
              (cookie) => cookie.name === "__Host-next-auth.csrf-token"
            )[0].value,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("folderName").classList.remove("spinner-border");
            document.getElementById("folderName").classList.remove("spinner-border-sm");
            document.getElementById("saveBookmarkBtn").classList.remove("disabled");

          document.getElementById("folderName").innerHTML =
            data[1].result.data.json[0].name;

          currentFolderid = data[1].result.data.json[0].id;
        });
    });
});
