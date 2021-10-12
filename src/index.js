import setup from "./scripts/setup";
import Plot from "./scripts/plot";
import train from "./scripts/train";

setup();
const plot = new Plot();
train();
