import { Router, type IRouter } from "express";
import healthRouter from "./health";
import complaintsRouter from "./complaints";
import eventsRouter from "./events";
import ideasRouter from "./ideas";
import newsRouter from "./news";
import dashboardRouter from "./dashboard";
import teamRouter from "./team";
import settingsRouter from "./settings";
import citizensRouter from "./citizens";
import teamApplicationsRouter from "./team-applications";
import adminAuthRouter from "./admin-auth";
import fundRouter from "./fund";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin", adminAuthRouter);
router.use("/complaints", complaintsRouter);
router.use("/events", eventsRouter);
router.use("/ideas", ideasRouter);
router.use("/news", newsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/team", teamRouter);
router.use("/settings", settingsRouter);
router.use("/citizens", citizensRouter);
router.use("/team-applications", teamApplicationsRouter);
router.use("/fund", fundRouter);

export default router;
