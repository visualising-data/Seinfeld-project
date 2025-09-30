import JerryHome from "$lib/assets/locations/JerryHome.svg"
import JerryHomeSmall from "$lib/assets/locations/JerryHomeSmall.svg"
import GeorgeHome from "$lib/assets/locations/GeorgeHome.svg";
import GeorgeHomeSmall from "$lib/assets/locations/GeorgeHomeSmall.svg";
import ElaineHome from "$lib/assets/locations/ElaineHome.svg";
import ElaineHomeSmall from "$lib/assets/locations/ElaineHomeSmall.svg";
import KramerHome from "$lib/assets/locations/KramerHome.svg";
import KramerHomeSmall from "$lib/assets/locations/KramerHomeSmall.svg";
import FamilyHome from "$lib/assets/locations/FamilyHome.svg";
import FamilyHomeSmall from "$lib/assets/locations/FamilyHomeSmall.svg";
import Diner from "$lib/assets/locations/Diner.svg";
import DinerSmall from "$lib/assets/locations/DinerSmall.svg";
import PlaceOfLeisure from "$lib/assets/locations/PlaceOfLeisure.svg";
import PlaceOfLeisureSmall from "$lib/assets/locations/PlaceOfLeisureSmall.svg";
import Workplace from "$lib/assets/locations/Workplace.svg";
import WorkplaceSmall from "$lib/assets/locations/WorkplaceSmall.svg";
import Transport from "$lib/assets/locations/Transport.svg";
import TransportSmall from "$lib/assets/locations/TransportSmall.svg";
import Outside from "$lib/assets/locations/Outside.svg";
import OutsideSmall from "$lib/assets/locations/OutsideSmall.svg";
import OtherLocation from "$lib/assets/locations/OtherLocation.svg";
import OtherLocationSmall from "$lib/assets/locations/OtherLocationSmall.svg";

export const getLocationIconPath = (id: string, isSmall: boolean = false) => {
  switch (id) {
    case "Jerry's home":
      return isSmall ? JerryHomeSmall : JerryHome;
    case "George's home":
      return isSmall ? GeorgeHomeSmall : GeorgeHome;
    case "Elaine's home":
      return isSmall ? ElaineHomeSmall : ElaineHome;
    case "Kramer's home":
      return isSmall ? KramerHomeSmall : KramerHome;
    case "Other family home":
      return isSmall ? FamilyHomeSmall : FamilyHome;
    case "Diner":
      return isSmall ? DinerSmall : Diner;
    case "Place of leisure":
      return isSmall ? PlaceOfLeisureSmall : PlaceOfLeisure;
    case "Workplace":
      return isSmall ? WorkplaceSmall : Workplace;
    case "Transport":
      return isSmall ? TransportSmall : Transport;
    case "Outside":
      return isSmall ? OutsideSmall : Outside;
    default:
      return isSmall ? OtherLocationSmall : OtherLocation;
  }
}