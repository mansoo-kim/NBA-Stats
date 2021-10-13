import { setupModal, setupStatsDescriptions, setupMLInputSelects, setupMLButtons } from "./scripts/setup";
import ML from "./scripts/ml";
import Vis from "./scripts/vis";

setupModal();
setupStatsDescriptions();
setupMLInputSelects();

const plot = new Vis();
const ml = new ML();

setupMLButtons(plot, ml);
