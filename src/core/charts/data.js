import { getScoreRaw } from "./transformation"

export async function getScoreData(stockExchange, timeInterval) {

  // Save dScoreRaw into a file
  // Verify if dScoreRaw older than X minutes. If so, fetch data from server again.

  let scoreRaw = await getScoreRaw(stockExchange, timeInterval)

  return scoreRaw.data
}