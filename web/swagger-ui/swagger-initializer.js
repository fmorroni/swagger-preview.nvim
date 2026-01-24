window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "/openapi",
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
  });

  const socket = new WebSocket("ws://" + window.location.host);

  socket.addEventListener("message", (event) => {
    switch (event.data) {
      case "r":
        const currentScroll = window.scrollY;
        ui.specActions.download();

        setTimeout(() => {
          window.scrollTo({ behavior: "instant", top: currentScroll });
        }, 500);
        break;
      default:
        console.log("Unknown command", event);
    }
  });

  socket.addEventListener("close", (event) => {
    if (event.code === 1) window.close();
  });
};
