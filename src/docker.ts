import StartUp from "./index";

StartUp("app", process.env.CONFIG_URL, parseInt(process.env.SERVER_PORT));