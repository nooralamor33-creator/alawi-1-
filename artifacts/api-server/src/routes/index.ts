import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import friendsRouter from "./friends";
import chatRouter from "./chat";
import groupsRouter from "./groups";
import channelsRouter from "./channels";
import rewardsRouter from "./rewards";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(friendsRouter);
router.use(chatRouter);
router.use(groupsRouter);
router.use(channelsRouter);
router.use(rewardsRouter);

export default router;
