local sp = require("swagger-preview")

vim.api.nvim_create_user_command("SwaggerPreviewStart", function()
	local buf = vim.api.nvim_get_current_buf()
	local spec_path = vim.api.nvim_buf_get_name(buf)

	if spec_path == "" then
		vim.notify("Current buffer has no file path.", vim.log.levels.ERROR)
		return
	end

	local spec_root = vim.fn.fnamemodify(spec_path, ":h")
	local spec_main_file = vim.fn.fnamemodify(spec_path, ":t")

	local error = sp.start_server(spec_root, spec_main_file)

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
