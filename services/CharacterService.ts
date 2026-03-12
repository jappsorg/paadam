/**
 * Character Service
 *
 * Manages character companions and their metadata
 */

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;

  // Visual assets
  baseImage: string;
  emotionalStates: {
    [emotion: string]: string; // emotion -> image path
  };
  animations: {
    [animation: string]: string; // animation -> image/lottie path
  };

  // Evolution stages
  evolutions: Array<{
    level: number;
    name: string;
    image: string;
    unlockMessage: string;
  }>;

  // Accessories
  accessories: Array<{
    id: string;
    name: string;
    image: string;
    unlockRequirement: {
      type: "level" | "achievement" | "purchase";
      value: any;
    };
  }>;

  // Personality traits (affects teaching style)
  traits: {
    energyLevel: "calm" | "moderate" | "energetic";
    encouragementStyle: "gentle" | "enthusiastic" | "motivational";
    explanationStyle: "step-by-step" | "visual" | "conversational" | "logical";
    humorLevel: "serious" | "occasional" | "playful";
  };

  // Audio
  voiceId?: string; // for text-to-speech
  soundEffects?: {
    [action: string]: string;
  };
}

export class CharacterService {
  private static readonly characters: Character[] = [
    {
      id: "ada",
      name: "Ada",
      description: "A wise owl who loves patterns and logic",
      personality:
        "Calm, methodical, and encouraging. Ada breaks down complex problems into simple steps.",

      baseImage: "characters/ada/base.png",
      emotionalStates: {
        neutral: "characters/ada/neutral.png",
        happy: "characters/ada/happy.png",
        excited: "characters/ada/excited.png",
        thinking: "characters/ada/thinking.png",
        encouraging: "characters/ada/encouraging.png",
        celebrating: "characters/ada/celebrating.png",
      },
      animations: {
        idle: "characters/ada/animations/idle.json",
        thinking: "characters/ada/animations/thinking.json",
        celebrating: "characters/ada/animations/celebrating.json",
        explaining: "characters/ada/animations/explaining.json",
        encouraging: "characters/ada/animations/encouraging.json",
        transition: "characters/ada/animations/transition.json",
      },

      evolutions: [
        {
          level: 1,
          name: "Young Ada",
          image: "characters/ada/evolution/stage1.png",
          unlockMessage: "Ada is ready to learn with you!",
        },
        {
          level: 10,
          name: "Wise Ada",
          image: "characters/ada/evolution/stage2.png",
          unlockMessage: "Ada has grown wiser with you!",
        },
        {
          level: 25,
          name: "Master Ada",
          image: "characters/ada/evolution/stage3.png",
          unlockMessage: "Ada has become a true master!",
        },
      ],

      accessories: [
        {
          id: "ada-reading-glasses",
          name: "Reading Glasses",
          image: "characters/ada/accessories/glasses.png",
          unlockRequirement: { type: "level", value: 5 },
        },
        {
          id: "ada-professor-hat",
          name: "Professor Hat",
          image: "characters/ada/accessories/hat.png",
          unlockRequirement: { type: "achievement", value: "problem-solver" },
        },
      ],

      traits: {
        energyLevel: "calm",
        encouragementStyle: "gentle",
        explanationStyle: "step-by-step",
        humorLevel: "occasional",
      },
    },

    {
      id: "max",
      name: "Max",
      description: "An energetic puppy who makes learning fun",
      personality:
        "Enthusiastic, playful, and motivational. Max celebrates every win with you!",

      baseImage: "characters/max/base.png",
      emotionalStates: {
        neutral: "characters/max/neutral.png",
        happy: "characters/max/happy.png",
        excited: "characters/max/excited.png",
        playful: "characters/max/playful.png",
        encouraging: "characters/max/encouraging.png",
        celebrating: "characters/max/celebrating.png",
      },
      animations: {
        idle: "characters/max/animations/idle.json",
        jumping: "characters/max/animations/jumping.json",
        celebrating: "characters/max/animations/celebrating.json",
        wagging: "characters/max/animations/wagging.json",
        encouraging: "characters/max/animations/encouraging.json",
        transition: "characters/max/animations/transition.json",
      },

      evolutions: [
        {
          level: 1,
          name: "Puppy Max",
          image: "characters/max/evolution/stage1.png",
          unlockMessage: "Max is ready to play and learn!",
        },
        {
          level: 10,
          name: "Grown Max",
          image: "characters/max/evolution/stage2.png",
          unlockMessage: "Max has grown up with you!",
        },
        {
          level: 25,
          name: "Super Max",
          image: "characters/max/evolution/stage3.png",
          unlockMessage: "Max is now super powered!",
        },
      ],

      accessories: [
        {
          id: "max-bandana",
          name: "Cool Bandana",
          image: "characters/max/accessories/bandana.png",
          unlockRequirement: { type: "level", value: 5 },
        },
        {
          id: "max-cape",
          name: "Super Cape",
          image: "characters/max/accessories/cape.png",
          unlockRequirement: { type: "achievement", value: "speed-demon" },
        },
      ],

      traits: {
        energyLevel: "energetic",
        encouragementStyle: "enthusiastic",
        explanationStyle: "conversational",
        humorLevel: "playful",
      },
    },

    {
      id: "luna",
      name: "Luna",
      description: "A creative cat who loves visual learning",
      personality:
        "Creative, patient, and artistic. Luna uses drawings and visuals to explain concepts.",

      baseImage: "characters/luna/base.png",
      emotionalStates: {
        neutral: "characters/luna/neutral.png",
        happy: "characters/luna/happy.png",
        curious: "characters/luna/curious.png",
        thinking: "characters/luna/thinking.png",
        encouraging: "characters/luna/encouraging.png",
        celebrating: "characters/luna/celebrating.png",
      },
      animations: {
        idle: "characters/luna/animations/idle.json",
        drawing: "characters/luna/animations/drawing.json",
        celebrating: "characters/luna/animations/celebrating.json",
        thinking: "characters/luna/animations/thinking.json",
        encouraging: "characters/luna/animations/encouraging.json",
        transition: "characters/luna/animations/transition.json",
      },

      evolutions: [
        {
          level: 1,
          name: "Young Luna",
          image: "characters/luna/evolution/stage1.png",
          unlockMessage: "Luna is ready to create with you!",
        },
        {
          level: 10,
          name: "Artist Luna",
          image: "characters/luna/evolution/stage2.png",
          unlockMessage: "Luna has become an artist!",
        },
        {
          level: 25,
          name: "Master Luna",
          image: "characters/luna/evolution/stage3.png",
          unlockMessage: "Luna is a true creative master!",
        },
      ],

      accessories: [
        {
          id: "luna-beret",
          name: "Artist Beret",
          image: "characters/luna/accessories/beret.png",
          unlockRequirement: { type: "level", value: 5 },
        },
        {
          id: "luna-paintbrush",
          name: "Magic Paintbrush",
          image: "characters/luna/accessories/paintbrush.png",
          unlockRequirement: { type: "achievement", value: "creative-thinker" },
        },
      ],

      traits: {
        energyLevel: "calm",
        encouragementStyle: "gentle",
        explanationStyle: "visual",
        humorLevel: "occasional",
      },
    },
  ];

  /**
   * Get all available characters
   */
  static getAllCharacters(): Character[] {
    return this.characters;
  }

  /**
   * Get character by ID
   */
  static getCharacterById(characterId: string): Character | null {
    return this.characters.find((c) => c.id === characterId) || null;
  }

  /**
   * Get recommended character based on student preferences
   */
  static getRecommendedCharacter(preferences?: {
    energyPreference?: "calm" | "energetic";
    visualLearner?: boolean;
    needsEncouragement?: boolean;
  }): Character {
    if (!preferences) {
      return this.characters[0]; // Default to Ada
    }

    // Simple recommendation logic
    if (preferences.visualLearner) {
      return this.getCharacterById("luna")!;
    }

    if (preferences.energyPreference === "energetic") {
      return this.getCharacterById("max")!;
    }

    if (preferences.energyPreference === "calm") {
      return this.getCharacterById("ada")!;
    }

    return this.characters[0];
  }

  /**
   * Get character evolution for current level
   */
  static getCharacterEvolution(characterId: string, level: number): any {
    const character = this.getCharacterById(characterId);
    if (!character) return null;

    // Find the highest evolution stage unlocked
    const unlocked = character.evolutions
      .filter((evo) => level >= evo.level)
      .sort((a, b) => b.level - a.level);

    return unlocked[0] || character.evolutions[0];
  }

  /**
   * Get unlocked accessories for character
   */
  static getUnlockedAccessories(
    characterId: string,
    studentLevel: number,
    achievements: string[],
  ): any[] {
    const character = this.getCharacterById(characterId);
    if (!character) return [];

    return character.accessories.filter((accessory) => {
      if (accessory.unlockRequirement.type === "level") {
        return studentLevel >= accessory.unlockRequirement.value;
      }
      if (accessory.unlockRequirement.type === "achievement") {
        return achievements.includes(accessory.unlockRequirement.value);
      }
      return false;
    });
  }
}

export default CharacterService;
