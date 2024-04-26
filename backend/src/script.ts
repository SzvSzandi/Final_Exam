import express from "express"
import cors from "cors"
import { z } from "zod"

const app = express()
app.use(cors())
app.use(express.json())

const data = [
    { id: 1, name: "Hotel Whatever", pricePerNightInUSD: 100 },
    { id: 2, name: "Hotel Whichever", pricePerNightInUSD: 200 },
    { id: 3, name: "Hotel Whoknowswhich", pricePerNightInUSD: 300 },
    { id: 4, name: "Hotel Whatelse", pricePerNightInUSD: 400 },
    { id: 5, name: "Hotel Something", pricePerNightInUSD: 400 },
    { id: 6, name: "Hotel Someotherthing", pricePerNightInUSD: 400 },
  ]
  
  const sleep = (seconds: number) =>
    new Promise<void>(resolve => setTimeout(() => resolve(), seconds*1000))
  
  const QuerySchema = z.union([
    z.object({ min: z.coerce.number(), max: z.coerce.number() }),
    z.object({ includes: z.string() }),
  ])
  
  app.get("/api/hotels", async (req, res) => {
    const validationResult = QuerySchema.safeParse(req.query)
    if (!validationResult.success) {
      console.log(JSON.stringify(validationResult.error.issues, null, 2))
      return res.sendStatus(400)
    }
    const query = validationResult.data
  
    await sleep(2)
    if (Math.random() > 0.95)
      return res.sendStatus(500)
    await sleep(2)
    
    if ('includes' in query)
      return res.json(data.filter(hotel =>
        hotel.name.includes(query.includes)))
    return res.json(data.filter(hotel =>
      hotel.pricePerNightInUSD >= query.min && hotel.pricePerNightInUSD <= query.max))
  })
  
  app.listen(3000)
