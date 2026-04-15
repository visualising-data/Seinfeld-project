<script>
  import { mean } from 'd3-array';

  import { locations } from '$lib/data/locations';
  import { seasons } from '$lib/data/seasons';

  import SectionTitle from '../SectionTitle.svelte';
  import Intro from './Intro.svelte';
  import Marimekko from './Marimekko.svelte';
  import ScreenTimeVsLaughRate from '../ScreenTimeVsLaughRate/ScreenTimeVsLaughRate.svelte';
  import Alluvial from './Alluvial.svelte';

  let { episodesData } = $props();

  // $inspect('locations', locations);
  // $inspect(episodesData);

  // let locationsData = $derived.by(() => {
  //   const locationsArray = [];

  //   locations.forEach((loc) => {
  //     const episodes = structuredClone(episodesData);

  //     episodes.forEach((ep) => {
  //       const allLocations = ep.data.filter((d) => d.eventCategory === 'LOCATION');
  //       const currentLocation = allLocations.filter((d) => d.eventAttribute === loc.id);

  //       ep['allLocations'] = allLocations;
  //       ep['currentLocation'] = currentLocation;
  //       ep['locationScreentimeShare'] = currentLocation.length / allLocations.length;
  //     });

  //     locationsArray.push({
  //       id: loc.id,
  //       label: loc.label,
  //       episodesData: episodes,
  //     });
  //   });

  //   return locationsArray;
  // });

  // const avgScreentimeSharePerSeason = $derived.by(() => {
  //   const locationsArray = [];

  //   locations.forEach((loc) => {
  //     const seasonsArray = [];
  //     const data = locationsData.find((l) => l.id === loc.id).episodesData;

  //     seasons.forEach((s) => {
  //       const seasonData = data.filter((d) => d.season === s.seasonNum);
  //       seasonsArray.push({
  //         season: s.seasonNum,
  //         avgScreenTimeShare: mean(seasonData, (d) => d.locationScreentimeShare),
  //       });
  //     });

  //     locationsArray.push({
  //       id: loc.id,
  //       label: loc.label,
  //       seasons: seasonsArray,
  //     });
  //   });

  //   return locationsArray;
  // });

  // $inspect('locationsData', locationsData);
  // $inspect('avgScreentimeSharePerSeason', avgScreentimeSharePerSeason);
</script>

<section id="locations">
  <div class="bg-black">
    <SectionTitle section="locations" title="Locations" />
  </div>
  <Intro />
  <ScreenTimeVsLaughRate {episodesData} currentSection="locations" />
  <Marimekko />
  <Alluvial />
</section>
