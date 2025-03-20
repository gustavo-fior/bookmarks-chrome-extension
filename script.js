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
          '<span class="spinner-border spinner-border-sm"></span>';

        fetch(
          "https://www.vayo.me/api/trpc/bookmarks.create?batch=1",
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
            if (
              data[0].error !== undefined && data[0].error.json.message === "Bookmark already exists"
            ) {
              document.getElementById(
                "saveBookmarkBtn"
              ).innerHTML = `<span class="animate__animated animate__fadeIn">❌ Duplicate</span>`;
            } else if (data[0].error !== undefined ) {
              document.getElementById(
                "saveBookmarkBtn"
              ).innerHTML = `<span class="animate__animated animate__fadeIn">❌ Error</span>`;
            } else {
              document.getElementById(
                "saveBookmarkBtn"
              ).innerHTML = `<span class="animate__animated animate__fadeIn">✔️</span>`;
            }

            console.log(data);

            setTimeout(() => {
              document.getElementById(
                "saveBookmarkBtn"
              ).innerHTML = `<span class="animate__animated animate__fadeIn">Save</span>`;
            }, 2000);
            document
              .getElementById("saveBookmarkBtn")
              .classList.remove("disabled");
          });
      }
    );
  });

chrome.cookies.getAll({}, function (cookies) {
  try {
    fetch("https://www.vayo.me/api/auth/session", {
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
        if (data.user) {
          const userId = data.user.id;

          fetch(
            `https://www.vayo.me/api/trpc/users.findByUserId,folders.findByUserId?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22userId%22%3A%22${userId}%22%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22userId%22%3A%22${userId}%22%7D%7D%7D
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
              const folderSelect = document.getElementById("folderSelect");

              const saveBtn = document.getElementById("saveBookmarkBtn");
              saveBtn.classList.remove("disabled");

              saveBtn.innerHTML = `<span class="animate__animated animate__fadeIn">Save</span>`;

              // Remove the spinner option
              const spinnerOption =
                folderSelect.querySelector("#spinnerOption");
              if (spinnerOption) {
                folderSelect.removeChild(spinnerOption);
              }

              data[1].result.data.json.forEach((folder) => {
                const option = document.createElement("option");
                option.text = folder.icon + " " + folder.name;
                option.value = folder.id;
                option.classList.add("select-option");
                folderSelect.add(option);
              });

              currentFolderid = data[1].result.data.json[0].id;

              folderSelect.addEventListener("change", function () {
                currentFolderid = folderSelect.value;
              });
            });
        } else {
          const saveBtn = document.getElementById("saveBookmarkBtn");
          saveBtn.classList.remove("disabled");
          saveBtn.innerHTML = `<a href="https://www.vayo.me" target="_blank" style="text-decoration: none; color: black;"
        ><span class="animate__animated animate__fadeIn">Log in</span></a>`;
        }
      });
  } catch (error) {
    console.log(error);

    const saveBtn = document.getElementById("saveBookmarkBtn");
    saveBtn.classList.remove("disabled");
    saveBtn.innerHTML = `<a href="https://www.vayo.me" target="_blank" style="text-decoration: none; color: black;"
    ><span class="animate__animated animate__fadeIn">Log in</span></a>`;
  }
});

// Add the spinner option while the folders are loading
const folderSelect = document.getElementById("folderSelect");
const spinnerOption = document.createElement("option");
spinnerOption.id = "spinnerOption";
spinnerOption.text = "Loading...";
folderSelect.add(spinnerOption);
