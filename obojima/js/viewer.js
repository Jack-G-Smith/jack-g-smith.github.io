function getUser() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

async function decryptArchive(user, password) {
  const url = `PRIVATE/${user}.tar.enc`;
  const data = new Uint8Array(await fetch(url).then(r => r.arrayBuffer()));

  const iv = data.slice(0, 12);
  const tag = data.slice(data.length - 16);
  const ciphertext = data.slice(12, data.length - 16);

  const keyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);

  return new Uint8Array(await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    ciphertext
  ));
}

(async () => {
  const user = getUser();
  if (!user) {
    document.getElementById("content").textContent = "Missing ?user= parameter";
    return;
  }

  document.getElementById("title").textContent = `Private notes for ${user}`;
  const password = prompt(`Password for ${user}:`);
  if (!password) return;

  try {
    const decrypted = await decryptArchive(user, password);
    const files = await untar(decrypted.buffer);

    const container = document.getElementById("content");
    container.innerHTML = "";
    for (const file of files) {
      const pre = document.createElement("pre");
      pre.textContent = file.name + "\n\n" + new TextDecoder().decode(file.buffer);
      container.appendChild(pre);
    }
  } catch (e) {
    console.error(e);
    document.getElementById("content").textContent = "Wrong password or corrupted archive.";
  }
})();
