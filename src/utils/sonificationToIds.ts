export const getCharacterId = (sonificationId: string) => {
  switch (sonificationId) {
    case 'Jerry':
      return ['JERRY'];
    case 'George':
      return ['GEORGE'];
    case 'Elaine':
      return ['ELAINE'];
    case 'Kramer':
      return ['KRAMER'];
    case 'FNC':
      return ['Friend/Acquaintance', 'Neighbour', 'Work colleague'];
    case 'LoveInterest':
      return ['Love interest'];
    case 'Families':
      return ["Jerry's family", "George's family", "Elaine's family", "Kramer's family"];
    case 'Situation':
      return ['The situation'];
    default:
      return 'Other';
  }
};

export const getLocationId = (sonificationId: string) => {
  switch (sonificationId) {
    case 'CharacterHome':
      return ["Jerry's home", "George's home", "Elaine's home", "Kramer's home"];
    case 'Diner':
      return ['Diner'];
    case 'Leisure':
      return ["Place of leisure"];
    case 'OtherFamilyHome':
      return ["Other family home"];
    case 'Outside':
      return ["Outside"];
    case 'Transport':
      return ["Transport"];
    case 'Workplace':
      return ["Workplace"];
    default:
      return ['Other location'];
  }
}