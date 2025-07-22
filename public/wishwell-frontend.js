
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#wish-form");
  const nameInput = document.querySelector("#name");
  const messageInput = document.querySelector("#message");
  const status = document.querySelector("#status");
  const messageList = document.querySelector("#message-list");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!message) {
      status.textContent = "Message cannot be empty.";
      return;
    }

    try {
      const res = await fetch("../api/saveWebMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      const text = await res.text();
      status.textContent = text;

      // Reset form
      nameInput.value = "";
      messageInput.value = "";

      // Refresh messages
      fetchMessages();
    } catch (err) {
      status.textContent = "Failed to send message.";
    }
  });

  async function fetchMessages() {
    try {
      const res = await fetch("../api/getMessage");
      const messages = await res.json();

      messageList.innerHTML = "";
      messages
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .forEach((msg) => {
          const item = document.createElement("li");
          item.textContent = `${msg.name} (${msg.via}) – ${msg.message}`;
          messageList.appendChild(item);
        });
    } catch (err) {
      messageList.innerHTML = "<li>Failed to load messages.</li>";
    }
  }

  fetchMessages();
});
