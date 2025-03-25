import express from "express";
import { responsesCollection, domainsCollection, model } from '../../server.js'
const router = express.Router();

router.get("/domains", async (req, res) => {
    try {
      const docs = await domainsCollection.find({}).toArray();
      res.json({ domains: docs.map((doc) => doc.domain).filter(Boolean) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get("/domains/:domain/subdomains", async (req, res) => {
    try {
      const doc = await domainsCollection.findOne({ domain: req.params.domain });
      if (!doc) return res.status(404).json({ error: "Domain not found" });
      res.json({ subdomains: doc.subDomains.map((sd) => sd.name).filter(Boolean) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get("/domains/:domain/subdomains/:subdomain/questions", async (req, res) => {
    try {
      const doc = await domainsCollection.findOne({ domain: req.params.domain });
      if (!doc) return res.status(404).json({ error: "Domain not found" });
      const subdomain = doc.subDomains.find((sd) => sd.name === req.params.subdomain);
      if (!subdomain) return res.status(404).json({ error: "Subdomain not found" });
      res.json({ questions: subdomain.questions.map((q) => q.text).filter(Boolean) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.post("/submit", async (req, res) => {
    try {
      const { user_name, responses } = req.body;
      const responseItems = await Promise.all(
        responses.map(async (item) => ({
          main_question: item.main_question,
          embedding: Array.from(await model(item.main_question)),
          response: item.response,
        }))
      );
  
      const existingUser = await responsesCollection.findOne({ "User name": user_name });
      if (existingUser) {
        const updatedResponses = existingUser.responses.map((oldItem) => {
          const newItem = responseItems.find((newItem) => newItem.main_question === oldItem.main_question);
          return newItem ? { ...oldItem, ...newItem } : oldItem;
        });
        await responsesCollection.updateOne(
          { "User name": user_name },
          { $set: { responses: updatedResponses.concat(responseItems) } }
        );
        return res.json({ message: "Response updated" });
      }
      await responsesCollection.insertOne({ "User name": user_name, responses: responseItems });
      res.json({ message: "Response submitted" });
    } catch (err) {
      res.status(500).json({ error: "Error submitting responses: " + err.message });
    }
  });
  
  router.post("/find_similar", async (req, res) => {
    try {
      const { user_name, question } = req.body;
      const questionEmbedding = await model(question);
      const userDoc = await responsesCollection.findOne({ "User name": user_name });
      if (!userDoc) return res.json({ responses: null });
      
      const cosineSimilarity = (a, b) => {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const normA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
        const normB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
        return dotProduct / (normA * normB + 1e-10);
      };
  
      const similarResponses = userDoc.responses.filter((item) =>
        cosineSimilarity(questionEmbedding, item.embedding) > 0.8
      ).map((item) => item.response);
  
      res.json({ responses: similarResponses.length ? similarResponses : null });
    } catch (err) {
      res.status(500).json({ error: "Error finding similar questions: " + err.message });
    }
  });

  export default router;