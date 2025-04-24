/// <reference lib="dom" />
import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { PinataSDK } from 'pinata';

interface Bindings {
  PINATA_JWT: string;
  GATEWAY_URL: string;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/presigned_url', async (c) => {

	// Handle Auth

  const pinata = new PinataSDK({
    pinataJwt: c.env.PINATA_JWT,
    pinataGateway: c.env.GATEWAY_URL
  })

  const url = await pinata.upload.public.createSignedURL({
    expires: 60 // Last for 60 seconds
  })

  return c.json({ url }, { status: 200 })
})
app.post('/upload_zip', async (c) => {
  const pinata = new PinataSDK({
    pinataJwt: c.env.PINATA_JWT,
    pinataGateway: c.env.GATEWAY_URL
  });

  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return c.json({ error: "Missing or invalid file" }, { status: 400 });
  }

  const cid = await pinata.upload.public.file(file);
  return c.json({ cid: cid.cid }, { status: 200 });
});
export default app