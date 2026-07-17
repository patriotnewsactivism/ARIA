import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentRouter from "./agent";
import tasksRouter from "./tasks";
import conversationsRouter from "./conversations";
import shellRouter from "./shell";
import integrationsRouter from "./integrations";
import memoryRouter from "./memory";
import actionsRouter from "./actions";
import workflowsRouter from "./workflows";
import openaiRouter from "./openai";
import apexRouter from "./apex";

const router: IRouter = Router();

router.use(healthRouter);
router.use(agentRouter);
router.use(tasksRouter);
router.use(conversationsRouter);
router.use(shellRouter);
router.use(integrationsRouter);
router.use(memoryRouter);
router.use(actionsRouter);
router.use(workflowsRouter);
router.use("/openai", openaiRouter);
router.use(apexRouter);

export default router;
