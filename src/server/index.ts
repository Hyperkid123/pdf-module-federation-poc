import express from "express";
import dotenv from "dotenv";
import path from "path";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { generatePdf } from "./generatePdf";

const assetsProxy = createProxyMiddleware({
  target: 'http://localhost:8003',
  changeOrigin: true,
  pathFilter: (path) => path.startsWith('/apps') || path.startsWith('/api'),
  router: {
    '/apps/landing': 'http://localhost:8003',
    '/api': 'https://console.stage.redhat.com/'
  }
})


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(assetsProxy)

app.get("/", (_req, res) => {
  res.send("Express + TypeScript Server");
});

app.get("/pdf", (_req, res) => {
  generatePdf().then((pdf) => {
    res.contentType("application/pdf");
    res.status(200);
    res.send(pdf);
  }).catch((error) => {
    res.status(500);
    res.send(error);
  })
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
