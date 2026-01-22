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
        // TODO: find if there is better way that doesn't pollute the url.
        ui.specActions.updateUrl("/openapi?ts=" + Date.now());
        ui.specActions.download();
        break;
      default:
        console.log("Event", event);
    }
  });

  socket.addEventListener("close", () => {
    window.close();
  });
};
