// VERSION: 1.0.0
// Diagnosi temporanea per l'amministratore: chi e' entrato, se e' collegato
// al suo profilo, gli ultimi eventi. Risponde solo con la chiave
// DIAGNOSI_TOKEN (impostata su Vercel); senza, fa finta di non esistere.
import { tutti, ultimi, eventi } from "../lib/db.js";

export default async function handler(req, res) {
  const chiave = process.env.DIAGNOSI_TOKEN || "";
  if (chiave.length < 32 || req.headers["x-diagnosi"] !== chiave) return res.status(404).send("Not found");
  const [utenti, profili, generazioni, registro] = await Promise.all([tutti("utenti"), tutti("profili"), ultimi("generazioni", 100), eventi(600)]);
  const nome = (id) => (profili[id] || {}).nome || null;
  const righe = Object.values(utenti).map((u) => ({
    email: u.email, nomeGoogle: u.nome, profilo: u.profilo, nomeProfilo: nome(u.profilo),
    coerente: !u.profilo || (profili[u.profilo] && profili[u.profilo].email === u.email),
    lasciato: u.lasciato || null, primo: u.primo, ultimo: u.ultimo, accessi: u.accessi,
  })).sort((a, b) => String(b.ultimo).localeCompare(String(a.ultimo)));
  const profiliConEmail = Object.values(profili).filter((p) => p.email).map((p) => ({ id: p.id, nome: p.nome, email: p.email, utente: !!utenti[p.email], utenteProfilo: (utenti[p.email] || {}).profilo || null }));
  return res.status(200).json({
    adesso: new Date().toISOString(),
    profili: Object.keys(profili).length, utenti: righe.length,
    righe, profiliConEmail,
    generazioni: generazioni.map((g) => ({ quando: g.quando, chi: g.chi, modo: g.modo, idee: (g.idee || []).length, modello: g.modello, usd: g.costo && g.costo.usd })),
    eventi: registro,
  });
}
