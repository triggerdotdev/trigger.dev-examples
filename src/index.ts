require("dotenv").config();
import { postMessage } from "./examples/slack-message";
postMessage.listen();
