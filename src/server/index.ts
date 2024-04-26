import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { createProxyMiddleware } from 'http-proxy-middleware';

const assetsProxy = createProxyMiddleware({
  target: 'http://localhost:8003',
  changeOrigin: true,
  router: {
    '/apps/landing': 'http://localhost:8003'
  }
})


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(assetsProxy)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
