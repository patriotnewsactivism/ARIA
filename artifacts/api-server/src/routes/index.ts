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
import { rateLimit } from "../middlewares/rate-limit";

const router: IRouter = Router();

const strict = rateLimit({ windowMs: 60_000, max: 10, message: { error: "Too many requests" } });

router.use(healthRouter);
router.use(agentRouter);
router.use(tasksRouter);
router.use(conversationsRouter);
router.use("/shell", strict, shellRouter);
router.use("/integrations", strict, integrationsRouter);
router.use(memoryRouter);
router.use(actionsRouter);
router.use(workflowsRouter);
router.use("/openai", strict, openaiRouter);
router.use("/apex", strict, apexRouter);

export default router;
