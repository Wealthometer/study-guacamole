// Spaced repetition algorithm based on difficulty ratings
// Difficulty: 0 = new, 1 = easy, 2 = medium, 3 = hard

export function calculateNextReview(difficulty: number, reviewCount: number): Date {
  const now = new Date()
  let daysUntilNext: number

  if (reviewCount === 0) {
    // First review
    daysUntilNext = 1
  } else {
    // Adjust based on difficulty
    switch (difficulty) {
      case 1: // Easy - show less frequently
        daysUntilNext = Math.min(30, Math.pow(2.5, reviewCount))
        break
      case 2: // Medium - standard interval
        daysUntilNext = Math.min(14, Math.pow(2, reviewCount))
        break
      case 3: // Hard - show more frequently
        daysUntilNext = Math.max(1, Math.floor(reviewCount * 0.5))
        break
      default: // New cards
        daysUntilNext = 1
    }
  }

  const nextReview = new Date(now)
  nextReview.setDate(nextReview.getDate() + daysUntilNext)
  return nextReview
}

export function sortCardsByPriority(cards: any[]): any[] {
  // Priority order:
  // 1. Hard cards that are due
  // 2. Other cards that are due
  // 3. New cards
  // 4. Future cards (shouldn't normally show these)

  const now = new Date()

  return cards.sort((a, b) => {
    const aNextReview = new Date(a.next_review)
    const bNextReview = new Date(b.next_review)
    const aDue = aNextReview <= now
    const bDue = bNextReview <= now

    // Both due - prioritize harder cards
    if (aDue && bDue) {
      return b.difficulty - a.difficulty
    }

    // One is due, one isn't
    if (aDue) return -1
    if (bDue) return 1

    // Neither due - prioritize new cards, then by next review date
    if (a.review_count === 0 && b.review_count > 0) return -1
    if (b.review_count === 0 && a.review_count > 0) return 1

    return aNextReview.getTime() - bNextReview.getTime()
  })
}
