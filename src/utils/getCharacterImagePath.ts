import JerryIcon from "$lib/assets/characters/JerryIcon.jpg"
import GeorgeIcon from "$lib/assets/characters/GeorgeIcon.jpg"
import ElaineIcon from "$lib/assets/characters/ElaineIcon.jpg"
import KramerIcon from "$lib/assets/characters/KramerIcon.jpg"
import LoverInterestIcon from "$lib/assets/characters/LoveInterestIcon.jpg"
import FriendIcon from "$lib/assets/characters/FriendIcon.jpg"
import NeighbourIcon from "$lib/assets/characters/NeighbourIcon.jpg"
import ColleagueIcon from "$lib/assets/characters/ColleagueIcon.jpg"
import JerryFamilyIcon from "$lib/assets/characters/JerryFamilyIcon.jpg"
import GeorgeFamilyIcon from "$lib/assets/characters/GeorgeFamilyIcon.jpg"
import ElaineFamilyIcon from "$lib/assets/characters/ElaineFamilyIcon.jpg"
import KramerFamilyIcon from "$lib/assets/characters/KramerFamilyIcon.jpg"
import OtherPersonIcon from "$lib/assets/characters/OtherPersonIcon.jpg"

export const getCharacterImagePath = (id: string) => {
  switch (id) {
    case "JERRY":
      return JerryIcon;
    case "GEORGE":
      return GeorgeIcon;
    case "ELAINE":
      return ElaineIcon;
    case "KRAMER":
      return KramerIcon;
    case "Love interest":
      return LoverInterestIcon;
    case "Friend/Acquaintance":
      return FriendIcon;
    case "Neighbour":
      return NeighbourIcon;
    case "Work colleague":
      return ColleagueIcon;
    case "Jerry's family":
      return JerryFamilyIcon;
    case "George's family":
      return GeorgeFamilyIcon;
    case "Elaine's family":
      return ElaineFamilyIcon;
    case "Kramer's family":
      return KramerFamilyIcon;
    case "Other":
      return OtherPersonIcon;
    default:
      return null;
  }
}