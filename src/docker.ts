import { boot } from "./index";

boot(process.env.CONFIG_URL, parseInt(process.env.SERVER_PORT));