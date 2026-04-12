import { Router, type IRouter } from "express";
import healthRouter from "./health";
import complaintsRouter from "./complaints";
import ideasRouter from "./ideas";
import newsRouter from "./news";
import dashboardRouter from "./dashboard";
import teamRouter from "./team";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/complaints", complaintsRouter);
router.use("/ideas", ideasRouter);
router.use("/news", newsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/team", teamRouter);

export default router;
