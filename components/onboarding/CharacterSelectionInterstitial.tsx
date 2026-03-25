/**
 * Character Selection Interstitial
 *
 * Shown when a parent-added child has no selectedCharacterId.
 * Wraps the existing CharacterSelection component and persists the choice.
 */

import React from "react";
import CharacterSelection from "./CharacterSelection";
import { studentProfileService } from "@/services/StudentProfileService";

interface CharacterSelectionInterstitialProps {
  studentId: string;
  studentName: string;
  refreshStudentProfiles: () => Promise<void>;
}

export default function CharacterSelectionInterstitial({
  studentId,
  studentName,
  refreshStudentProfiles,
}: CharacterSelectionInterstitialProps) {
  const handleCharacterSelected = async (characterId: string) => {
    console.log(
      "[CharacterSelectionInterstitial] Character selected:",
      characterId,
      "for student:",
      studentId,
    );
    await studentProfileService.updateProfile(studentId, {
      selectedCharacterId: characterId,
    });
    await refreshStudentProfiles();
  };

  return (
    <CharacterSelection
      onCharacterSelected={handleCharacterSelected}
      studentName={studentName}
    />
  );
}
