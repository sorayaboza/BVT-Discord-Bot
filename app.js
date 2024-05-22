import express from 'express'
import { getVoiceData, getOneVoice, createVoiceData } from './database.js'

const app = express()
const hostname = '127.0.0.1';
const port = 3000;

app.use(express.json())

// http://localhost:8080/voicedata/ shows all of the data.
app.get("/voicedata", async (req, res) => {
    const voicedata = await getVoiceData()
    res.send(voicedata)
})

// http://localhost:8080/voicedata/2 would get you the user with ID 2.
app.get("/voicedata/:id", async (req, res) => {
    const id = req.params.id
    const voicedata = await getOneVoice(id)
    res.send(voicedata)
})

app.post("/voicedata", async (req,res) => {
    const { userID, totalHours } = req.body
    const voicedata = await createVoiceData(userID, totalHours)
    res.status(201).send(voicedata)
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/voicedata`);
  });
  