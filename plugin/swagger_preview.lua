local sp = require("swagger-preview")

vim.api.nvim_create_user_command("SwaggerPreviewStart", function()
	local buf = vim.api.nvim_get_current_buf()
	local spec_path = vim.api.nvim_buf_get_name(buf)

	if spec_path == "" then
		vim.notify("Current buffer has no file path.", vim.log.levels.ERROR)
		return
	end

	local error = sp.start_server(spec_path, buf)
	if error then
		vim.notify(error.message, error.level)
	end
end, {
	desc = "Start Swagger Preview server for current buffer",
})

vim.api.nvim_create_user_command("SwaggerPreviewStop", function()
	local msg = sp.stop_server()
	vim.notify(msg.message, msg.level)
end, {
	desc = "Stop Swagger Preview server",
})
