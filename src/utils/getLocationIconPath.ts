import JerryHome from '$lib/assets/locations/JerryHome.png';
import GeorgeHome from '$lib/assets/locations/GeorgesHome.png';
import ElaineHome from '$lib/assets/locations/ElaineHome.png';
import KramerHome from '$lib/assets/locations/KramerHome.png';
import FamilyHome from '$lib/assets/locations/OtherFamilyHome.png';
import Diner from '$lib/assets/locations/Diner.png';
import PlaceOfLeisure from '$lib/assets/locations/PlaceOfLeisure.png';
import Workplace from '$lib/assets/locations/Workplace.png';
import Transport from '$lib/assets/locations/Transport.png';
import Outside from '$lib/assets/locations/Outside.png';
import OtherLocation from '$lib/assets/locations/OtherLocation.png';

export const getLocationIconPath = (id: string) => {
  switch (id) {
    case "Jerry's home":
      return JerryHome;
    case "George's home":
      return GeorgeHome;
    case "Elaine's home":
      return ElaineHome;
    case "Kramer's home":
      return KramerHome;
    case 'Other family home':
      return FamilyHome;
    case 'Diner':
      return Diner;
    case 'Place of leisure':
      return PlaceOfLeisure;
    case 'Workplace':
      return Workplace;
    case 'Transport':
      return Transport;
    case 'Outside':
      return Outside;
    default:
      return OtherLocation;
  }
};
