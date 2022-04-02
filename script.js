class AtomicError extends Error {}

function atomic(fn) {
  let asyncGuard = 0;
  return async (...args) => {
    const guard = ++asyncGuard;
    const results = await fn(...args);
    if (asyncGuard !== guard) throw new AtomicError();
    return results;
  };
}

const processClipboardData = atomic(async (data) => {
  return Promise.all(
    Array.from(data)
      .filter((item) => item.type.indexOf("image") === 0)
      .map((item) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener("load", (event) =>
            resolve(event.target.result)
          );
          reader.addEventListener("error", (event) =>
            reject(event.target.error)
          );
          reader.readAsDataURL(item.getAsFile());
        }).catch((error) => {
          console.error(error);
        })
      )
  );
});

const galleryEle = document.querySelector("#gallery");

document.addEventListener("paste", async (event) => {
  event.preventDefault();
  const results = await processClipboardData(event.clipboardData.items);
  results.forEach((result) => {
    if (result) {
      const liEle = document.createElement("li");
      {
        {
          const imgEle = document.createElement("img");
          imgEle.src = result;
          liEle.appendChild(imgEle);
        }
        {
          const closeBtn = document.createElement("button");
          closeBtn.innerHTML = "×";
          liEle.appendChild(closeBtn);
          closeBtn.addEventListener("click", () => {
            galleryEle.removeChild(liEle);
          });
        }
      }
      galleryEle.appendChild(liEle);
    }
  });
});
