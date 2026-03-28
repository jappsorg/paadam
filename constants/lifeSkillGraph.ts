export type LifeSkillDomain = 'money' | 'cooking' | 'time';

export interface LifeSkillApplication {
  id: string;
  baseSkill: string;
  lifeSkillDomain: LifeSkillDomain;
  gradeRange: string[];
  promptGuidance: string[];
  exampleContext: string;
  answerType: 'integer' | 'decimal' | 'fraction';
  locale: string;
}

export const LIFE_SKILL_DOMAINS: Record<LifeSkillDomain, { label: string; emoji: string; color: string }> = {
  money: { label: 'Money & Finance', emoji: '💰', color: '#F59E0B' },
  cooking: { label: 'Cooking & Recipes', emoji: '🍳', color: '#EF4444' },
  time: { label: 'Time & Planning', emoji: '⏰', color: '#3B82F6' },
};

export const LIFE_SKILL_GRAPH: LifeSkillApplication[] = [
  // === K-1: Money ===
  { id: 'k1-counting-money', baseSkill: 'counting', lifeSkillDomain: 'money', gradeRange: ['K', '1'],
    promptGuidance: ['Count coins in a piggy bank', 'Count dollar bills', 'Match coins to their values (penny=1c, nickel=5c, dime=10c)'],
    exampleContext: 'counting coins saved in a piggy bank', answerType: 'integer', locale: 'en-US' },

  { id: 'k1-addition-money', baseSkill: 'addition', lifeSkillDomain: 'money', gradeRange: ['K', '1'],
    promptGuidance: ['Add prices of two toys', 'Combine coins to find total', 'How much money if you have 3 nickels and 2 pennies?'],
    exampleContext: 'adding up prices at a toy store', answerType: 'integer', locale: 'en-US' },

  { id: 'k1-subtraction-cooking', baseSkill: 'subtraction', lifeSkillDomain: 'cooking', gradeRange: ['K', '1'],
    promptGuidance: ['Started with 8 cookies, ate 3 - how many left?', 'Had 10 strawberries, used 4 in a smoothie', 'Baked 6 muffins, gave away 2'],
    exampleContext: 'counting snacks left after eating some', answerType: 'integer', locale: 'en-US' },

  { id: 'k1-time-telling', baseSkill: 'time', lifeSkillDomain: 'time', gradeRange: ['K', '1'],
    promptGuidance: ['School starts at 8:00, what does the clock show?', 'Bedtime is at 7:30, what time is it now?', 'Lunch is in 1 hour, it is 11:00 now - when is lunch?'],
    exampleContext: 'reading clocks for daily routines', answerType: 'integer', locale: 'en-US' },

  { id: 'k1-comparison-money', baseSkill: 'comparison', lifeSkillDomain: 'money', gradeRange: ['K', '1'],
    promptGuidance: ['Which toy costs more?', 'Do you have enough money to buy this?', 'How much more does the robot cost than the ball?'],
    exampleContext: 'comparing toy prices at a store', answerType: 'integer', locale: 'en-US' },

  { id: 'k1-patterns-time', baseSkill: 'patterns', lifeSkillDomain: 'time', gradeRange: ['K', '1'],
    promptGuidance: ['Days of the week pattern - what day comes after Wednesday?', 'Morning routine: wake up, brush teeth, eat breakfast - what comes next?', 'Seasons repeat: spring, summer, fall, winter - what comes after winter?'],
    exampleContext: 'daily routine and calendar patterns', answerType: 'integer', locale: 'en-US' },

  // === 2-3: Money ===
  { id: '23-multidigit-money', baseSkill: 'addition', lifeSkillDomain: 'money', gradeRange: ['2', '3'],
    promptGuidance: ['Budget is $50, items cost $12, $23, and $8 - total spent?', 'Allowance is $20, spent $7 on a book - how much left?', 'Saved $15 each week for 3 weeks - total savings?'],
    exampleContext: 'managing a budget for shopping', answerType: 'integer', locale: 'en-US' },

  { id: '23-fractions-cooking', baseSkill: 'fractions', lifeSkillDomain: 'cooking', gradeRange: ['2', '3'],
    promptGuidance: ['Recipe serves 4, need to serve 2 - how much of each ingredient?', 'Cut a pizza into 8 equal slices, eat 3 - what fraction is left?', 'Recipe needs 1/2 cup flour, you have a 1/4 cup measurer - how many scoops?'],
    exampleContext: 'halving a recipe for fewer people', answerType: 'fraction', locale: 'en-US' },

  { id: '23-multiplication-money', baseSkill: 'multiplication', lifeSkillDomain: 'money', gradeRange: ['2', '3'],
    promptGuidance: ['Each pack of stickers costs $3, want 4 packs - total cost?', 'Movie tickets are $8 each, buying for 3 friends', 'Lemonade cups cost $2 each, sold 7 cups - total earned?'],
    exampleContext: 'calculating costs for multiple items', answerType: 'integer', locale: 'en-US' },

  { id: '23-elapsed-time', baseSkill: 'time', lifeSkillDomain: 'time', gradeRange: ['2', '3'],
    promptGuidance: ['Movie starts at 2:15 and ends at 4:00 - how long?', 'Started homework at 3:30, finished at 4:15 - how many minutes?', 'Soccer practice is 45 minutes, started at 5:00 - when does it end?'],
    exampleContext: 'figuring out how long activities take', answerType: 'integer', locale: 'en-US' },

  { id: '23-measurement-cooking', baseSkill: 'measurement', lifeSkillDomain: 'cooking', gradeRange: ['2', '3'],
    promptGuidance: ['Recipe needs 2 cups of milk but you only have a 1-cup measurer', 'A cake needs 350g of flour, you have 500g - how much left over?', 'Need 3/4 cup sugar, you have 1 cup - how much to remove?'],
    exampleContext: 'measuring ingredients for baking', answerType: 'integer', locale: 'en-US' },

  { id: '23-patterns-time', baseSkill: 'patterns', lifeSkillDomain: 'time', gradeRange: ['2', '3'],
    promptGuidance: ['Class schedule repeats: Math, Reading, Science - what is the 7th class?', 'Bus comes every 15 minutes starting at 8:00 - when is the 4th bus?', 'Piano practice: Mon, Wed, Fri this week - how many times in 4 weeks?'],
    exampleContext: 'schedule and calendar patterns', answerType: 'integer', locale: 'en-US' },

  // === 4-5: Money ===
  { id: '45-decimals-money', baseSkill: 'decimals', lifeSkillDomain: 'money', gradeRange: ['4', '5'],
    promptGuidance: ['Item costs $24.50, sales tax is 8% - what is the tax amount?', 'You have $50.00, items cost $12.75 and $23.50 - how much change?', 'Split a $36.60 restaurant bill equally among 3 friends'],
    exampleContext: 'calculating with real prices and tax', answerType: 'decimal', locale: 'en-US' },

  { id: '45-fractions-cooking', baseSkill: 'fractions', lifeSkillDomain: 'cooking', gradeRange: ['4', '5'],
    promptGuidance: ['Triple this recipe: 2/3 cup flour times 3', 'Recipe makes 12 cookies, you want 18 - scale the 1/4 cup butter', 'Used 3/8 of a bag of sugar, bag is 2 pounds - how many ounces used?'],
    exampleContext: 'scaling recipes up and down', answerType: 'fraction', locale: 'en-US' },

  { id: '45-multistep-money', baseSkill: 'multiplication', lifeSkillDomain: 'money', gradeRange: ['4', '5'],
    promptGuidance: ['Compare unit prices: 6-pack for $4.50 vs 10-pack for $7.00 - which is cheaper per item?', 'Budget $100 for school supplies: 3 notebooks at $4.50, 2 pens at $2.75, backpack at $35 - how much left?', 'Earn $8/hour, work 5 hours - after saving 20%, how much to spend?'],
    exampleContext: 'comparing deals and budgeting', answerType: 'decimal', locale: 'en-US' },

  { id: '45-estimation-time', baseSkill: 'estimation', lifeSkillDomain: 'time', gradeRange: ['4', '5'],
    promptGuidance: ['Flight is 4 hours 47 minutes - about how many hours?', 'You have 3 tasks: 22min, 35min, 18min - estimate total time', 'School day is 6 hours 15 minutes, recess is 45 minutes - about how many hours of class?'],
    exampleContext: 'estimating how long things take', answerType: 'integer', locale: 'en-US' },

  { id: '45-geometry-cooking', baseSkill: 'geometry', lifeSkillDomain: 'cooking', gradeRange: ['4', '5'],
    promptGuidance: ['Baking pan is 9 inches by 13 inches - what is the area?', 'Round pizza has diameter 14 inches - what is the approximate area?', 'Need to cover a 12x18 inch baking sheet with foil - how many square inches?'],
    exampleContext: 'measuring baking pans and surfaces', answerType: 'integer', locale: 'en-US' },

  { id: '45-division-time', baseSkill: 'division', lifeSkillDomain: 'time', gradeRange: ['4', '5'],
    promptGuidance: ['180 minutes of homework split equally among 4 subjects', 'Road trip is 360 miles at 60 mph - how many hours?', '24 hours in a day: 8 hours sleep, 7 hours school - what fraction is free time?'],
    exampleContext: 'dividing time among activities', answerType: 'integer', locale: 'en-US' },
];

// Query helpers
export function getApplicationsForSkill(baseSkill: string, grade: string): LifeSkillApplication[] {
  return LIFE_SKILL_GRAPH.filter(
    (app) => app.baseSkill === baseSkill && app.gradeRange.includes(grade)
  );
}

export function getApplicationsForDomain(domain: LifeSkillDomain, grade: string): LifeSkillApplication[] {
  return LIFE_SKILL_GRAPH.filter(
    (app) => app.lifeSkillDomain === domain && app.gradeRange.includes(grade)
  );
}

export function getLeastExposedDomain(
  exposure: Record<string, { timesExposed: number }>,
  validDomains: LifeSkillDomain[],
): LifeSkillDomain {
  let leastDomain = validDomains[0];
  let leastCount = Infinity;
  for (const domain of validDomains) {
    const count = exposure[domain]?.timesExposed ?? 0;
    if (count < leastCount) {
      leastCount = count;
      leastDomain = domain;
    }
  }
  return leastDomain;
}
