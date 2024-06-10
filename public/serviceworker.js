self.addEventListener("push", function (event) {
  console.log("Push message received.");
  let notificationTitle = "New notification";
  const notificationOptions = {
    body: "no data",
    // icon: "./images/logo-192x192.png",
    // badge: "./images/badge-72x72.png",
    data: {
      url: "https://web.dev/push-notifications-overview/",
    },
  };

  if (event.data) {
    const dataText = event.data.text();
    notificationTitle = "Received Payload";
    notificationOptions.body = `Push data: '${dataText}'`;
  }

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions),
  );
});
