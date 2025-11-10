import JerryHome from "$lib/assets/locations/JerryHome.jpg"
import GeorgeHome from "$lib/assets/locations/GeorgeHome.jpg";
import ElaineHome from "$lib/assets/locations/ElaineHome.jpg";
import KramerHome from "$lib/assets/locations/KramerHome.jpg";
import FamilyHome from "$lib/assets/locations/FamilyHome.jpg";
import Diner from "$lib/assets/locations/Diner.jpg";
import PlaceOfLeisure from "$lib/assets/locations/PlaceOfLeisure.jpg";
import Workplace from "$lib/assets/locations/Workplace.jpg";
import Transport from "$lib/assets/locations/Transport.jpg";
import Outside from "$lib/assets/locations/Outside.jpg";
import OtherLocation from "$lib/assets/locations/OtherLocation.jpg";

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
    case "Other family home":
      return FamilyHome;
    case "Diner":
      return Diner;
    case "Place of leisure":
      return PlaceOfLeisure;
    case "Workplace":
      return Workplace;
    case "Transport":
      return Transport;
    case "Outside":
      return Outside;
    default:
      return OtherLocation;
  }
}